import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  const trackEvent = async (
    eventType: string, 
    eventData?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_analytics').insert({
        user_id: user.id,
        event_type: eventType,
        event_data: eventData || {}
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  return { trackEvent };
};
