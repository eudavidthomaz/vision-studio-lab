import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    // Service client for admin operations
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

    // Check quota (live_captures)
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

    // Validate YouTube URL
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/;
    if (!ytRegex.test(youtubeUrl)) {
      return new Response(JSON.stringify({ error: "URL do YouTube inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = instructions
      ? `Analise o vídeo do YouTube nesta URL: ${youtubeUrl}\n\nInstruções adicionais do usuário: ${instructions}`
      : `Analise o vídeo do YouTube nesta URL: ${youtubeUrl}`;

    console.log(`[extract-youtube] Processing URL: ${youtubeUrl} for user: ${user.id}`);

    // Call Gemini via Lovable AI Gateway
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
            content: `Você é um assistente especializado em extrair e estruturar conteúdo de vídeos do YouTube para igrejas e ministérios.

Ao receber uma URL de vídeo do YouTube, você deve:
1. Extrair a transcrição/legenda completa do vídeo
2. Identificar os pontos principais da mensagem
3. Criar um resumo estruturado

Retorne SEMPRE um JSON válido com a seguinte estrutura:
{
  "titulo": "Título do vídeo/mensagem",
  "transcricao": "Transcrição completa do vídeo...",
  "resumo": "Resumo de 2-3 parágrafos da mensagem...",
  "pontos_principais": ["ponto 1", "ponto 2", "ponto 3"],
  "versiculos_citados": ["Referência 1", "Referência 2"],
  "aplicacoes_praticas": ["Aplicação 1", "Aplicação 2"],
  "tema_central": "Tema principal da mensagem"
}

IMPORTANTE:
- NÃO invente dados como endereços, telefones, nomes de pessoas ou igrejas
- Use apenas informações presentes no vídeo
- Se não conseguir acessar o vídeo, retorne um JSON com erro: {"error": "Não foi possível acessar o vídeo"}
- Mantenha a transcrição fiel ao conteúdo original`,
          },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 8000,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("[extract-youtube] AI gateway error:", status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar o vídeo com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return new Response(JSON.stringify({ error: "IA não retornou conteúdo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from AI response
    let parsedContent: any;
    try {
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) || rawContent.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawContent;
      parsedContent = JSON.parse(jsonStr);
    } catch {
      console.error("[extract-youtube] Failed to parse AI response as JSON, using raw");
      parsedContent = {
        titulo: "Conteúdo do YouTube",
        transcricao: rawContent,
        resumo: rawContent.substring(0, 500),
        pontos_principais: [],
        versiculos_citados: [],
        aplicacoes_praticas: [],
        tema_central: "Extraído do YouTube",
      };
    }

    if (parsedContent.error) {
      return new Response(JSON.stringify({ error: parsedContent.error }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const title = parsedContent.titulo || "Conteúdo do YouTube";

    // Save to content_library
    const { data: contentData, error: insertError } = await supabaseAdmin
      .from("content_library")
      .insert({
        user_id: user.id,
        title,
        content_type: "resumo_pregacao",
        source_type: "youtube",
        content: parsedContent,
        prompt_original: `YouTube: ${youtubeUrl}${instructions ? ` | ${instructions}` : ""}`,
        status: "draft",
        tags: ["youtube", "transcrição"],
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[extract-youtube] Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Erro ao salvar conteúdo" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment quota
    const currentCaptures = quotaData?.live_captures_used || 0;
    await supabaseAdmin
      .from("usage_quotas")
      .update({ live_captures_used: currentCaptures + 1 })
      .eq("user_id", user.id);

    console.log(`[extract-youtube] Content saved: ${contentData.id}`);

    return new Response(
      JSON.stringify({ content_id: contentData.id, title }),
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
