import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient, ValidationError, RateLimitError, checkRateLimit, logSecurityEvent, validateInput, sanitizeText } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SmartScheduleRequest {
  service_date: string;
  service_name?: string;
  roles: string[];
  volunteer_ids?: string[];
  start_time?: string;
  end_time?: string;
  use_ai_optimization?: boolean;
  consider_calendar_availability?: boolean;
  preferences?: {
    avoid_consecutive_weeks?: boolean;
    balance_workload?: boolean;
    respect_role_preferences?: boolean;
  };
}

interface VolunteerWithHistory {
  id: string;
  name: string;
  role: string;
  email: string | null;
  schedules_count: number;
  last_schedule_date: string | null;
  roles_worked: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | null = null;
  let supabaseClient: any = null;

  try {
    const auth = createAuthenticatedClient(req);
    supabaseClient = auth.client;
    userId = auth.userId;

    if (!userId) {
      throw new ValidationError('Autenticação necessária');
    }

    await checkRateLimit(supabaseClient, userId, 'generate-smart-schedule');

    const body: SmartScheduleRequest = await req.json();
    const { 
      service_date, 
      service_name = 'Culto', 
      roles, 
      volunteer_ids,
      start_time,
      end_time,
      use_ai_optimization = false,
      preferences = {}
    } = body;

    // Validations
    validateInput('service_date', { value: service_date, type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ });
    validateInput('roles', { value: roles, type: 'array', required: true });

    if (roles.length === 0) {
      throw new ValidationError('Pelo menos uma função é necessária');
    }

    // Fetch volunteers with history
    let volunteerQuery = supabaseClient
      .from('volunteers')
      .select('id, name, role, email, is_active')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (volunteer_ids && volunteer_ids.length > 0) {
      volunteerQuery = volunteerQuery.in('id', volunteer_ids);
    }

    const { data: volunteers, error: volunteerError } = await volunteerQuery;

    if (volunteerError) throw volunteerError;
    if (!volunteers || volunteers.length === 0) {
      throw new ValidationError('Nenhum voluntário disponível');
    }

    // Get schedule history (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const historyStartDate = threeMonthsAgo.toISOString().split('T')[0];

    const { data: scheduleHistory, error: historyError } = await supabaseClient
      .from('volunteer_schedules')
      .select('volunteer_id, service_date, role, status')
      .eq('user_id', userId)
      .gte('service_date', historyStartDate)
      .order('service_date', { ascending: false });

    if (historyError) throw historyError;

    // Build volunteer data with history
    const volunteersWithHistory: VolunteerWithHistory[] = volunteers.map((v: any) => {
      const volHistory = (scheduleHistory || []).filter((s: any) => s.volunteer_id === v.id);
      const rolesWorked = [...new Set(volHistory.map((s: any) => s.role))];
      
      return {
        id: v.id,
        name: v.name,
        role: v.role,
        email: v.email,
        schedules_count: volHistory.length,
        last_schedule_date: volHistory[0]?.service_date || null,
        roles_worked: rolesWorked,
      };
    });

    let assignments: { role: string; volunteer_id: string; volunteer_name: string; reason?: string }[];
    let aiReasoning: string | undefined;
    let conflicts: { volunteer_id: string; volunteer_name: string; reason: string }[] = [];

    if (use_ai_optimization) {
      // Use AI for optimization
      const aiResult = await generateWithAI(
        service_date,
        service_name,
        roles,
        volunteersWithHistory,
        scheduleHistory || [],
        preferences
      );
      assignments = aiResult.assignments;
      aiReasoning = aiResult.reasoning;
      conflicts = aiResult.conflicts;
    } else {
      // Use simple rotation algorithm
      assignments = generateSimpleRotation(roles, volunteersWithHistory, scheduleHistory || [], preferences);
    }

    // Insert schedules
    const scheduleInserts = assignments.map((a) => ({
      user_id: userId,
      volunteer_id: a.volunteer_id,
      service_date,
      service_name: sanitizeText(service_name, 100),
      role: a.role,
      start_time: start_time || null,
      end_time: end_time || null,
      status: 'scheduled',
    }));

    const { data: insertedSchedules, error: insertError } = await supabaseClient
      .from('volunteer_schedules')
      .insert(scheduleInserts)
      .select(`
        *,
        volunteers (
          id,
          name,
          email
        )
      `);

    if (insertError) throw insertError;

    // Create confirmation tokens for each schedule
    const tokenInserts = (insertedSchedules || []).map((s: any) => ({
      schedule_id: s.id,
    }));

    if (tokenInserts.length > 0) {
      await supabaseClient
        .from('schedule_confirmation_tokens')
        .insert(tokenInserts);
    }

    // Log event
    await logSecurityEvent(supabaseClient, userId, 'smart_schedule_generated', 'generate-smart-schedule', true, undefined, {
      service_date,
      roles,
      use_ai: use_ai_optimization,
      schedules_created: insertedSchedules?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        schedules: insertedSchedules,
        assignments: assignments.map((a) => ({
          ...a,
          volunteer_name: volunteersWithHistory.find((v) => v.id === a.volunteer_id)?.name,
        })),
        ai_reasoning: aiReasoning,
        conflicts,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-smart-schedule:', error);

    if (supabaseClient && userId) {
      await logSecurityEvent(supabaseClient, userId, 'smart_schedule_error', 'generate-smart-schedule', false,
        error instanceof Error ? error.message : 'Unknown error');
    }

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, type: 'validation_error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof RateLimitError) {
      return new Response(
        JSON.stringify({ error: error.message, type: 'rate_limit_error', retry_after: error.retryAfter }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSimpleRotation(
  roles: string[],
  volunteers: VolunteerWithHistory[],
  history: any[],
  preferences: any
): { role: string; volunteer_id: string; volunteer_name: string; reason: string }[] {
  const assignments: { role: string; volunteer_id: string; volunteer_name: string; reason: string }[] = [];
  const usedVolunteers = new Set<string>();

  for (const role of roles) {
    // Find best volunteer for this role
    const eligibleVolunteers = volunteers
      .filter((v) => !usedVolunteers.has(v.id))
      .map((v) => {
        let score = 0;
        
        // Prefer volunteers with matching role
        if (preferences.respect_role_preferences !== false && v.role === role) {
          score += 100;
        }

        // Balance workload - prefer volunteers with fewer schedules
        if (preferences.balance_workload !== false) {
          score -= v.schedules_count * 5;
        }

        // Avoid consecutive weeks
        if (preferences.avoid_consecutive_weeks !== false && v.last_schedule_date) {
          const daysSinceLastSchedule = Math.floor(
            (new Date().getTime() - new Date(v.last_schedule_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastSchedule < 7) {
            score -= 50;
          } else {
            score += Math.min(daysSinceLastSchedule, 30);
          }
        }

        // Experience in role
        if (v.roles_worked.includes(role)) {
          score += 20;
        }

        return { volunteer: v, score };
      })
      .sort((a, b) => b.score - a.score);

    if (eligibleVolunteers.length > 0) {
      const selected = eligibleVolunteers[0].volunteer;
      usedVolunteers.add(selected.id);
      
      let reason = 'Selecionado por rotação';
      if (selected.role === role) {
        reason = 'Função preferencial do voluntário';
      } else if (selected.roles_worked.includes(role)) {
        reason = 'Experiência anterior nesta função';
      }

      assignments.push({
        role,
        volunteer_id: selected.id,
        volunteer_name: selected.name,
        reason,
      });
    }
  }

  return assignments;
}

async function generateWithAI(
  serviceDate: string,
  serviceName: string,
  roles: string[],
  volunteers: VolunteerWithHistory[],
  history: any[],
  preferences: any
): Promise<{
  assignments: { role: string; volunteer_id: string; volunteer_name: string; reason: string }[];
  reasoning: string;
  conflicts: { volunteer_id: string; volunteer_name: string; reason: string }[];
}> {
  const aiGatewayUrl = Deno.env.get('AI_GATEWAY_URL') || 'https://ai.gateway.lovable.dev';

  const volunteersContext = volunteers.map((v) => ({
    id: v.id,
    name: v.name,
    preferred_role: v.role,
    schedules_count: v.schedules_count,
    last_schedule: v.last_schedule_date,
    roles_worked: v.roles_worked,
  }));

  const recentHistory = history.slice(0, 50).map((h) => ({
    volunteer_id: h.volunteer_id,
    date: h.service_date,
    role: h.role,
  }));

  const prompt = `Você é um assistente especializado em organizar escalas de voluntários de igreja.

CONTEXTO:
- Data do culto: ${serviceDate}
- Nome do evento: ${serviceName}
- Funções necessárias: ${roles.join(', ')}

VOLUNTÁRIOS DISPONÍVEIS:
${JSON.stringify(volunteersContext, null, 2)}

HISTÓRICO RECENTE (últimos 3 meses):
${JSON.stringify(recentHistory, null, 2)}

REGRAS DE PREFERÊNCIA:
- Evitar semanas consecutivas: ${preferences.avoid_consecutive_weeks !== false}
- Balancear carga de trabalho: ${preferences.balance_workload !== false}
- Respeitar função preferencial: ${preferences.respect_role_preferences !== false}

INSTRUÇÕES:
1. Distribua as funções entre os voluntários disponíveis
2. Priorize voluntários com a função preferencial correspondente
3. Evite escalar a mesma pessoa em semanas consecutivas
4. Tente balancear a carga entre todos os voluntários
5. Se não houver voluntário ideal, escolha o melhor disponível

Retorne APENAS um JSON válido (sem markdown) no formato:
{
  "assignments": [
    { "role": "função", "volunteer_id": "id", "reason": "razão da escolha" }
  ],
  "conflicts": [
    { "volunteer_id": "id", "reason": "motivo do conflito" }
  ],
  "summary": "resumo das decisões"
}`;

  try {
    const response = await fetch(`${aiGatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um assistente que organiza escalas de voluntários. Responda sempre com JSON válido.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Map volunteer names
    const assignments = (parsed.assignments || []).map((a: any) => ({
      role: a.role,
      volunteer_id: a.volunteer_id,
      volunteer_name: volunteers.find((v) => v.id === a.volunteer_id)?.name || 'Desconhecido',
      reason: a.reason,
    }));

    const conflicts = (parsed.conflicts || []).map((c: any) => ({
      volunteer_id: c.volunteer_id,
      volunteer_name: volunteers.find((v) => v.id === c.volunteer_id)?.name || 'Desconhecido',
      reason: c.reason,
    }));

    return {
      assignments,
      reasoning: parsed.summary || 'Escala gerada com IA',
      conflicts,
    };
  } catch (error) {
    console.error('AI generation failed, falling back to simple rotation:', error);
    // Fallback to simple rotation
    return {
      assignments: generateSimpleRotation(roles, volunteers, history, preferences),
      reasoning: 'Gerado com algoritmo de rotação (IA indisponível)',
      conflicts: [],
    };
  }
}
