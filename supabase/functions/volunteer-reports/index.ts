import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAuthenticatedClient, ValidationError, checkRateLimit, logSecurityEvent } from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  report_type: 'volunteer_summary' | 'role_distribution' | 'attendance_trend' | 'monthly_overview';
  start_date: string;
  end_date: string;
  volunteer_ids?: string[];
  roles?: string[];
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

    await checkRateLimit(supabaseClient, userId, 'volunteer-reports');

    const body: ReportRequest = await req.json();
    const { report_type, start_date, end_date, volunteer_ids, roles } = body;

    if (!report_type || !start_date || !end_date) {
      throw new ValidationError('Tipo de relatório, data inicial e data final são obrigatórios');
    }

    let report: any;

    switch (report_type) {
      case 'volunteer_summary':
        report = await generateVolunteerSummary(supabaseClient, userId, start_date, end_date, volunteer_ids);
        break;
      case 'role_distribution':
        report = await generateRoleDistribution(supabaseClient, userId, start_date, end_date);
        break;
      case 'attendance_trend':
        report = await generateAttendanceTrend(supabaseClient, userId, start_date, end_date);
        break;
      case 'monthly_overview':
        report = await generateMonthlyOverview(supabaseClient, userId, start_date, end_date);
        break;
      default:
        throw new ValidationError('Tipo de relatório inválido');
    }

    await logSecurityEvent(supabaseClient, userId, 'report_generated', 'volunteer-reports', true, undefined, {
      report_type,
      start_date,
      end_date,
    });

    return new Response(
      JSON.stringify({ success: true, report }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in volunteer-reports:', error);

    if (supabaseClient && userId) {
      await logSecurityEvent(supabaseClient, userId, 'report_error', 'volunteer-reports', false, 
        error instanceof Error ? error.message : 'Unknown error');
    }

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, type: 'validation_error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateVolunteerSummary(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string,
  volunteerIds?: string[]
) {
  // Get all schedules in period
  let query = supabase
    .from('volunteer_schedules')
    .select(`
      *,
      volunteers (
        id,
        name,
        role,
        email,
        phone
      )
    `)
    .eq('user_id', userId)
    .gte('service_date', startDate)
    .lte('service_date', endDate);

  if (volunteerIds && volunteerIds.length > 0) {
    query = query.in('volunteer_id', volunteerIds);
  }

  const { data: schedules, error } = await query;

  if (error) throw error;

  // Get unique volunteers
  const { data: volunteers, error: volError } = await supabase
    .from('volunteers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (volError) throw volError;

  // Calculate stats per volunteer
  const volunteerStats = volunteers.map((volunteer: any) => {
    const volSchedules = schedules.filter((s: any) => s.volunteer_id === volunteer.id);
    const confirmed = volSchedules.filter((s: any) => s.status === 'confirmed').length;
    const absent = volSchedules.filter((s: any) => s.status === 'absent').length;
    const total = volSchedules.length;

    // Group by role
    const rolesCounts: Record<string, number> = {};
    volSchedules.forEach((s: any) => {
      rolesCounts[s.role] = (rolesCounts[s.role] || 0) + 1;
    });

    const rolesDistribution = Object.entries(rolesCounts).map(([role, count]) => ({
      role,
      count,
    }));

    return {
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      primary_role: volunteer.role,
      total_schedules: total,
      confirmed,
      absent,
      pending: total - confirmed - absent,
      attendance_rate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      roles_distribution: rolesDistribution,
    };
  });

  // Calculate overall stats
  const totalSchedules = schedules.length;
  const totalConfirmed = schedules.filter((s: any) => s.status === 'confirmed').length;
  const totalAbsent = schedules.filter((s: any) => s.status === 'absent').length;

  return {
    period: { start: startDate, end: endDate },
    total_services: new Set(schedules.map((s: any) => s.service_date)).size,
    total_schedules: totalSchedules,
    total_volunteers: volunteers.length,
    overall_attendance_rate: totalSchedules > 0 ? Math.round((totalConfirmed / totalSchedules) * 100) : 0,
    confirmed_count: totalConfirmed,
    absent_count: totalAbsent,
    pending_count: totalSchedules - totalConfirmed - totalAbsent,
    volunteers: volunteerStats.sort((a: any, b: any) => b.total_schedules - a.total_schedules),
  };
}

async function generateRoleDistribution(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data: schedules, error } = await supabase
    .from('volunteer_schedules')
    .select('role, status')
    .eq('user_id', userId)
    .gte('service_date', startDate)
    .lte('service_date', endDate);

  if (error) throw error;

  // Group by role
  const roleStats: Record<string, { total: number; confirmed: number; absent: number }> = {};

  schedules.forEach((s: any) => {
    if (!roleStats[s.role]) {
      roleStats[s.role] = { total: 0, confirmed: 0, absent: 0 };
    }
    roleStats[s.role].total++;
    if (s.status === 'confirmed') roleStats[s.role].confirmed++;
    if (s.status === 'absent') roleStats[s.role].absent++;
  });

  const distribution = Object.entries(roleStats).map(([role, stats]) => ({
    role,
    total: stats.total,
    confirmed: stats.confirmed,
    absent: stats.absent,
    attendance_rate: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0,
  }));

  return {
    period: { start: startDate, end: endDate },
    total_schedules: schedules.length,
    distribution: distribution.sort((a, b) => b.total - a.total),
  };
}

async function generateAttendanceTrend(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data: schedules, error } = await supabase
    .from('volunteer_schedules')
    .select('service_date, status')
    .eq('user_id', userId)
    .gte('service_date', startDate)
    .lte('service_date', endDate)
    .order('service_date', { ascending: true });

  if (error) throw error;

  // Group by date
  const dateStats: Record<string, { total: number; confirmed: number }> = {};

  schedules.forEach((s: any) => {
    if (!dateStats[s.service_date]) {
      dateStats[s.service_date] = { total: 0, confirmed: 0 };
    }
    dateStats[s.service_date].total++;
    if (s.status === 'confirmed') dateStats[s.service_date].confirmed++;
  });

  const trend = Object.entries(dateStats).map(([date, stats]) => ({
    date,
    total: stats.total,
    confirmed: stats.confirmed,
    attendance_rate: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0,
  }));

  return {
    period: { start: startDate, end: endDate },
    trend,
  };
}

async function generateMonthlyOverview(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data: schedules, error } = await supabase
    .from('volunteer_schedules')
    .select(`
      service_date,
      status,
      role,
      volunteers (
        name
      )
    `)
    .eq('user_id', userId)
    .gte('service_date', startDate)
    .lte('service_date', endDate);

  if (error) throw error;

  // Group by month
  const monthStats: Record<string, { total: number; confirmed: number; services: Set<string>; volunteers: Set<string> }> = {};

  schedules.forEach((s: any) => {
    const month = s.service_date.substring(0, 7); // YYYY-MM
    if (!monthStats[month]) {
      monthStats[month] = { total: 0, confirmed: 0, services: new Set(), volunteers: new Set() };
    }
    monthStats[month].total++;
    if (s.status === 'confirmed') monthStats[month].confirmed++;
    monthStats[month].services.add(s.service_date);
    if (s.volunteers?.name) monthStats[month].volunteers.add(s.volunteers.name);
  });

  const overview = Object.entries(monthStats).map(([month, stats]) => ({
    month,
    total_schedules: stats.total,
    confirmed: stats.confirmed,
    services_count: stats.services.size,
    volunteers_count: stats.volunteers.size,
    attendance_rate: stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0,
  }));

  return {
    period: { start: startDate, end: endDate },
    overview: overview.sort((a, b) => a.month.localeCompare(b.month)),
  };
}
