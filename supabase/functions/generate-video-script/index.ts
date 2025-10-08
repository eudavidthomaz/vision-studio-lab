import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient, validateInput, checkRateLimit, logSecurityEvent, sanitizeText } from "../_shared/security.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { client: supabaseClient, userId } = createAuthenticatedClient(req);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    await checkRateLimit(supabaseClient, userId, 'generate-video-script');

    const { mensagem_principal, duracao } = await req.json();

    validateInput('mensagem_principal', {
      value: mensagem_principal,
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 1000,
    });

    validateInput('duracao', {
      value: duracao,
      required: true,
      type: 'string',
      allowedValues: ['15s', '30s', '60s'],
    });

    const sanitizedMensagem = sanitizeText(mensagem_principal);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Crie um roteiro completo de Reel/Short de ${duracao} sobre: ${sanitizedMensagem}

Retorne APENAS um objeto JSON válido com esta estrutura:
{
  "titulo": "título do vídeo",
  "hook": "primeiros 3 segundos para capturar atenção",
  "roteiro": "roteiro segmentado por tempo (0-3s, 3-10s, etc)",
  "sugestoes_visuais": "descrição de B-rolls, transições, texto na tela",
  "cta": "call-to-action final",
  "hashtags": ["tag1", "tag2", "tag3"],
  "pilar": "evangelístico" ou "ensino" ou "comunidade"
}

Diretrizes:
- Hook forte nos primeiros 3 segundos
- Roteiro dinâmico e visual
- Sugestões específicas de B-roll
- CTA claro e direto
- Adaptar ao tempo de ${duracao}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate content');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsedContent = JSON.parse(jsonMatch[0]);

    // Salvar no banco
    const fullContent = `🎬 HOOK (0-3s):\n${parsedContent.hook}\n\n📝 ROTEIRO:\n${parsedContent.roteiro}\n\n🎥 VISUAL:\n${parsedContent.sugestoes_visuais}\n\n💬 CTA:\n${parsedContent.cta}`;

    const { error: insertError } = await supabaseClient
      .from('content_planner')
      .insert({
        user_id: userId,
        tipo_conteudo: 'reel',
        titulo: parsedContent.titulo,
        conteudo: fullContent,
        hashtags: parsedContent.hashtags,
        pilar: parsedContent.pilar,
        status: 'draft',
        scheduled_date: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    await logSecurityEvent(
      supabaseClient,
      userId,
      'video_script_generated',
      'generate-video-script',
      true
    );

    return new Response(
      JSON.stringify({ success: true, content: parsedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    
    await logSecurityEvent(
      supabaseClient,
      userId,
      'video_script_error',
      'generate-video-script',
      false,
      error.message
    );

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
