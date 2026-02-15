import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Helper: Extract video ID from various YouTube URL formats ───
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Helper: Fetch real transcript via YouTube Innertube API ───
async function fetchYouTubeTranscript(videoId: string): Promise<{ transcript: string; title: string }> {
  // Step 1: Get player data with caption tracks
  const playerResp = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context: {
        client: {
          hl: "pt",
          gl: "BR",
          clientName: "WEB",
          clientVersion: "2.20240101.00.00",
        },
      },
      videoId,
    }),
  });

  if (!playerResp.ok) {
    throw new Error("Falha ao acessar dados do vídeo no YouTube");
  }

  const playerData = await playerResp.json();

  const title = playerData?.videoDetails?.title || "Vídeo do YouTube";
  const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("Este vídeo não possui legendas disponíveis (nem manuais nem automáticas). Não é possível extrair a transcrição.");
  }

  // Step 2: Pick best caption track (pt > en > first available)
  let selectedTrack = captionTracks.find((t: any) => t.languageCode?.startsWith("pt"));
  if (!selectedTrack) {
    selectedTrack = captionTracks.find((t: any) => t.languageCode?.startsWith("en"));
  }
  if (!selectedTrack) {
    selectedTrack = captionTracks[0];
  }

  const captionUrl = selectedTrack.baseUrl;
  if (!captionUrl) {
    throw new Error("URL de legendas não encontrada para este vídeo");
  }

  console.log(`[extract-youtube] Using caption track: ${selectedTrack.languageCode} (${selectedTrack.name?.simpleText || "auto"})`);

  // Step 3: Download caption XML
  const captionResp = await fetch(captionUrl);
  if (!captionResp.ok) {
    throw new Error("Falha ao baixar legendas do vídeo");
  }
  const captionXml = await captionResp.text();

  // Step 4: Parse XML to plain text
  const transcript = parseTranscriptXml(captionXml);

  if (!transcript || transcript.trim().length < 50) {
    throw new Error("Legendas encontradas mas com conteúdo insuficiente para extrair transcrição");
  }

  return { transcript, title };
}

// ─── Helper: Parse YouTube caption XML to plain text ───
function parseTranscriptXml(xml: string): string {
  const segments: string[] = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    let text = match[1];
    // Decode HTML entities
    text = text.replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/\n/g, " ")
      .trim();
    if (text) segments.push(text);
  }
  return segments.join(" ");
}

// ─── Main handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth user
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const userRole = roleData?.role || "free";
    if (userRole === "free") {
      return new Response(
        JSON.stringify({ error: "Esta funcionalidade está disponível apenas para assinantes Pro e Team." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check quota
    const quotaLimits: Record<string, number> = { pro: 5, team: 20, admin: 9999 };
    const maxCaptures = quotaLimits[userRole] || 0;

    const { data: quotaData } = await supabaseAdmin
      .from("usage_quotas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (quotaData && quotaData.live_captures_used >= maxCaptures) {
      return new Response(
        JSON.stringify({ error: "Você atingiu o limite mensal de captações. Faça upgrade para continuar." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { youtubeUrl, instructions } = await req.json();

    if (!youtubeUrl || typeof youtubeUrl !== "string") {
      return new Response(JSON.stringify({ error: "URL do YouTube é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "URL do YouTube inválida. Use youtube.com/watch, youtu.be, youtube.com/live ou youtube.com/shorts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[extract-youtube] Processing video: ${videoId} for user: ${user.id}`);

    // ─── STEP 1: Fetch REAL transcript from YouTube ───
    let transcript: string;
    let videoTitle: string;
    try {
      const result = await fetchYouTubeTranscript(videoId);
      transcript = result.transcript;
      videoTitle = result.title;
      console.log(`[extract-youtube] Transcript fetched: ${transcript.length} chars, title: "${videoTitle}"`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao buscar legendas do vídeo";
      console.error(`[extract-youtube] Transcript fetch failed:`, msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── STEP 2: Save transcript to sermons table ───
    const { data: sermonData, error: sermonError } = await supabaseAdmin
      .from("sermons")
      .insert({
        user_id: user.id,
        transcript,
        status: "completed",
      })
      .select("id")
      .single();

    if (sermonError) {
      console.error("[extract-youtube] Sermon insert error:", sermonError);
      return new Response(JSON.stringify({ error: "Erro ao salvar transcrição" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[extract-youtube] Sermon saved: ${sermonData.id}`);

    // ─── STEP 3: Use AI to ANALYZE the real transcript ───
    const truncatedTranscript = transcript.length > 15000 ? transcript.substring(0, 15000) + "..." : transcript;

    const userPrompt = instructions
      ? `Analise a seguinte transcrição REAL de um vídeo do YouTube intitulado "${videoTitle}".\n\nInstruções adicionais: ${instructions}\n\nTRANSCRIÇÃO:\n${truncatedTranscript}`
      : `Analise a seguinte transcrição REAL de um vídeo do YouTube intitulado "${videoTitle}".\n\nTRANSCRIÇÃO:\n${truncatedTranscript}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um assistente que analisa transcrições reais de vídeos do YouTube para igrejas e ministérios.

Você recebeu a transcrição REAL extraída das legendas do vídeo. Sua tarefa é APENAS estruturar e resumir o conteúdo.

Retorne SEMPRE um JSON válido com a seguinte estrutura:
{
  "titulo": "Título da mensagem/pregação",
  "resumo": "Resumo de 2-3 parágrafos da mensagem...",
  "pontos_principais": ["ponto 1", "ponto 2", "ponto 3"],
  "versiculos_citados": ["Referência 1", "Referência 2"],
  "aplicacoes_praticas": ["Aplicação 1", "Aplicação 2"],
  "tema_central": "Tema principal da mensagem"
}

IMPORTANTE:
- NÃO invente dados. Use APENAS o que está na transcrição.
- Se algum campo não tiver informação na transcrição, use array vazio [] ou string descritiva.
- O título deve refletir o conteúdo real da transcrição.`,
          },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    let summary = "";
    let parsedContent: any = null;

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const rawContent = aiData.choices?.[0]?.message?.content;

      if (rawContent) {
        try {
          const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawContent;
          parsedContent = JSON.parse(jsonStr);
          summary = parsedContent.resumo || rawContent.substring(0, 500);
        } catch {
          summary = rawContent.substring(0, 500);
          parsedContent = {
            titulo: videoTitle,
            resumo: summary,
            pontos_principais: [],
            versiculos_citados: [],
            aplicacoes_praticas: [],
            tema_central: "Extraído do YouTube",
          };
        }
      }
    } else {
      console.error("[extract-youtube] AI analysis failed, continuing without summary");
      parsedContent = {
        titulo: videoTitle,
        resumo: "Resumo não disponível - transcrição salva com sucesso.",
        pontos_principais: [],
        versiculos_citados: [],
        aplicacoes_praticas: [],
        tema_central: "Extraído do YouTube",
      };
      summary = parsedContent.resumo;
    }

    // Update sermon with summary
    await supabaseAdmin
      .from("sermons")
      .update({ summary })
      .eq("id", sermonData.id);

    // ─── STEP 4: Save structured content to content_library ───
    const contentTitle = parsedContent?.titulo || videoTitle;

    const { data: contentData, error: insertError } = await supabaseAdmin
      .from("content_library")
      .insert({
        user_id: user.id,
        title: contentTitle,
        content_type: "resumo_pregacao",
        source_type: "youtube",
        content: parsedContent,
        prompt_original: `YouTube: ${youtubeUrl}${instructions ? ` | ${instructions}` : ""}`,
        status: "draft",
        tags: ["youtube", "transcrição"],
        sermon_id: sermonData.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[extract-youtube] Content insert error:", insertError);
      // Sermon was saved successfully, return that at least
      return new Response(
        JSON.stringify({ sermon_id: sermonData.id, content_id: null, title: contentTitle }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment quota
    const currentCaptures = quotaData?.live_captures_used || 0;
    await supabaseAdmin
      .from("usage_quotas")
      .update({ live_captures_used: currentCaptures + 1 })
      .eq("user_id", user.id);

    console.log(`[extract-youtube] Done. Sermon: ${sermonData.id}, Content: ${contentData.id}`);

    return new Response(
      JSON.stringify({ sermon_id: sermonData.id, content_id: contentData.id, title: contentTitle }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[extract-youtube] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
