import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const systemPrompt = `Você é um diretor de arte premiado especializado em design para igrejas e ministérios cristãos. Você cria posts visualmente impactantes e profissionais para redes sociais.

TAREFA: Analise a imagem enviada em detalhe e crie overlays de texto que transformem a foto em um post profissional para redes sociais.

ANÁLISE DE IMAGEM — Antes de sugerir qualquer texto, analise:
1. O que a foto mostra? (culto, batismo, louvor, pregação, paisagem, pessoas orando, evento, etc.)
2. Quais são as cores dominantes?
3. Onde estão as "zonas seguras" para texto (áreas sem rostos, sem detalhes importantes)?
4. Qual é o clima/atmosfera da foto? (celebração, reflexão, adoração, comunhão, etc.)

REGRAS DE DESIGN:
1. TEXTOS GRANDES E IMPACTANTES: Títulos devem usar tamanho "4xl" a "6xl". Subtítulos "xl" a "2xl".
2. MÁXIMO 3 textos: Um título principal (impactante, maiúsculo), um subtítulo (complementar), opcionalmente um CTA ou horário.
3. FONTES: Escolha a fonte mais adequada para cada texto:
   - "bebas_neue": Títulos de impacto, eventos, convites (SEMPRE EM MAIÚSCULAS)
   - "playfair": Versículos, frases elegantes, reflexões
   - "montserrat": Informações, datas, horários, texto moderno
   - "dancing_script": Frases curtas decorativas, saudações
   - "inter": Corpo de texto, informações secundárias
4. CONTRASTE: Use cores que contrastem com a imagem. Prefira branco (#FFFFFF) sobre fotos escuras.
5. POSICIONAMENTO: Evite colocar texto sobre rostos. Use zonas seguras detectadas na análise.
6. GRADIENTE: Sempre sugira um gradiente quando houver texto sobre áreas claras ou complexas:
   - "bottom_dark_strong": Melhor para textos na parte inferior
   - "bottom_dark_subtle": Suave, para fotos já escuras
   - "top_dark": Para textos na parte superior
   - "full_dark": Para fotos muito claras
   - "radial_vignette": Para texto centralizado
   - "none": Apenas se a foto já tiver contraste suficiente
7. BACKGROUND_HIGHLIGHT: Use false quando houver gradiente. Use true apenas sem gradiente sobre áreas claras.
8. CONTEXTO: Gere textos que façam sentido com o que a foto mostra. NÃO gere textos genéricos.

PILAR DO CONTEÚDO: ${pilar || 'Edificar'}
FORMATO: ${formato || 'feed_square'}
TEMA/CONTEXTO: ${tema || 'Post para igreja'}

Baseie o texto no tema fornecido E no que a imagem mostra. Se o tema for "culto" e a foto mostra pessoas louvando, o texto deve refletir isso especificamente.`;

    const userPrompt = `Analise esta imagem com atenção e crie um layout de post profissional sobre: "${tema || 'Post para igreja'}"

Retorne APENAS um JSON válido neste formato exato:
{
  "layout_action": "overlay_original_image",
  "overlays": [
    {
      "type": "text",
      "content": "TEXTO PRINCIPAL EM MAIÚSCULAS",
      "position": "bottom_center",
      "color_hex": "#FFFFFF",
      "font_weight": "extrabold",
      "font_size": "5xl",
      "font_family": "bebas_neue",
      "background_highlight": false
    },
    {
      "type": "text",
      "content": "Subtítulo complementar",
      "position": "bottom_center",
      "color_hex": "#E0E0E0",
      "font_weight": "medium",
      "font_size": "xl",
      "font_family": "montserrat",
      "background_highlight": false
    }
  ],
  "image_filter": "none",
  "gradient_overlay": "bottom_dark_strong",
  "analysis": {
    "dominant_color": "dark",
    "suggested_text_color": "light",
    "safe_zones": ["bottom_center", "top_left"],
    "image_description": "Descrição detalhada do que a foto mostra"
  }
}

IMPORTANTE: 
- Títulos SEMPRE em tamanho "4xl" ou maior
- Use "bebas_neue" para títulos de impacto
- Sempre sugira um gradient_overlay adequado
- O texto DEVE ser contextual à imagem e ao tema
- NÃO retorne textos genéricos como "VENHA VIVER ALGO NOVO"`;

    console.log('Calling Lovable AI with Vision (gemini-2.5-pro)...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

    let overlayData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1]?.trim() || content.trim();
      overlayData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      
      overlayData = {
        layout_action: "overlay_original_image",
        overlays: [
          {
            type: "text",
            content: (tema || "VENHA ADORAR").toUpperCase(),
            position: "bottom_center",
            color_hex: "#FFFFFF",
            font_weight: "extrabold",
            font_size: "5xl",
            font_family: "bebas_neue",
            background_highlight: false
          }
        ],
        image_filter: "none",
        gradient_overlay: "bottom_dark_strong",
        analysis: {
          dominant_color: "unknown",
          suggested_text_color: "light",
          safe_zones: ["bottom_center"],
          image_description: "Análise indisponível"
        }
      };
    }

    // Validate overlays
    if (!overlayData.overlays || !Array.isArray(overlayData.overlays)) {
      overlayData.overlays = [];
    }

    const validFonts = ['bebas_neue', 'playfair', 'montserrat', 'dancing_script', 'inter'];
    const validGradients = ['none', 'bottom_dark_strong', 'bottom_dark_subtle', 'top_dark', 'full_dark', 'radial_vignette'];

    overlayData.gradient_overlay = validGradients.includes(overlayData.gradient_overlay) 
      ? overlayData.gradient_overlay 
      : 'bottom_dark_strong';

    overlayData.overlays = overlayData.overlays.map((overlay: any) => {
      if (overlay.type === 'text') {
        return {
          type: 'text',
          content: String(overlay.content || '').slice(0, 100),
          position: overlay.position || 'bottom_center',
          color_hex: overlay.color_hex || '#FFFFFF',
          font_weight: overlay.font_weight || 'bold',
          font_size: overlay.font_size || '4xl',
          font_family: validFonts.includes(overlay.font_family) ? overlay.font_family : 'montserrat',
          background_highlight: overlay.background_highlight === true,
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
