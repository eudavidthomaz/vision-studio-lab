import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.warn('⚠️ DEPRECATED: generate-week-pack is deprecated. Use generate-ai-content instead.');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'Transcript is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // REDIRECIONAR para generate-ai-content (novo endpoint unificado)
    const prompt = `TIPO_SOLICITADO: pack_semanal

Com base nesta transcrição de pregação, crie um pacote completo de conteúdo para redes sociais seguindo EXATAMENTE a estrutura JSON solicitada.

Transcrição:
${transcript}

Inclua TODOS os campos obrigatórios conforme a estrutura definida para pack_semanal.`;

    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-ai-content`,
      {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization')!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate content');
    }

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-week-pack (deprecated):', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});