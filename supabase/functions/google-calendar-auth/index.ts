import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      return new Response(
        JSON.stringify({ 
          error: 'Google Calendar não configurado', 
          configured: false,
          missing: {
            clientId: !googleClientId,
            clientSecret: !googleClientSecret,
            redirectUri: !googleRedirectUri,
          }
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

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

    switch (action) {
      case 'authorize': {
        // Generate authorization URL
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Autenticação necessária' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json().catch(() => ({}));
        const volunteerId = body.volunteer_id;

        // Store state for verification
        const state = btoa(JSON.stringify({ userId, volunteerId, timestamp: Date.now() }));

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', googleClientId);
        authUrl.searchParams.set('redirect_uri', googleRedirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', GOOGLE_SCOPES);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');
        authUrl.searchParams.set('state', state);

        return new Response(
          JSON.stringify({ auth_url: authUrl.toString(), state }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'callback': {
        // Handle OAuth callback
        const body = await req.json();
        const { code, state } = body;

        if (!code || !state) {
          return new Response(
            JSON.stringify({ error: 'Código e estado são obrigatórios' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Parse state
        let stateData: { userId: string; volunteerId?: string; timestamp: number };
        try {
          stateData = JSON.parse(atob(state));
        } catch {
          return new Response(
            JSON.stringify({ error: 'Estado inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify state is recent (10 minutes)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
          return new Response(
            JSON.stringify({ error: 'Link de autorização expirado' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: googleClientId,
            client_secret: googleClientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: googleRedirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error('Token exchange failed:', error);
          return new Response(
            JSON.stringify({ error: 'Falha ao trocar código por token' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokens = await tokenResponse.json();

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        let userEmail = null;
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          userEmail = userInfo.email;
        }

        // Calculate token expiry
        const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

        // Upsert token
        const { error: upsertError } = await supabase
          .from('google_calendar_tokens')
          .upsert({
            user_id: stateData.userId,
            volunteer_id: stateData.volunteerId || null,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expiry: tokenExpiry,
            email: userEmail,
            scopes: GOOGLE_SCOPES.split(' '),
            is_active: true,
            last_sync_at: new Date().toISOString(),
          }, {
            onConflict: stateData.volunteerId ? 'volunteer_id' : 'user_id',
          });

        if (upsertError) {
          console.error('Error saving token:', upsertError);
          throw upsertError;
        }

        return new Response(
          JSON.stringify({ success: true, email: userEmail }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Autenticação necessária' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json().catch(() => ({}));
        const volunteerId = body.volunteer_id;

        let deleteQuery = supabase
          .from('google_calendar_tokens')
          .delete()
          .eq('user_id', userId);

        if (volunteerId) {
          deleteQuery = deleteQuery.eq('volunteer_id', volunteerId);
        }

        const { error: deleteError } = await deleteQuery;

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Autenticação necessária' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json().catch(() => ({}));
        const volunteerId = body.volunteer_id;

        let query = supabase
          .from('google_calendar_tokens')
          .select('id, email, token_expiry, is_active, last_sync_at, volunteer_id')
          .eq('user_id', userId);

        if (volunteerId) {
          query = query.eq('volunteer_id', volunteerId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        if (!data) {
          return new Response(
            JSON.stringify({ connected: false }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const isExpired = new Date(data.token_expiry) < new Date();

        return new Response(
          JSON.stringify({
            connected: data.is_active && !isExpired,
            email: data.email,
            expired: isExpired,
            last_sync: data.last_sync_at,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh': {
        // Refresh access token
        const body = await req.json();
        const { volunteer_id } = body;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Autenticação necessária' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let query = supabase
          .from('google_calendar_tokens')
          .select('*')
          .eq('user_id', userId);

        if (volunteer_id) {
          query = query.eq('volunteer_id', volunteer_id);
        }

        const { data: tokenData, error: fetchError } = await query.single();

        if (fetchError || !tokenData) {
          return new Response(
            JSON.stringify({ error: 'Token não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

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
          const error = await refreshResponse.text();
          console.error('Token refresh failed:', error);

          // Mark token as inactive
          await supabase
            .from('google_calendar_tokens')
            .update({ is_active: false })
            .eq('id', tokenData.id);

          return new Response(
            JSON.stringify({ error: 'Falha ao renovar token. Reconecte o Google Calendar.' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newTokens = await refreshResponse.json();
        const newExpiry = new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString();

        // Update token
        await supabase
          .from('google_calendar_tokens')
          .update({
            access_token: newTokens.access_token,
            token_expiry: newExpiry,
            is_active: true,
          })
          .eq('id', tokenData.id);

        return new Response(
          JSON.stringify({ success: true, expires_at: newExpiry }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida. Use: authorize, callback, disconnect, status, refresh' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in google-calendar-auth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
