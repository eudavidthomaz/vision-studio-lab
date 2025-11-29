import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_FORMATS = ["blog", "carrossel", "email", "roteiro_video", "post_curto"];

type BlogBlock = {
  estrategia: string;
  titulo: string;
  resumo: string;
  corpo: string;
  ctas: string[];
  metadados: string[];
  suposicoes: string;
};

type CarrosselBlock = {
  estrategia: string;
  slides: string[];
  ctas: string[];
  metadados: string[];
  suposicoes: string;
};

type EmailBlock = {
  assunto: string;
  preheader: string;
  corpo: string;
  cta: string;
  metadados: string[];
  suposicoes: string;
};

type RoteiroBlock = {
  gancho: string;
  apresentacao: string;
  pontos_chave: string[];
  fechamento: string;
  cta: string;
  sugestoes_cena: string | string[];
  metadados: string[];
  suposicoes: string;
};

type PostCurtoBlock = {
  headline: string;
  corpo: string;
  cta: string;
  metadados: string[];
  suposicoes: string;
};

type StructuredModalidades = {
  blog?: BlogBlock;
  carrossel?: CarrosselBlock;
  email?: EmailBlock;
  roteiro_video?: RoteiroBlock;
  post_curto?: PostCurtoBlock;
};

function pick<T>(...values: Array<T | undefined | null>): T | string {
  const found = values.find((v) => v !== undefined && v !== null && `${v}`.length > 0);
  return (found as T) ?? "[PENDING]";
}

function normalizeBlog(block: any): BlogBlock {
  return {
    estrategia: pick(block?.estrategia, block?.estrategia_geral),
    titulo: pick(block?.titulo, block?.headline),
    resumo: pick(block?.resumo),
    corpo: pick(block?.corpo, block?.secoes),
    ctas: Array.isArray(block?.ctas) ? block.ctas : block?.cta ? [block.cta] : [],
    metadados: Array.isArray(block?.metadados)
      ? block.metadados
      : block?.hashtags
        ? [].concat(block.hashtags)
        : [],
    suposicoes: pick(block?.suposicoes, block?.assumptions),
  };
}

function normalizeCarrossel(block: any): CarrosselBlock {
  return {
    estrategia: pick(block?.estrategia, block?.gancho, block?.headline),
    slides: Array.isArray(block?.slides)
      ? block.slides
      : block?.corpo
        ? String(block.corpo).split(/\n\n+/)
        : [],
    ctas: Array.isArray(block?.ctas) ? block.ctas : block?.cta ? [block.cta] : [],
    metadados: Array.isArray(block?.metadados)
      ? block.metadados
      : block?.hashtags
        ? [].concat(block.hashtags)
        : [],
    suposicoes: pick(block?.suposicoes, block?.assumptions),
  };
}

function normalizeEmail(block: any): EmailBlock {
  return {
    assunto: pick(block?.assunto, block?.titulo, block?.headline),
    preheader: pick(block?.preheader, block?.resumo),
    corpo: pick(block?.corpo, block?.texto),
    cta: pick(block?.cta, block?.ctas?.[0]),
    metadados: Array.isArray(block?.metadados)
      ? block.metadados
      : block?.hashtags
        ? [].concat(block.hashtags)
        : [],
    suposicoes: pick(block?.suposicoes, block?.assumptions),
  };
}

function normalizeRoteiro(block: any): RoteiroBlock {
  return {
    gancho: pick(block?.gancho, block?.headline),
    apresentacao: pick(block?.apresentacao, block?.introducao),
    pontos_chave: Array.isArray(block?.pontos_chave)
      ? block.pontos_chave
      : block?.corpo
        ? String(block.corpo).split(/\n+/)
        : [],
    fechamento: pick(block?.fechamento, block?.conclusao),
    cta: pick(block?.cta, block?.ctas?.[0]),
    sugestoes_cena: pick(block?.sugestoes_cena, block?.broll, block?.cenas),
    metadados: Array.isArray(block?.metadados)
      ? block.metadados
      : block?.hashtags
        ? [].concat(block.hashtags)
        : [],
    suposicoes: pick(block?.suposicoes, block?.assumptions),
  };
}

function normalizePostCurto(block: any): PostCurtoBlock {
  return {
    headline: pick(block?.headline, block?.titulo),
    corpo: pick(block?.corpo, block?.texto),
    cta: pick(block?.cta, block?.ctas?.[0]),
    metadados: Array.isArray(block?.metadados)
      ? block.metadados
      : block?.hashtags
        ? [].concat(block.hashtags)
        : [],
    suposicoes: pick(block?.suposicoes, block?.assumptions),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Parse do request
    const { prompt, formats: requestedFormats, options = {} } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    const formats: string[] = (Array.isArray(requestedFormats) && requestedFormats.length > 0
      ? requestedFormats
      : SUPPORTED_FORMATS).filter((format) => SUPPORTED_FORMATS.includes(format));

    console.log('Creating content:', { prompt, formats, options });

    // Gerar conteúdo via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um assistente especializado em criar conteúdo cristão para redes sociais.
Retorne SEMPRE um JSON válido no formato:
{
  "modalidades": {
    "blog": {"estrategia": "...", "titulo": "...", "resumo": "...", "corpo": "...", "ctas": ["..."], "metadados": ["..."], "suposicoes": "..."},
    "carrossel": {"estrategia": "...", "slides": ["Slide 1", "Slide 2"], "ctas": ["..."], "metadados": ["..."], "suposicoes": "..."},
    "email": {"assunto": "...", "preheader": "...", "corpo": "...", "cta": "...", "metadados": ["..."], "suposicoes": "..."},
    "roteiro_video": {"gancho": "...", "apresentacao": "...", "pontos_chave": ["..."], "fechamento": "...", "cta": "...", "sugestoes_cena": "...", "metadados": ["..."], "suposicoes": "..."},
    "post_curto": {"headline": "...", "corpo": "...", "cta": "...", "metadados": ["..."], "suposicoes": "..."}
  },
  "checklist": {
    "tem_titulo": true,
    "tem_resumo": true,
    "cta_destacado": true,
    "metadados_separados": true,
    "suposicoes_explicitas": true
  }
}

Regra: sempre retorne os formatos solicitados: ${formats.join(', ')}. Estruture com AIDA/PPA, separe metadados do corpo, e use português claro.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('No content generated from AI');
    }

    // Parse do conteúdo gerado com tratamento robusto de markdown
    let content;
    try {
      let cleanedText = generatedText.trim();
      
      // Detecta e remove markdown code blocks (```json ... ``` ou ``` ... ```)
      const jsonMatch = cleanedText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
        console.log('Extracted JSON from markdown block');
      }
      
      content = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', generatedText);
      console.error('Parse error:', e);
      throw new Error('Invalid JSON response from AI');
    }

    const normalized: { modalidades: StructuredModalidades; checklist: Record<string, any> } = {
      modalidades: {},
      checklist: {
        tem_titulo: true,
        tem_resumo: true,
        cta_destacado: true,
        metadados_separados: true,
        suposicoes_explicitas: true,
        ...(content.checklist || content.validacao || {}),
      },
    };

    formats.forEach((format) => {
      const blocoOrigem = content.modalidades?.[format] || content[format] || content;
      switch (format) {
        case 'blog':
          normalized.modalidades.blog = normalizeBlog(blocoOrigem);
          break;
        case 'carrossel':
          normalized.modalidades.carrossel = normalizeCarrossel(blocoOrigem);
          break;
        case 'email':
          normalized.modalidades.email = normalizeEmail(blocoOrigem);
          break;
        case 'roteiro_video':
          normalized.modalidades.roteiro_video = normalizeRoteiro(blocoOrigem);
          break;
        case 'post_curto':
          normalized.modalidades.post_curto = normalizePostCurto(blocoOrigem);
          break;
        default:
          break;
      }
    });

    const primaryType = formats[0] || 'post';
    const primaryBlock: any = (normalized.modalidades as any)[primaryType];
    const title =
      primaryBlock?.titulo ||
      primaryBlock?.headline ||
      primaryBlock?.assunto ||
      `Conteúdo ${primaryType}`;

    // Salvar na biblioteca unificada
    const { data: savedContent, error: saveError } = await supabaseClient
      .from('content_library')
      .insert({
        user_id: user.id,
        title: title,
        content_type: primaryType,
        source_type: options.source || 'ai-creator',
        pilar: options.pilar || 'EDIFICAR',
        content: primaryBlock,
        modalidades: normalized.modalidades,
        formats: formats,
        is_structured: true,
        prompt_original: prompt,
        tags: options.tags || [],
        sermon_id: options.sermonId || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
      throw saveError;
    }

    console.log('Content saved successfully:', savedContent.id);

    return new Response(
      JSON.stringify({
        id: savedContent.id,
        title: title,
        content_type: primaryType,
        modalidades: normalized.modalidades,
        formats,
        checklist: normalized.checklist,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in content-engine:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
