-- Allow admins to delete specialists
CREATE POLICY "Admins can delete specialists"
ON public.specialists FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));