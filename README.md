# HaTrack — Personal OS

> *No se trata de hacer más. Se trata de entender cómo estás viviendo.*

HaTrack es un sistema de gestión de vida personal diseñado para personas que quieren medir, mejorar y dominar todas las áreas importantes de su vida desde un solo lugar.

No es una app de hábitos. Es un sistema operativo personal.

---

## Qué es y para qué sirve

La mayoría de las apps de productividad se quedan en lo superficial: marcar tareas, contar rachas, mostrar gráficas bonitas. HaTrack va más profundo.

El sistema responde preguntas reales:

- ¿Soy disciplinado o solo motivado cuando me conviene?
- ¿Mi rendimiento depende de mi energía ese día?
- ¿Cuándo soy más productivo y por qué?
- ¿Estoy creciendo o solo repitiendo los mismos patrones?
- ¿Mis hábitos están alineados con mis metas de vida?
- ¿Mis finanzas reflejan mis prioridades?

Cada módulo captura una dimensión diferente de tu vida y todas convergen en el dashboard para darte una visión unificada de quién eres como persona.

---

## Módulos actuales

### Hábitos personales

El núcleo del sistema. Cada hábito no solo se marca como hecho — se registra con contexto real:

- Minutos dedicados vs minutos objetivo
- Calidad de ejecución (1–5)
- Nivel de energía (1–5)
- Estado mental (enfocado, motivado, distraído, cansado, estresado)
- Notas de la sesión

Esto permite analizar no solo *qué hiciste*, sino *cómo* y *en qué condiciones* lo hiciste.

### Retos personales

Sistema de desafíos de duración definida (7, 15, 30, 60 o 90 días). Cada reto puede vincular hábitos existentes o crear hábitos exclusivos para el reto.

Incluye:
- Mapa de días completados / fallidos
- Racha actual y máxima
- Tasa de completitud por hábito
- Banner de resumen al finalizar

### Metas personales

Define objetivos grandes con fecha límite, motivación ("¿por qué lo quieres?") y prioridad. Divide cada meta en hitos alcanzables que calculan automáticamente el progreso.

Los usuarios PRO pueden vincular sus hábitos y retos existentes a una meta para ver cómo su trabajo diario contribuye a objetivos mayores.

### Vida financiera

Seguimiento de ingresos, gastos y flujo de dinero con:

- Cuentas (Nequi, efectivo, bancaria, tarjeta)
- Transacciones categorizadas
- Obligaciones periódicas
- Presupuestos por categoría
- Metas de ahorro
- Reportes

### Dashboard unificado

Vista consolidada del día con:
- KPIs de rendimiento (disciplina, consistencia, enfoque, dedicación, crecimiento)
- Check-in diario de hábitos con registro de sesión inline
- Meta personal destacada (la de mayor prioridad activa)
- Estadísticas semanales y mensuales

---

## Próximamente

- **Módulo Fitness** — seguimiento de entrenamientos, series, repeticiones y progresión de carga
- **Módulo Aprendizaje** — libros leídos, cursos, horas de estudio
- **Journal diario** — reflexión breve conectada al estado mental registrado en los hábitos
- **Dashboard de vida unificado** — radar por área (hábitos, finanzas, fitness, aprendizaje)
- **Insights automáticos** — detección de patrones y correlaciones en tu comportamiento

---

## Sistema de planes

| Función | FREE | PRO |
|---|---|---|
| Hábitos activos | 8 | Ilimitados |
| Retos activos | 4 | Ilimitados |
| Hábitos por reto | 5 | Ilimitados |
| Metas activas | 5 | Ilimitadas |
| Hitos por meta | 3 | Ilimitados |
| Vincular hábitos/retos a metas | No | Sí |
| Historial visible | 30 días | Todo |
| Sesiones por hábito por día | 1 | Ilimitadas |

---

## Métricas del sistema

El sistema calcula 5 KPIs internos que reflejan diferentes dimensiones del rendimiento:

| Métrica | Qué mide |
|---|---|
| Disciplina | Hábitos completados vs esperados |
| Consistencia | Frecuencia con que apareces (días activos) |
| Enfoque | Calidad promedio de ejecución |
| Dedicación | Tiempo invertido vs tiempo planeado |
| Crecimiento | Evolución respecto a periodos anteriores |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Estilos | TailwindCSS v4 |
| Autenticación | Supabase Auth + `@supabase/ssr` |
| PWA | `@ducanh2912/next-pwa` |

---

## Arquitectura

El sistema sigue un patrón estricto de tres capas para cada módulo:

```
Server Action (controlador)
    ↓
Service (lógica de negocio + validaciones de plan)
    ↓
Repository (acceso a Supabase)
```

**Reglas:**
- Los Server Actions son los únicos puntos de entrada desde el cliente
- Los Services contienen toda la lógica de negocio, incluyendo guards de límites por plan
- Los Repositories son la única capa que habla con Supabase directamente
- Row Level Security (RLS) activo en todas las tablas — el backend nunca asume que el usuario tiene acceso

---

## Estructura de carpetas

```
app/
  (auth)/          — Login, Signup
  (dashboard)/
    dashboard/     — Dashboard principal
    habits/        — Módulo hábitos
    retos/         — Módulo retos
    metas/         — Módulo metas personales
    finanzas/      — Módulo vida financiera
    profile/       — Perfil y plan
  actions/         — Server actions por módulo
services/          — Lógica de negocio
  habitService.ts
  goals/
  challenges/
  plans/
  finance/
lib/
  supabase/
    repository/    — Acceso a DB
    config/        — Cliente browser y server
  plans/
    limits.ts      — Fuente única de verdad para límites por plan
  types.ts         — Interfaces TypeScript globales
components/        — Componentes compartidos (Sidebar, Header, etc.)
```

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Desarrollo local

```bash
npm install
npm run dev
```

Para producción con webpack (requerido por next-pwa):

```bash
npm run build
```

---

## Filosofía

Este sistema nace de una premisa simple: **la motivación es temporal, los sistemas son permanentes**.

HaTrack no te motiva. Te muestra en datos quién eres realmente, para que puedas decidir conscientemente quién quieres ser.

---
