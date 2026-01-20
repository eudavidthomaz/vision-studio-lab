import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmRequest {
  token: string;
  action: 'confirm' | 'decline' | 'request_substitute';
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ConfirmRequest = await req.json();
    const { token, action, notes } = body;

    if (!token || !action) {
      return new Response(
        JSON.stringify({ error: 'Token e ação são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find token and validate
    const { data: tokenData, error: tokenError } = await supabase
      .from('schedule_confirmation_tokens')
      .select(`
        *,
        volunteer_schedules (
          id,
          user_id,
          role,
          service_date,
          service_name,
          volunteer_id,
          volunteers (
            name,
            email
          )
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Este link de confirmação expirou' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already used
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ 
          error: 'Este link já foi utilizado',
          action_taken: tokenData.action_taken,
          used_at: tokenData.used_at
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schedule = tokenData.volunteer_schedules;
    if (!schedule) {
      return new Response(
        JSON.stringify({ error: 'Escala não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map action to schedule status
    const statusMap: Record<string, string> = {
      confirm: 'confirmed',
      decline: 'absent',
      request_substitute: 'substituted',
    };

    const newStatus = statusMap[action];
    const volunteerName = schedule.volunteers?.name || 'Voluntário';

    // Update schedule status
    const { error: updateScheduleError } = await supabase
      .from('volunteer_schedules')
      .update({
        status: newStatus,
        notes: notes || schedule.notes,
        confirmed_at: action === 'confirm' ? new Date().toISOString() : null,
        confirmed_by: 'volunteer',
      })
      .eq('id', schedule.id);

    if (updateScheduleError) {
      throw updateScheduleError;
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('schedule_confirmation_tokens')
      .update({
        used_at: new Date().toISOString(),
        action_taken: action,
        notes,
      })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      throw updateTokenError;
    }

    // Send notification to leader
    const notificationType = action === 'confirm' ? 'confirmation_received' : 'schedule_changed';
    
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          type: notificationType,
          recipient_user_id: schedule.user_id,
          channels: ['app'],
          data: {
            schedule_id: schedule.id,
            service_date: schedule.service_date,
            service_name: schedule.service_name || 'Culto',
            role: schedule.role,
            volunteer_name: volunteerName,
            message: action === 'confirm' 
              ? `${volunteerName} confirmou presença`
              : action === 'decline'
              ? `${volunteerName} não poderá comparecer`
              : `${volunteerName} solicitou substituição`,
          },
        },
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    // Return success with schedule details
    const actionMessages: Record<string, string> = {
      confirm: 'Presença confirmada com sucesso!',
      decline: 'Sua ausência foi registrada. O líder será notificado.',
      request_substitute: 'Solicitação de substituição enviada ao líder.',
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: actionMessages[action],
        schedule: {
          id: schedule.id,
          service_date: schedule.service_date,
          service_name: schedule.service_name,
          role: schedule.role,
          volunteer_name: volunteerName,
          status: newStatus,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in confirm-schedule:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
