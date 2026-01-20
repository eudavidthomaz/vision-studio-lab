import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AvailabilityRequest {
  volunteer_id: string;
  start_date: string;
  end_date: string;
  time_min?: string;
  time_max?: string;
}

interface BusySlot {
  start: string;
  end: string;
  summary?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!googleClientId || !googleClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar não configurado' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.sub || null;
      } catch (e) {
        console.error('Failed to parse JWT:', e);
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AvailabilityRequest = await req.json();
    const { volunteer_id, start_date, end_date, time_min, time_max } = body;

    if (!volunteer_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'volunteer_id, start_date e end_date são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get volunteer's Google Calendar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('volunteer_id', volunteer_id)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          connected: false, 
          error: 'Voluntário não conectou Google Calendar',
          busy_slots: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.token_expiry) < new Date()) {
      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        // Mark as inactive
        await supabase
          .from('google_calendar_tokens')
          .update({ is_active: false })
          .eq('id', tokenData.id);

        return new Response(
          JSON.stringify({ 
            connected: false, 
            error: 'Token expirado. Voluntário precisa reconectar.',
            busy_slots: [],
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      // Update token
      await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: accessToken,
          token_expiry: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
        })
        .eq('id', tokenData.id);
    }

    // Build time range
    const timeMinStr = time_min || '00:00';
    const timeMaxStr = time_max || '23:59';
    const startDateTime = `${start_date}T${timeMinStr}:00`;
    const endDateTime = `${end_date}T${timeMaxStr}:00`;

    // Query Google Calendar FreeBusy API
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: new Date(startDateTime).toISOString(),
        timeMax: new Date(endDateTime).toISOString(),
        items: [{ id: tokenData.calendar_id || 'primary' }],
      }),
    });

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error('Calendar API error:', error);
      return new Response(
        JSON.stringify({ 
          connected: true, 
          error: 'Erro ao consultar calendário',
          busy_slots: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const calendarData = await calendarResponse.json();
    const calendarId = tokenData.calendar_id || 'primary';
    const busyPeriods = calendarData.calendars?.[calendarId]?.busy || [];

    // Convert to our format
    const busySlots: BusySlot[] = busyPeriods.map((period: any) => ({
      start: period.start,
      end: period.end,
    }));

    // Update last sync
    await supabase
      .from('google_calendar_tokens')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Check if volunteer is available for the requested period
    const isAvailable = busySlots.length === 0 || !busySlots.some((slot) => {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();
      const reqStart = new Date(startDateTime).getTime();
      const reqEnd = new Date(endDateTime).getTime();
      
      // Check for overlap
      return slotStart < reqEnd && slotEnd > reqStart;
    });

    return new Response(
      JSON.stringify({
        connected: true,
        volunteer_id,
        period: { start: startDateTime, end: endDateTime },
        is_available: isAvailable,
        busy_slots: busySlots,
        email: tokenData.email,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-calendar-availability:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
