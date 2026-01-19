import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleRequest {
  service_date: string;
  service_name?: string;
  roles: string[];
  volunteer_ids?: string[];
  start_time?: string;
  end_time?: string;
}

interface Volunteer {
  id: string;
  name: string;
  role: string;
}

function assignVolunteers(roles: string[], volunteers: Volunteer[]): { role: string; volunteer_id: string }[] {
  const assignments: { role: string; volunteer_id: string }[] = [];
  if (volunteers.length === 0) return assignments;
  
  const volunteersByRole: Record<string, Volunteer[]> = {};
  const generalVolunteers: Volunteer[] = [];
  
  for (const volunteer of volunteers) {
    const volunteerRole = volunteer.role?.toLowerCase() || 'geral';
    if (volunteerRole === 'geral') {
      generalVolunteers.push(volunteer);
    } else {
      if (!volunteersByRole[volunteerRole]) volunteersByRole[volunteerRole] = [];
      volunteersByRole[volunteerRole].push(volunteer);
    }
  }
  
  const usedVolunteerIds = new Set<string>();
  
  for (const role of roles) {
    const roleLower = role.toLowerCase();
    let assigned = false;
    
    if (volunteersByRole[roleLower]) {
      for (const volunteer of volunteersByRole[roleLower]) {
        if (!usedVolunteerIds.has(volunteer.id)) {
          assignments.push({ role, volunteer_id: volunteer.id });
          usedVolunteerIds.add(volunteer.id);
          assigned = true;
          break;
        }
      }
    }
    
    if (!assigned) {
      for (const volunteer of generalVolunteers) {
        if (!usedVolunteerIds.has(volunteer.id)) {
          assignments.push({ role, volunteer_id: volunteer.id });
          usedVolunteerIds.add(volunteer.id);
          assigned = true;
          break;
        }
      }
    }
    
    if (!assigned) {
      for (const volunteer of volunteers) {
        if (!usedVolunteerIds.has(volunteer.id)) {
          assignments.push({ role, volunteer_id: volunteer.id });
          usedVolunteerIds.add(volunteer.id);
          break;
        }
      }
    }
  }
  
  return assignments;
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) throw new Error('Authentication required');
    
    const userId = getUserIdFromToken(token);
    if (!userId) throw new Error('Invalid authentication token');
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const body: ScheduleRequest = await req.json();
    
    if (!body.service_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.service_date)) {
      throw new Error('service_date is required (YYYY-MM-DD)');
    }
    
    if (!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) {
      throw new Error('roles is required and must be a non-empty array');
    }

    let query = supabaseClient
      .from('volunteers')
      .select('id, name, role')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (body.volunteer_ids && body.volunteer_ids.length > 0) {
      query = query.in('id', body.volunteer_ids);
    }
    
    const { data: volunteers, error: volunteerError } = await query;
    
    if (volunteerError) throw new Error('Failed to fetch volunteers');
    if (!volunteers || volunteers.length === 0) throw new Error('No available volunteers found');

    const assignments = assignVolunteers(body.roles, volunteers as Volunteer[]);
    if (assignments.length === 0) throw new Error('Could not assign any volunteers');

    const scheduleInserts = assignments.map(a => ({
      user_id: userId,
      volunteer_id: a.volunteer_id,
      service_date: body.service_date,
      service_name: body.service_name || 'Culto',
      role: a.role,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      status: 'scheduled',
    }));

    const { data: insertedSchedules, error: insertError } = await supabaseClient
      .from('volunteer_schedules')
      .insert(scheduleInserts)
      .select('*, volunteers(id, name, role)');

    if (insertError) throw new Error('Failed to save schedules');

    console.log('Schedule generated:', insertedSchedules?.length);

    return new Response(
      JSON.stringify({ success: true, schedules: insertedSchedules, message: `${insertedSchedules?.length || 0} escalas criadas` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
