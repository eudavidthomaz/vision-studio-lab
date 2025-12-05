-- Create or replace function to handle new user role and quota creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 'free' role for new users (using composite unique constraint)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create initial quota
  INSERT INTO public.usage_quotas (user_id, reset_date)
  VALUES (NEW.id, CURRENT_DATE + INTERVAL '1 month')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Create missing records for existing users using composite constraint
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'free' FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id);

INSERT INTO public.usage_quotas (user_id, reset_date)
SELECT id, CURRENT_DATE + INTERVAL '1 month' FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.usage_quotas uq WHERE uq.user_id = u.id);