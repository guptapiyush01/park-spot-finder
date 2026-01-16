-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Notifications should only be inserted by service role (backend/triggers), 
-- not by anonymous users. We'll handle this via edge functions with service role.