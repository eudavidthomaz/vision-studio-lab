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
    await checkRateLimit(supabaseClient, userId, 'generate-photo-idea');

    const { tema, estilo } = await req.json();

    validateInput('tema', {
      value: tema,
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 500,
    });

    validateInput('estilo', {
      value: estilo,
      required: true,
      type: 'string',
      allowedValues: ['inspiracional', 'versículo', 'convite', 'testemunho'],
    });

    const sanitizedTema = sanitizeText(tema);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Crie uma ideia completa de post com foto para Instagram no estilo "${estilo}" sobre: ${sanitizedTema}

Retorne APENAS um objeto JSON válido com esta estrutura:
{
  "titulo": "título do post",
  "copy": "texto do post",
  "descricao_imagem": "descrição detalhada da imagem ideal (cores, elementos, composição)",
  "sugestao_design": "dicas específicas para criar no Canva ou similar",
  "hashtags": ["tag1", "tag2", "tag3"],
  "pilar": "evangelístico" ou "ensino" ou "comunidade"
}

Diretrizes:
- Descrição de imagem muito detalhada e visual
- Sugestão de cores, tipografia e layout
- Copy curta e impactante
- 3-5 hashtags relevantes`;

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

    // Salvar no banco unificado (content_library)
    const { data: insertData, error: insertError } = await supabaseClient
      .from('content_library')
      .insert({
        user_id: userId,
        source_type: 'photo-idea',
        content_type: 'foto_post',
        pilar: parsedContent.pilar || 'EDIFICAR',
        title: parsedContent.conteudo_criativo?.titulo || 'Ideia de Foto',
        content: parsedContent,
        prompt_original: `Tema: ${sanitizedTema}, Estilo: ${estilo}`,
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    await logSecurityEvent(
      supabaseClient,
      userId,
      'photo_idea_generated',
      'generate-photo-idea',
      true
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: parsedContent,
        id: insertData?.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    
    await logSecurityEvent(
      supabaseClient,
      userId,
      'photo_idea_error',
      'generate-photo-idea',
      false,
      error.message
    );

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
