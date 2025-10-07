import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formato, copy, estilo, pilar, contexto_adicional } = await req.json();
    
    console.log('Generating image with params:', { formato, estilo, pilar });

    // Define dimensions based on format
    const formatoDimensoes: Record<string, { width: number; height: number }> = {
      'feed_square': { width: 1024, height: 1024 },
      'feed_portrait': { width: 1024, height: 1536 },
      'story': { width: 1024, height: 1536 },
      'reel_cover': { width: 1024, height: 1536 }
    };
    const dimensoes = formatoDimensoes[formato] || { width: 1024, height: 1024 };

    // Build intelligent prompt based on pilar and estilo
    const pilarStyles = {
      'Edificar': 'pastel tones, serif typography, contemplative and peaceful imagery, soft lighting',
      'Alcançar': 'vibrant colors, bold typography, dynamic and energetic imagery, bright lighting',
      'Pertencer': 'warm tones, humanist typography, community and connection imagery, welcoming atmosphere',
      'Servir': 'earthy tones, simple typography, action and hands-on imagery, authentic feel'
    };

    const estiloDescriptions = {
      'minimalista': 'minimalist design, clean lines, lots of white space, simple composition',
      'tipografico': 'typography-focused, text as main visual element, creative font usage',
      'fotografico': 'photographic style, realistic imagery, human-centered',
      'ilustrativo': 'illustrated style, artistic, creative graphics and drawings'
    };

    const pilarStyle = pilarStyles[pilar as keyof typeof pilarStyles] || pilarStyles['Edificar'];
    const estiloDesc = estiloDescriptions[estilo as keyof typeof estiloDescriptions] || estiloDescriptions['minimalista'];

    // Truncate copy if too long
    const truncatedCopy = copy.length > 200 ? copy.substring(0, 200) + '...' : copy;

    const prompt = `Create a professional Instagram post image for a church social media.
Style: ${estiloDesc}
Visual theme: ${pilarStyle}
Text content to feature: "${truncatedCopy}"
${contexto_adicional ? `Additional context: ${contexto_adicional}` : ''}
The image should be suitable for Christian content, inspiring, and visually appealing.
Aspect ratio: ${dimensoes.width}x${dimensoes.height}px
High quality, professional design.`;

    console.log('Calling Lovable AI with prompt:', prompt.substring(0, 100) + '...');

    // Call Lovable AI - Gemini 2.5 Flash Image Preview
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de taxa excedido. Por favor, tente novamente mais tarde.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Lovable AI');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    // Upload image to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header to extract user_id
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Convert base64 to blob
    const base64Data = imageUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.id}/${timestamp}_${formato}_${estilo}.png`;

    console.log('Uploading to storage:', filename);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filename, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Fallback to returning base64 if storage fails
      return new Response(
        JSON.stringify({ 
          image_url: imageUrl,
          prompt_usado: prompt,
          dimensoes,
          storage_error: uploadError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filename);

    console.log('Image uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        image_url: publicUrl,
        prompt_usado: prompt,
        dimensoes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-post-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
