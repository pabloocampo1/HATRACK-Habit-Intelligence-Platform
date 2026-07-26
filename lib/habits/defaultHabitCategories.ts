/** Categorías sembradas por defecto al crear la cuenta (productividad + vida personal). */
export const DEFAULT_HABIT_CATEGORIES = [
  { slug: "health", name: "Salud", color: "#34d399", icon: "heart-pulse" },
  { slug: "focus", name: "Enfoque", color: "#22d3ee", icon: "target" },
  { slug: "productivity", name: "Productividad", color: "#38bdf8", icon: "zap" },
  { slug: "fitness", name: "Fitness", color: "#fb923c", icon: "dumbbell" },
  { slug: "learning", name: "Aprendizaje", color: "#facc15", icon: "book-open" },
  { slug: "programming", name: "Programación", color: "#60a5fa", icon: "code-2" },
  { slug: "reading", name: "Lectura", color: "#c084fc", icon: "book" },
  { slug: "languages", name: "Idiomas", color: "#f472b6", icon: "languages" },
  { slug: "meditation", name: "Meditación", color: "#818cf8", icon: "brain" },
  { slug: "finance", name: "Finanzas", color: "#a3e635", icon: "wallet" },
  { slug: "social", name: "Social", color: "#fb7185", icon: "users" },
  { slug: "creativity", name: "Creatividad", color: "#e879f9", icon: "palette" },
  { slug: "wellness", name: "Bienestar", color: "#2dd4bf", icon: "leaf" },
  { slug: "career", name: "Carrera", color: "#94a3b8", icon: "briefcase" },
  { slug: "other", name: "Otro", color: "#64748b", icon: "tag" },
] as const;
