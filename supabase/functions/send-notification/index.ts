import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'schedule_created' | 'reminder_24h' | 'reminder_2h' | 'confirmation_request' | 'schedule_changed' | 'confirmation_received';
  recipient_user_id: string;
  recipient_email?: string;
  recipient_name?: string;
  channels: ('app' | 'email')[];
  data: {
    schedule_id?: string;
    service_date?: string;
    service_name?: string;
    role?: string;
    volunteer_name?: string;
    message?: string;
    confirmation_token?: string;
  };
}

const NOTIFICATION_TEMPLATES: Record<string, { title: string; message: string }> = {
  schedule_created: {
    title: 'Nova Escala',
    message: 'Você foi escalado para {role} no {service_name} de {service_date}.',
  },
  reminder_24h: {
    title: 'Lembrete: Amanhã tem culto!',
    message: 'Lembrete: Você está escalado para {role} amanhã ({service_date}) no {service_name}.',
  },
  reminder_2h: {
    title: 'Lembrete: Culto em 2 horas!',
    message: 'O {service_name} começa em 2 horas. Você está escalado para {role}.',
  },
  confirmation_request: {
    title: 'Confirme sua presença',
    message: 'Por favor, confirme sua presença para {role} no {service_name} de {service_date}.',
  },
  schedule_changed: {
    title: 'Escala Alterada',
    message: 'Sua escala para {service_date} foi alterada. Confira os detalhes.',
  },
  confirmation_received: {
    title: 'Confirmação Recebida',
    message: '{volunteer_name} confirmou presença para {role} no dia {service_date}.',
  },
};

function formatMessage(template: string, data: Record<string, string | undefined>): string {
  let message = template;
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
  }
  return message;
}

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  resendApiKey: string
): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ide.On <noreply@updates.ideon.app>',
        to: [to],
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #8B5CF6; margin: 0; font-size: 24px;">Ide.On</h1>
                <p style="color: #666; margin-top: 4px;">Sistema de Escalas</p>
              </div>
              <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">${subject}</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">${body}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                Este email foi enviado automaticamente pelo Ide.On.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: NotificationRequest = await req.json();
    const { type, recipient_user_id, recipient_email, recipient_name, channels, data } = body;

    // Get template
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format messages
    const title = formatMessage(template.title, data);
    const message = formatMessage(template.message, data);

    const results: { channel: string; success: boolean; error?: string }[] = [];

    // Send in-app notification
    if (channels.includes('app')) {
      try {
        const { error } = await supabase.from('notifications').insert({
          user_id: recipient_user_id,
          type,
          title,
          message,
          related_content_id: data.schedule_id,
          related_content_type: 'volunteer_schedule',
          is_read: false,
        });

        if (error) throw error;

        // Log notification
        await supabase.from('notification_logs').insert({
          notification_type: type,
          schedule_id: data.schedule_id,
          recipient_id: recipient_user_id,
          recipient_email,
          channel: 'app',
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        results.push({ channel: 'app', success: true });
      } catch (error) {
        console.error('Error sending app notification:', error);
        results.push({ channel: 'app', success: false, error: String(error) });
      }
    }

    // Send email notification
    if (channels.includes('email') && recipient_email && resendApiKey) {
      const emailSubject = `[Ide.On] ${title}`;
      const success = await sendEmail(recipient_email, emailSubject, message, resendApiKey);

      // Log notification
      await supabase.from('notification_logs').insert({
        notification_type: type,
        schedule_id: data.schedule_id,
        recipient_id: recipient_user_id,
        recipient_email,
        channel: 'email',
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
        error_message: success ? null : 'Failed to send email',
      });

      results.push({ channel: 'email', success });
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
