import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is designed to be called by a cron job or webhook
// It sends automatic reminders for upcoming schedules

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const results = {
      reminders_24h: 0,
      reminders_2h: 0,
      confirmation_requests: 0,
      errors: 0,
    };

    // Get schedules for 24h reminder
    const tomorrow = in24Hours.toISOString().split('T')[0];
    const { data: schedules24h, error: error24h } = await supabase
      .from('volunteer_schedules')
      .select(`
        *,
        volunteers (
          id,
          name,
          email,
          user_id
        )
      `)
      .eq('service_date', tomorrow)
      .in('status', ['scheduled', 'confirmed']);

    if (error24h) {
      console.error('Error fetching 24h schedules:', error24h);
    } else if (schedules24h) {
      for (const schedule of schedules24h) {
        // Check if reminder already sent
        const { data: existingLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('schedule_id', schedule.id)
          .eq('notification_type', 'reminder_24h')
          .eq('status', 'sent')
          .single();

        if (existingLog) continue;

        // Check user preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', schedule.volunteers?.user_id || schedule.user_id)
          .single();

        const sendApp = prefs?.reminder_24h_app !== false;
        const sendEmail = prefs?.reminder_24h_email !== false;

        if (!sendApp && !sendEmail) continue;

        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'reminder_24h',
              recipient_user_id: schedule.volunteers?.user_id || schedule.user_id,
              recipient_email: schedule.volunteers?.email,
              recipient_name: schedule.volunteers?.name,
              channels: [
                ...(sendApp ? ['app'] : []),
                ...(sendEmail && schedule.volunteers?.email ? ['email'] : []),
              ],
              data: {
                schedule_id: schedule.id,
                service_date: schedule.service_date,
                service_name: schedule.service_name || 'Culto',
                role: schedule.role,
                volunteer_name: schedule.volunteers?.name,
              },
            },
          });
          results.reminders_24h++;
        } catch (e) {
          console.error('Error sending 24h reminder:', e);
          results.errors++;
        }
      }
    }

    // Get schedules for 2h reminder (if same day)
    const today = now.toISOString().split('T')[0];
    const { data: schedules2h, error: error2h } = await supabase
      .from('volunteer_schedules')
      .select(`
        *,
        volunteers (
          id,
          name,
          email,
          user_id
        )
      `)
      .eq('service_date', today)
      .in('status', ['scheduled', 'confirmed']);

    if (error2h) {
      console.error('Error fetching 2h schedules:', error2h);
    } else if (schedules2h) {
      for (const schedule of schedules2h) {
        // Check if start time is in ~2 hours
        if (schedule.start_time) {
          const [hours, minutes] = schedule.start_time.split(':').map(Number);
          const scheduleTime = new Date(now);
          scheduleTime.setHours(hours, minutes, 0, 0);

          const timeDiff = scheduleTime.getTime() - now.getTime();
          const twoHoursInMs = 2 * 60 * 60 * 1000;
          const toleranceMs = 30 * 60 * 1000; // 30 min tolerance

          if (timeDiff < twoHoursInMs - toleranceMs || timeDiff > twoHoursInMs + toleranceMs) {
            continue;
          }
        } else {
          continue; // Skip if no start time
        }

        // Check if reminder already sent
        const { data: existingLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('schedule_id', schedule.id)
          .eq('notification_type', 'reminder_2h')
          .eq('status', 'sent')
          .single();

        if (existingLog) continue;

        // Check user preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', schedule.volunteers?.user_id || schedule.user_id)
          .single();

        const sendApp = prefs?.reminder_2h_app !== false;
        const sendEmail = prefs?.reminder_2h_email === true; // Off by default

        if (!sendApp && !sendEmail) continue;

        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'reminder_2h',
              recipient_user_id: schedule.volunteers?.user_id || schedule.user_id,
              recipient_email: schedule.volunteers?.email,
              recipient_name: schedule.volunteers?.name,
              channels: [
                ...(sendApp ? ['app'] : []),
                ...(sendEmail && schedule.volunteers?.email ? ['email'] : []),
              ],
              data: {
                schedule_id: schedule.id,
                service_date: schedule.service_date,
                service_name: schedule.service_name || 'Culto',
                role: schedule.role,
                volunteer_name: schedule.volunteers?.name,
              },
            },
          });
          results.reminders_2h++;
        } catch (e) {
          console.error('Error sending 2h reminder:', e);
          results.errors++;
        }
      }
    }

    // Send confirmation requests for schedules that are still "scheduled" (not confirmed)
    // and haven't received a confirmation request yet
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const threeDaysDate = threeDaysFromNow.toISOString().split('T')[0];

    const { data: unconfirmedSchedules } = await supabase
      .from('volunteer_schedules')
      .select(`
        *,
        volunteers (
          id,
          name,
          email,
          user_id
        ),
        schedule_confirmation_tokens (
          token
        )
      `)
      .eq('status', 'scheduled')
      .lte('service_date', threeDaysDate)
      .gte('service_date', today);

    if (unconfirmedSchedules) {
      for (const schedule of unconfirmedSchedules) {
        // Check if confirmation request already sent
        const { data: existingLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('schedule_id', schedule.id)
          .eq('notification_type', 'confirmation_request')
          .eq('status', 'sent')
          .single();

        if (existingLog) continue;

        const token = schedule.schedule_confirmation_tokens?.[0]?.token;
        if (!token) continue;

        // Check user preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', schedule.volunteers?.user_id || schedule.user_id)
          .single();

        const sendApp = prefs?.confirmation_request_app !== false;
        const sendEmail = prefs?.confirmation_request_email !== false;

        if (!sendApp && !sendEmail) continue;

        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'confirmation_request',
              recipient_user_id: schedule.volunteers?.user_id || schedule.user_id,
              recipient_email: schedule.volunteers?.email,
              recipient_name: schedule.volunteers?.name,
              channels: [
                ...(sendApp ? ['app'] : []),
                ...(sendEmail && schedule.volunteers?.email ? ['email'] : []),
              ],
              data: {
                schedule_id: schedule.id,
                service_date: schedule.service_date,
                service_name: schedule.service_name || 'Culto',
                role: schedule.role,
                volunteer_name: schedule.volunteers?.name,
                confirmation_token: token,
              },
            },
          });
          results.confirmation_requests++;
        } catch (e) {
          console.error('Error sending confirmation request:', e);
          results.errors++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in schedule-notifications:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
