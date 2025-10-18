import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Detectar tipo de conteúdo baseado no prompt
function detectContentType(prompt: string): string {
  const lowercased = prompt.toLowerCase();
  
  if (lowercased.includes('carrossel') || lowercased.includes('carousel')) return 'carrossel';
  if (lowercased.includes('reel') || lowercased.includes('reels')) return 'reel';
  if (lowercased.includes('stories') || lowercased.includes('story')) return 'stories';
  if (lowercased.includes('devocional')) return 'devocional';
  if (lowercased.includes('estudo bíblico') || lowercased.includes('estudo biblico')) return 'estudo';
  if (lowercased.includes('esboço') || lowercased.includes('esboco')) return 'esboco';
  if (lowercased.includes('desafio')) return 'desafio_semanal';
  if (lowercased.includes('roteiro') || lowercased.includes('vídeo') || lowercased.includes('video')) return 'roteiro_video';
  
  return 'post';
}

// Extrair título do conteúdo gerado
function extractTitle(content: any, contentType: string): string {
  if (content.titulo) return content.titulo;
  if (content.estrutura?.titulo) return content.estrutura.titulo;
  if (content.devocional?.titulo) return content.devocional.titulo;
  if (content.esboco?.titulo) return content.esboco.titulo;
  
  return `Conteúdo ${contentType}`;
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
    const { prompt, contentType, options = {} } = await req.json();
    
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    console.log('Creating content:', { prompt, contentType, options });

    // Detectar tipo de conteúdo (se não especificado)
    const finalType = contentType || detectContentType(prompt);
    console.log('Detected content type:', finalType);

    // Gerar conteúdo via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um assistente especializado em criar conteúdo cristão para redes sociais.
Sempre retorne um JSON válido com a estrutura apropriada para o tipo de conteúdo: ${finalType}.
Inclua sempre que possível: fundamento_biblico, conteudo, e dica_producao.`;

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

    const title = extractTitle(content, finalType);

    // Salvar na biblioteca unificada
    const { data: savedContent, error: saveError } = await supabaseClient
      .from('content_library')
      .insert({
        user_id: user.id,
        title: title,
        content_type: finalType,
        source_type: options.source || 'ai-creator',
        pilar: options.pilar || 'EDIFICAR',
        content: content,
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
        content_type: finalType,
        content: content
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
