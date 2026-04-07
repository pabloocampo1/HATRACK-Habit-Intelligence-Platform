# 🧠 HATRACK — Sistema de Autogestión y Rendimiento Personal

## 🚀 Descripción General

**HATRACK** es una aplicación diseñada para transformar la manera en que una persona entiende su disciplina, consistencia y crecimiento personal.

No es simplemente un tracker de hábitos.

Es un sistema que convierte acciones diarias en métricas interpretables, permitiendo analizar no solo _qué haces_, sino también:

- Cómo lo haces
- Por qué lo haces
- En qué condiciones lo haces
- Y cómo evolucionas con el tiempo

---

## 🎯 Propósito del Proyecto

La mayoría de las aplicaciones de hábitos se quedan en lo superficial:

> ✔️ Marcar tareas completadas
> ❌ Entender el comportamiento detrás de ellas

Este proyecto nace de una necesidad más profunda:

> **Convertir el esfuerzo diario en información útil para mejorar como persona.**

HATRACK busca responder preguntas como:

- ¿Soy disciplinado o solo motivado a veces?
- ¿Mi rendimiento depende de mi energía?
- ¿Cuándo soy más productivo?
- ¿Estoy creciendo o solo repitiendo patrones?

---

## 🧩 Historia del Proyecto

Este sistema surge de un enfoque personal hacia la mejora continua.

En lugar de depender únicamente de motivación, se plantea una filosofía basada en:

- **Consistencia diaria**
- **Medición objetiva del progreso**
- **Reflexión consciente del comportamiento**

El objetivo fue crear una herramienta que funcione como:

> 🧠 Un espejo de tu disciplina
> 📊 Un analizador de tu comportamiento
> 📈 Un sistema de mejora continua

---

## 🏗️ Arquitectura Conceptual

El sistema se basa en tres niveles de información:

### 1. Datos Cuantitativos

- Minutos dedicados
- Frecuencia de hábitos
- Completitud

### 2. Datos Cualitativos

- Calidad de ejecución (1-5)
- Nivel de enfoque
- Estado mental

### 3. Contexto Personal

- Energía
- Notas
- Intención diaria (focus)

---

## 📊 Sistema de Métricas (KPIs)

El núcleo del sistema está basado en 5 métricas clave:

### 🔵 Disciplina

- Basada en: hábitos completados vs esperados
- Representa: cumplimiento de compromisos

---

### 🟢 Consistencia

- Basada en: frecuencia de actividad
- Representa: qué tan seguido apareces

---

### 🟡 Enfoque

- Basado en: calidad de ejecución
- Representa: qué tan bien haces las cosas

---

### 🟣 Dedicación

- Basada en: tiempo invertido vs planificado
- Representa: cuánto esfuerzo real aplicas

---

### 🔴 Crecimiento

- Basado en: evolución respecto a periodos anteriores
- Representa: mejora continua

---

## 🧱 Modelo de Datos

### Habit

```ts
interface Habit {
  id: string;
  user_id: string;
  title: string;
  category: string;
  frequency: number; // veces por semana
  target_minutes: number;
  created_at: string;
}
```

### HabitLog

```ts
interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  minutes_completed: number;
  quality_score: number;
  completed: boolean;
  notes?: string;
  daily_focus?: string;
  energy_level?: number;
  mental_state?: string;
}
```

---

## 🎨 Experiencia de Usuario

El diseño de la aplicación está enfocado en:

- Minimalismo visual
- Feedback inmediato
- Interpretación clara de datos
- Reflexión consciente

Cada input dentro del sistema tiene una intención:

| Campo         | Propósito               |
| ------------- | ----------------------- |
| Minutos       | Medir esfuerzo real     |
| Calidad       | Evaluar ejecución       |
| Notas         | Capturar contexto       |
| Enfoque       | Definir intención       |
| Energía       | Analizar rendimiento    |
| Estado mental | Entender comportamiento |

---

## ⚙️ Tecnologías

- **Frontend:** React / Next.js
- **Backend:** (Integrable con Spring Boot o APIs REST)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Arquitectura:** Modular y escalable

---

## 🤝 Guía para Contribuidores (Open Source)

Este proyecto está diseñado para crecer con la comunidad.

Si quieres contribuir, aquí hay áreas clave donde puedes aportar valor:

### 📊 Sistema de Gráficas (PRIORIDAD ALTA)

Actualmente, el sistema **no cuenta con visualización avanzada de datos**, lo cual limita la interpretación del progreso.

Se necesitan contribuciones para implementar:

#### 🔹 Gráficas en el Perfil del Usuario

- Evolución de disciplina en el tiempo
- Tendencia de consistencia semanal
- Promedio de calidad por hábito

#### 🔹 Gráficas en la Sección de Estadísticas

- Comparación entre hábitos
- Distribución de tiempo invertido
- Relación entre energía vs rendimiento
- Crecimiento histórico

---

### 🛠️ Sugerencias Técnicas

Puedes implementar estas gráficas usando:

- Recharts
- Chart.js
- D3.js (nivel más avanzado)

Se recomienda:

- Componentes reutilizables
- Separación clara entre lógica y UI
- Manejo eficiente de datos (memoización si es necesario)

---

### 📌 Issues Recomendados

Puedes comenzar creando o tomando issues como:

- `feature: user profile charts`
- `feature: habit statistics dashboard`
- `enhancement: data visualization layer`
- `refactor: metrics calculation optimization`

---

### 🧪 Buenas Prácticas

- Mantener código limpio y legible
- Seguir principios de componentes desacoplados
- Documentar funciones complejas
- Crear commits descriptivos

---

## 🧠 Filosofía del Sistema

Este proyecto se basa en una idea clave:

> _No puedes mejorar lo que no mides, y no puedes entender lo que no interpretas._

Por eso, el sistema no solo muestra números.

Los explica.

---

## 📈 Futuras Mejoras

- 🔍 Análisis inteligente de patrones
- 🤖 Insights automáticos (tipo coach)
- 📊 Comparación histórica avanzada
- 🧬 Sistema de niveles (gamificación)
- 📅 Proyecciones de rendimiento

---

## 🏁 Conclusión

HATRACK no es una app de hábitos común.

Es un sistema diseñado para personas que buscan:

- Disciplina real
- Mejora continua
- Autoconocimiento profundo

---

## 👨‍💻 Autor

Desarrollado con enfoque en crecimiento personal, disciplina y mejora continua.

---

## ⚡ Frase del sistema

> “No se trata de hacer más…
> se trata de entender cómo estás viviendo.”

---
