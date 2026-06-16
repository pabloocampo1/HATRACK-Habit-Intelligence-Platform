

-- Modelos de habitos: 

-- Crear tabla habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  frequency INT NOT NULL,
  target_minutes INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla habit_logs
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  minutes_completed INT DEFAULT 0,
  quality_score INT DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  daily_focus TEXT,
  energy_level INT,
  mental_state TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para queries rápidas
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(user_id, log_date);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);

-- POLÍTICAS RLS (Row-Level Security)

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for habits
CREATE POLICY "Users can see their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for habit_logs
CREATE POLICY "Users can see their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- MÓDULO: RETOS PERSONALES (Challenges)
-- ============================================================

-- Tabla de retos
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  duration_days INT NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hábitos que pertenecen a un reto (puede ser un habit existente o uno "solo para el reto")
CREATE TABLE challenge_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  -- Si el hábito fue creado solo para el reto, guardamos sus datos aquí
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  target_minutes INT DEFAULT 0,
  is_linked_habit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Registros diarios de un reto: marca qué challenge_habits completó el usuario por día
CREATE TABLE challenge_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  challenge_habit_id UUID NOT NULL REFERENCES challenge_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  -- Si hay habit_id vinculado, guardamos la referencia al habit_log creado automáticamente
  habit_log_id UUID REFERENCES habit_logs(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_habit_id, log_date)
);

-- Índices
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenge_habits_challenge_id ON challenge_habits(challenge_id);
CREATE INDEX idx_challenge_logs_challenge_id ON challenge_logs(challenge_id);
CREATE INDEX idx_challenge_logs_date ON challenge_logs(challenge_id, log_date);

-- RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenges"        ON challenges       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own challenge_habits"  ON challenge_habits FOR ALL USING (
  EXISTS (SELECT 1 FROM challenges c WHERE c.id = challenge_habits.challenge_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users manage own challenge_logs"    ON challenge_logs   FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MÓDULO: PLANES Y SUSCRIPCIONES
-- ============================================================

-- Perfil público 1:1 con auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'pro_plus', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  -- Referencia futura a Stripe/MercadoPago
  external_id TEXT,
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Trigger: insertar suscripción FREE por defecto al crear perfil
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, starts_at)
  VALUES (NEW.id, 'free', 'active', NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- Índices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users read own subscription"   ON subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Solo backend service role puede INSERT/UPDATE suscripciones (evita que el usuario escale su plan manualmente)
CREATE POLICY "Service role manages subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════
-- MÓDULO: METAS PERSONALES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  why           text,                          -- motivación / razón de fondo
  category      text NOT NULL DEFAULT 'personal',
  priority      text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
  target_date   date,
  progress_manual int CHECK (progress_manual BETWEEN 0 AND 100), -- solo si no usa hitos
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE goal_milestones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title       text NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  due_date    date,
  created_at  timestamptz DEFAULT now()
);

-- Hábitos vinculados a una meta (solo PRO — se valida en el servicio)
CREATE TABLE goal_habits (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id   uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  habit_id  uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(goal_id, habit_id)
);

-- Retos vinculados a una meta (solo PRO — se valida en el servicio)
CREATE TABLE goal_challenges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id      uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(goal_id, challenge_id)
);

-- Índices
CREATE INDEX idx_goals_user_id   ON goals(user_id);
CREATE INDEX idx_goals_status    ON goals(status);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_habits_goal_id     ON goal_habits(goal_id);
CREATE INDEX idx_goal_challenges_goal_id ON goal_challenges(goal_id);

-- RLS
ALTER TABLE goals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_habits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_challenges  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own goals"
  ON goals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own milestones"
  ON goal_milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users manage own goal_habits"
  ON goal_habits FOR ALL
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_habits.goal_id AND goals.user_id = auth.uid()));

CREATE POLICY "Users manage own goal_challenges"
  ON goal_challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_challenges.goal_id AND goals.user_id = auth.uid()));

-- Función segura para que el usuario elimine su propia cuenta
-- Se ejecuta con SECURITY DEFINER para poder borrar en auth.users
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;