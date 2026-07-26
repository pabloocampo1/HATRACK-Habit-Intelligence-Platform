-- Permitir estado "failed" en retos finalizados sin cumplir la meta (>= 70%)
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_status_check;
ALTER TABLE challenges ADD CONSTRAINT challenges_status_check
  CHECK (status IN ('active', 'completed', 'failed', 'abandoned'));
