import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const browserHeaders: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Cookie": "CONSENT=PENDING+987; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg",
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

// ─── Get video metadata via oEmbed (always works) ───
async function getVideoMetadata(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (resp.ok) {
      const data = await resp.json();
      return { title: data.title || "Vídeo do YouTube", author: data.author_name || "" };
    }
  } catch (_) { /* ignore */ }
  return { title: "Vídeo do YouTube", author: "" };
}

// ─── Layer 1: Try scraping approaches for captions ───
async function tryScrapingCaptions(videoId: string): Promise<string | null> {
  // Try embed page
  try {
    console.log(`[extract-youtube] Scraping: Trying embed page`);
    const embedResp = await fetch(`https://www.youtube.com/embed/${videoId}`, { headers: browserHeaders });
    if (embedResp.ok) {
      const html = await embedResp.text();
      if (html.includes('"captionTracks"')) {
        const idx = html.indexOf('"captionTracks"');
        const bracketStart = html.indexOf('[', idx);
        if (bracketStart !== -1) {
          let depth = 0, end = bracketStart;
          for (let i = bracketStart; i < html.length; i++) {
            if (html[i] === '[') depth++;
            else if (html[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
          }
          const tracks = JSON.parse(html.substring(bracketStart, end + 1));
          const transcript = await downloadCaptionTrack(tracks);
          if (transcript) return transcript;
        }
      }
    }
  } catch (e) {
    console.log(`[extract-youtube] Scraping embed failed: ${e}`);
  }

  // Try watch page with consent bypass
  try {
    console.log(`[extract-youtube] Scraping: Trying watch page`);
    const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=pt&gl=BR&has_verified=1&bpctr=9999999999`, {
      headers: {
        ...browserHeaders,
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Cookie": "CONSENT=YES+cb.20210328-17-p0.en+FX+987; SOCS=CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3AxGgJwdCACGgYIgOi_pgY",
      },
    });
    if (pageResp.ok) {
      const html = await pageResp.text();
      console.log(`[extract-youtube] Watch page length: ${html.length}, hasCaptions: ${html.includes('"captionTracks"')}`);
      if (html.includes('"captionTracks"')) {
        const idx = html.indexOf('"captionTracks"');
        const bracketStart = html.indexOf('[', idx);
        if (bracketStart !== -1) {
          let depth = 0, end = bracketStart;
          for (let i = bracketStart; i < html.length; i++) {
            if (html[i] === '[') depth++;
            else if (html[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
          }
          const tracks = JSON.parse(html.substring(bracketStart, end + 1));
          const transcript = await downloadCaptionTrack(tracks);
          if (transcript) return transcript;
        }
      }
    }
  } catch (e) {
    console.log(`[extract-youtube] Scraping watch failed: ${e}`);
  }

  // Try Innertube API
  try {
    console.log(`[extract-youtube] Scraping: Trying Innertube API`);
    const resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...browserHeaders },
      body: JSON.stringify({
        context: { client: { hl: "pt", gl: "BR", clientName: "WEB", clientVersion: "2.20250210.01.00" } },
        videoId,
      }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      console.log(`[extract-youtube] Innertube: playability=${data?.playabilityStatus?.status}, tracks=${tracks?.length || 0}`);
      if (tracks && tracks.length > 0) {
        const transcript = await downloadCaptionTrack(tracks);
        if (transcript) return transcript;
      }
    }
  } catch (e) {
    console.log(`[extract-youtube] Innertube failed: ${e}`);
  }

  // Try direct timedtext API
  try {
    console.log(`[extract-youtube] Scraping: Trying timedtext API`);
    for (const lang of ["pt", "pt-BR", "en", ""]) {
      for (const kind of ["asr", ""]) {
        const params = new URLSearchParams({ v: videoId, fmt: "srv1", ...(lang ? { lang } : {}), ...(kind ? { kind } : {}) });
        const resp = await fetch(`https://www.youtube.com/api/timedtext?${params}`, { headers: browserHeaders });
        if (resp.ok) {
          const xml = await resp.text();
          if (xml.includes("<text") && xml.length > 100) {
            const transcript = parseTranscriptXml(xml);
            if (transcript && transcript.length > 50) {
              console.log(`[extract-youtube] Timedtext worked (lang=${lang}, kind=${kind}): ${transcript.length} chars`);
              return transcript;
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(`[extract-youtube] Timedtext failed: ${e}`);
  }

  return null;
}

// ─── Helper: Download best caption track ───
async function downloadCaptionTrack(tracks: any[]): Promise<string | null> {
  let selected = tracks.find((t: any) => t.languageCode?.startsWith("pt"));
  if (!selected) selected = tracks.find((t: any) => t.languageCode?.startsWith("en"));
  if (!selected) selected = tracks[0];
  
  if (!selected?.baseUrl) return null;
  
  console.log(`[extract-youtube] Downloading caption track: ${selected.languageCode}`);
  const resp = await fetch(selected.baseUrl, { headers: browserHeaders });
  if (!resp.ok) return null;
  
  const xml = await resp.text();
  const transcript = parseTranscriptXml(xml);
  return transcript && transcript.length > 50 ? transcript : null;
}

// ─── Layer 2: Use Gemini to transcribe video directly ───
async function transcribeWithGemini(videoId: string, videoTitle: string, lovableApiKey: string): Promise<string> {
  console.log(`[extract-youtube] Gemini: Transcribing video ${videoId} directly`);
  
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        {
          role: "system",
          content: `Você é um transcritor profissional. Sua tarefa é transcrever FIELMENTE o conteúdo falado no vídeo do YouTube fornecido.

REGRAS ABSOLUTAS:
- Transcreva APENAS o que é realmente falado no vídeo
- NÃO invente, NÃO adivinhe, NÃO complete com conteúdo que não está no vídeo
- Se não conseguir acessar o vídeo, responda EXATAMENTE: "ERRO: Não foi possível acessar o vídeo"
- Se o vídeo não tiver áudio compreensível, responda: "ERRO: Áudio não compreensível"
- Inclua pausas significativas como [pausa]
- Mantenha o idioma original do falante
- A transcrição deve ser o texto corrido do que é falado, sem timestamps`,
        },
        {
          role: "user",
          content: `Transcreva fielmente todo o conteúdo falado neste vídeo do YouTube: ${youtubeUrl}

Título do vídeo: "${videoTitle}"

Retorne APENAS a transcrição do que é falado, sem comentários adicionais.`,
        },
      ],
      max_tokens: 16000,
      temperature: 0.1,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    console.error(`[extract-youtube] Gemini transcription failed: ${resp.status} - ${errBody.substring(0, 200)}`);
    throw new Error(`Gemini transcription failed: ${resp.status}`);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Gemini returned empty response");
  }

  // Check for error markers
  if (content.startsWith("ERRO:")) {
    throw new Error(content);
  }

  // Validate minimum length
  if (content.length < 100) {
    throw new Error(`Gemini transcript too short (${content.length} chars), likely incomplete`);
  }

  console.log(`[extract-youtube] Gemini transcription: ${content.length} chars`);
  return content;
}

// ─── Main transcript fetcher ───
async function fetchYouTubeTranscript(videoId: string, lovableApiKey: string): Promise<{ transcript: string; title: string }> {
  // Always get metadata first (reliable)
  const metadata = await getVideoMetadata(videoId);
  console.log(`[extract-youtube] Video metadata: title="${metadata.title}", author="${metadata.author}"`);

  // Try scraping approaches first (most accurate)
  const scrapedTranscript = await tryScrapingCaptions(videoId);
  if (scrapedTranscript) {
    console.log(`[extract-youtube] Got transcript via scraping: ${scrapedTranscript.length} chars`);
    return { transcript: scrapedTranscript, title: metadata.title };
  }

  // Fallback: Use Gemini to transcribe directly
  console.log(`[extract-youtube] All scraping methods failed. Using Gemini to transcribe video directly.`);
  const geminiTranscript = await transcribeWithGemini(videoId, metadata.title, lovableApiKey);
  return { transcript: geminiTranscript, title: metadata.title };
}

// ─── Helper: Parse YouTube caption XML to plain text ───
function parseTranscriptXml(xml: string): string {
  const segments: string[] = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    let text = match[1];
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
      const result = await fetchYouTubeTranscript(videoId, lovableApiKey);
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

Retorne SEMPRE um JSON válido com EXATAMENTE esta estrutura:
{
  "titulo": "Título da mensagem/pregação",
  "introducao": "Parágrafo introdutório contextualizando a mensagem (2-4 frases)",
  "pontos_principais": [
    { "numero": 1, "titulo": "Título curto do ponto", "conteudo": "Explicação detalhada do ponto (2-3 frases)" },
    { "numero": 2, "titulo": "Título curto do ponto", "conteudo": "Explicação detalhada do ponto (2-3 frases)" }
  ],
  "conclusao": "Parágrafo de conclusão da mensagem",
  "aplicacao_pratica": "Como aplicar esta mensagem no dia a dia (texto corrido, 2-3 frases)",
  "fundamento_biblico": {
    "versiculos": ["João 3:16 - Porque Deus amou o mundo...", "Salmos 23:1 - O Senhor é meu pastor..."],
    "contexto": "Contexto histórico e teológico dos versículos citados",
    "principio": "Princípio atemporal central da mensagem"
  },
  "frases_impactantes": ["Frase marcante 1", "Frase marcante 2"],
  "tema_central": "Tema principal da mensagem"
}

REGRAS OBRIGATÓRIAS:
- pontos_principais DEVE ser um array de OBJETOS com campos numero, titulo e conteudo. NUNCA use strings simples.
- fundamento_biblico DEVE ser um objeto com versiculos (array), contexto (string) e principio (string).
- versiculos em fundamento_biblico devem incluir a referência E o texto quando disponível na transcrição.
- NÃO invente dados. Use APENAS o que está na transcrição.
- Se algum campo não tiver informação na transcrição, use array vazio [] ou string vazia "".
- O título deve refletir o conteúdo real da transcrição.
- Gere pelo menos 3 pontos principais e 2 frases impactantes quando possível.`,
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
          summary = parsedContent.introducao || parsedContent.resumo || rawContent.substring(0, 500);
        } catch {
          summary = rawContent.substring(0, 500);
          parsedContent = {
            titulo: videoTitle,
            introducao: summary,
            pontos_principais: [],
            conclusao: "",
            aplicacao_pratica: "",
            fundamento_biblico: { versiculos: [], contexto: "", principio: "" },
            frases_impactantes: [],
            tema_central: "Extraído do YouTube",
          };
        }
      }
    } else {
      console.error("[extract-youtube] AI analysis failed, continuing without summary");
      parsedContent = {
        titulo: videoTitle,
        introducao: "Resumo não disponível - transcrição salva com sucesso.",
        pontos_principais: [],
        conclusao: "",
        aplicacao_pratica: "",
        fundamento_biblico: { versiculos: [], contexto: "", principio: "" },
        frases_impactantes: [],
        tema_central: "Extraído do YouTube",
      };
      summary = parsedContent.introducao;
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
