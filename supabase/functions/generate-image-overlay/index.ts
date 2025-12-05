import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, tema, pilar, formato } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Imagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Você é um designer gráfico especializado em posts para igrejas e ministérios cristãos.
Sua tarefa é analisar a imagem enviada e sugerir overlays de texto e ícones para transformá-la em um post profissional para redes sociais.

REGRAS DE DESIGN:
1. CONTRASTE: Se a imagem for clara, sugira textos escuros. Se escura, sugira textos claros.
2. POSICIONAMENTO: Evite colocar texto sobre rostos. Prefira áreas de "espaço negativo".
3. HIERARQUIA: Use no máximo 3 overlays de texto (título principal, subtítulo, call-to-action).
4. LEGIBILIDADE: Sempre sugira background_highlight=true para textos sobre imagens complexas.
5. BREVIDADE: Textos curtos e impactantes (máximo 8 palavras por overlay).

POSIÇÕES DISPONÍVEIS:
- top_left, top_center, top_right
- center_left, center, center_right  
- bottom_left, bottom_center, bottom_right

ÍCONES DISPONÍVEIS:
- heart, bible, calendar, clock, location, play, music, users, church, worship_hands, sparkles, star, sun, moon

FILTROS DE IMAGEM:
- brightness-50 (muito escuro)
- brightness-75 (escuro - RECOMENDADO para textos claros)
- brightness-90 (levemente escuro)
- none (sem filtro)

PILAR: ${pilar || 'Edificar'}
FORMATO: ${formato || 'feed_square'}
TEMA: ${tema || 'Post para igreja'}`;

    const userPrompt = `Analise esta imagem e sugira overlays para criar um post sobre: "${tema || 'Post para igreja'}"

Retorne APENAS um JSON válido no seguinte formato:
{
  "layout_action": "overlay_original_image",
  "overlays": [
    {
      "type": "text",
      "content": "TEXTO PRINCIPAL AQUI",
      "position": "bottom_center",
      "color_hex": "#FFFFFF",
      "font_weight": "bold",
      "font_size": "2xl",
      "background_highlight": true
    }
  ],
  "image_filter": "brightness-75",
  "analysis": {
    "dominant_color": "dark",
    "suggested_text_color": "light",
    "safe_zones": ["bottom_center", "top_left"]
  }
}`;

    console.log('Calling Lovable AI with Vision...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', type: 'rate_limit_error' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes', type: 'payment_error' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log('AI Response:', content);

    // Parse JSON from response
    let overlayData;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1]?.trim() || content.trim();
      overlayData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      
      // Return default overlay structure
      overlayData = {
        layout_action: "overlay_original_image",
        overlays: [
          {
            type: "text",
            content: tema || "VENHA VIVER ALGO NOVO",
            position: "bottom_center",
            color_hex: "#FFFFFF",
            font_weight: "bold",
            font_size: "2xl",
            background_highlight: true
          }
        ],
        image_filter: "brightness-75",
        analysis: {
          dominant_color: "unknown",
          suggested_text_color: "light",
          safe_zones: ["bottom_center"]
        }
      };
    }

    // Validate and sanitize overlay data
    if (!overlayData.overlays || !Array.isArray(overlayData.overlays)) {
      overlayData.overlays = [];
    }

    overlayData.overlays = overlayData.overlays.map((overlay: any) => {
      if (overlay.type === 'text') {
        return {
          type: 'text',
          content: String(overlay.content || '').slice(0, 100),
          position: overlay.position || 'bottom_center',
          color_hex: overlay.color_hex || '#FFFFFF',
          font_weight: overlay.font_weight || 'bold',
          font_size: overlay.font_size || 'xl',
          background_highlight: overlay.background_highlight !== false,
        };
      }
      if (overlay.type === 'icon') {
        return {
          type: 'icon',
          icon_name: overlay.icon_name || 'sparkles',
          position: overlay.position || 'top_right',
          color_hex: overlay.color_hex || '#FFD700',
        };
      }
      return null;
    }).filter(Boolean);

    return new Response(
      JSON.stringify(overlayData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image-overlay:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
