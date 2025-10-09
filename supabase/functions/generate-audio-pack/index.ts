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
    await checkRateLimit(supabaseClient, userId, 'generate-audio-pack');

    const { transcript } = await req.json();

    validateInput('transcript', {
      value: transcript,
      required: true,
      type: 'string',
      minLength: 100,
      maxLength: 100000,
    });

    const sanitizedTranscript = sanitizeText(transcript, 100000);
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const systemPrompt = `Você é um assistente especializado em criar conteúdo para redes sociais de igrejas cristãs.
Com base no sermão transcrito, crie um pacote semanal completo de conteúdo.

Retorne APENAS um objeto JSON válido com esta estrutura:
{
  "versiculos_base": ["versículo 1", "versículo 2"],
  "resumo": "resumo do sermão em 2-3 frases",
  "stories": [
    {
      "dia": "Segunda",
      "tipo": "story",
      "texto": "texto do story",
      "versiculo": "versículo relacionado"
    }
  ],
  "carrosseis": [
    {
      "dia": "Quarta",
      "tipo": "carrossel",
      "titulo": "título",
      "slides": ["slide 1", "slide 2", "slide 3"],
      "versiculo": "versículo relacionado"
    }
  ],
  "reels": [
    {
      "dia": "Sexta",
      "tipo": "reel",
      "roteiro": "roteiro do reel",
      "duracao": "30s",
      "versiculo": "versículo relacionado"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedTranscript }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to generate audio pack');
    }

    const data = await response.json();
    const generatedPack = JSON.parse(data.choices[0].message.content);

    // Salvar no banco de conteúdos gerados
    const { data: savedContent, error: saveError } = await supabaseClient
      .from('generated_contents')
      .insert({
        user_id: userId,
        source_type: 'audio-pack',
        content: generatedPack,
        content_format: 'pack',
        pilar: 'EXALTAR',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database error:', saveError);
      throw saveError;
    }

    await logSecurityEvent(
      supabaseClient,
      userId,
      'audio_pack_generated',
      'generate-audio-pack',
      true
    );

    return new Response(
      JSON.stringify({ success: true, content: savedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    
    await logSecurityEvent(
      supabaseClient,
      userId,
      'audio_pack_error',
      'generate-audio-pack',
      false,
      error.message
    );

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
