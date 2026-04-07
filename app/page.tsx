import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/hatrack_logo.png";

// Componente reutilizable para las secciones de características
const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => (
  <div className="border border-black/10 rounded-2xl p-6 bg-white transition hover:border-black/30 hover:shadow-lg">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-base text-black/70 leading-relaxed">{description}</p>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* --- NAV BAR MINIMALISTA --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Un logo simple text-based */}
            <div className="w-3 h-8 bg-black"></div>
            <span className="text-xl font-black uppercase tracking-tighter">
              PERFORMANCE
              <span className="font-light text-black/60">TRACKER</span>
            </span>

            <Image
              src={logo}
              alt="Descripción de la imagen"
              width={100}
              height={100}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-full border-2 border-black bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 md:pt-40 md:pb-28 border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full border border-black/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black/70 mb-6">
            Mide tu Crecimiento Personal como un Pro
          </span>
          <div className="flex justify-center items-center">
            <Image
              src={logo}
              alt="Descripción de la imagen"
              width={300}
              height={300}
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-none uppercase tracking-tighter mb-6">
            TRANSFORMA TUS ACCIONES EN{" "}
            <span className="bg-black text-white px-2">MÉTRICAS</span>{" "}
            CUANTIFICABLES
          </h1>
          <p className="text-xl md:text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed mb-12">
            La aplicación de autodesarrollo que convierte tu disciplina,
            consistencia y enfoque en una Player Card visual. Deja de adivinar
            tu progreso y empieza a verlo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-full border-2 border-black bg-black px-10 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black shadow-2xl"
            >
              Crea tu Perfil de Rendimiento
            </Link>
            <Link
              href="#como-funciona"
              className="w-full sm:w-auto text-sm font-bold uppercase tracking-widest text-black/70 hover:text-black transition py-4"
            >
              Descubre cómo →
            </Link>
          </div>
        </div>
      </header>

      {/* --- SECCIÓN 1: EL PROBLEMA vs SOLUCIÓN --- */}
      <section className="py-20 md:py-28 bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-white/60 mb-3 block">
              El Problema
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">
              El Progreso Invisible te frena
            </h2>
            <ul className="space-y-6 text-xl text-white/80">
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">❌</span>
                <div>
                  <strong className="text-white">Registros Binarios:</strong> La
                  mayoría de apps solo miden si hiciste algo o no (Sí/No).
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">❌</span>
                <div>
                  <strong className="text-white">Sin Calidad:</strong> No se
                  considera la intensidad, frecuencia real o el impacto de la
                  actividad.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-2xl mt-1">❌</span>
                <div>
                  <strong className="text-white">Falsa Sensación:</strong>{" "}
                  Llenar checks no significa que estés mejorando realmente.
                </div>
              </li>
            </ul>
          </div>
          <div className="border-l-4 border-white pl-12 py-6">
            <span className="text-sm font-bold uppercase tracking-widest text-white/60 mb-3 block">
              Nuestra Solución
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">
              Un enfoque basado en datos
            </h2>
            <div className="bg-white text-black rounded-2xl p-8 shadow-xl">
              <p className="text-3xl font-extrabold leading-tight uppercase tracking-tighter mb-4">
                Acciones <span className="text-black/30">→</span> Datos{" "}
                <span className="text-black/30">→</span> Métricas{" "}
                <span className="text-black/30">→</span>{" "}
                <mark className="bg-black text-white px-2">Identidad</mark>
              </p>
              <p className="text-lg text-black/80">
                Auditamos tu vida como si fuera un sistema, permitiéndote medir
                progreso real y detectar patrones de alto rendimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 2: CÓMO FUNCIONA --- */}
      <section id="como-funciona" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-widest text-black/60 mb-3 block">
              El Sistema
            </span>
            <h2 className="text-5xl font-black uppercase tracking-tighter">
              ¿Cómo funciona tu auditoría personal?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border-2 border-black p-8 relative overflow-hidden bg-black text-white group">
              <div className="absolute -bottom-10 -right-10 text-[160px] font-black text-white/10 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-2xl font-bold uppercase mb-4 relative z-10">
                Registra Actividades
              </h3>
              <p className="text-white/80 relative z-10 leading-relaxed">
                Estudio, programación, ejercicio, idiomas... Ingresa tus
                acciones diarias detallando tiempo, frecuencia y calidad.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-black p-8 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 text-[160px] font-black text-black/5 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-bold uppercase mb-4 relative z-10">
                Procesamiento de Datos
              </h3>
              <p className="text-black/70 relative z-10 leading-relaxed">
                Nuestro algoritmo propietario analiza las variables para
                calcular indicadores clave de rendimiento (KPIs) personales.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-black p-8 relative overflow-hidden bg-black text-white group">
              <div className="absolute -bottom-10 -right-10 text-[160px] font-black text-white/10 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-bold uppercase mb-4 relative z-10">
                Visualiza tu Stats Card
              </h3>
              <p className="text-white/80 relative z-10 leading-relaxed">
                Tu progreso se materializa en una interfaz tipo Player Card,
                actualizando tus niveles de Disciplina, Enfoque y Crecimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 3: LAS MÉTRICAS / PROHIBIDO VER SOFTWARE --- */}
      <section className="py-20 md:py-28 bg-white border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-5">
              Las Métricas que importan
            </h2>
            <p className="text-lg text-black/70">
              No medimos hábitos, medimos las capacidades que definen quién
              eres.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Disciplina"
              description="La capacidad de cumplir con lo prometido, independientemente de la motivación."
              icon="🧠"
            />
            <FeatureCard
              title="Consistencia"
              description="La frecuencia y regularidad de tus acciones clave a lo largo del tiempo."
              icon="🔄"
            />
            <FeatureCard
              title="Enfoque"
              description="La calidad y concentración dedicada a cada sesión de actividad (Deep Work)."
              icon="🎯"
            />
            <FeatureCard
              title="Dedicación"
              description="El volumen total de tiempo invertido en tu desarrollo personal."
              icon="⏳"
            />
            <FeatureCard
              title="Crecimiento"
              description="La tasa de mejora y superación de tus propios récords personales."
              icon="📈"
            />
            <div className="border border-dashed border-black/30 rounded-2xl p-6 bg-black text-white flex flex-col justify-center items-center text-center">
              <h3 className="text-xl font-bold uppercase mb-2">Tu Identidad</h3>
              <p className="text-sm text-white/70">
                Todo se une en tu Carta Personal de Jugador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-28 md:py-36 bg-black text-white border-t-2 border-white/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
            DEJA DE IMAGINAR. <br />
            EMPIEZA A <span className="border-b-4 border-white">MEDIR</span>.
          </h2>
          <p className="text-2xl text-white/80 mb-14 max-w-2xl mx-auto">
            Únete a la nueva ola de desarrolladores, estudiantes y optimizadores
            de vida que ya están gamificando su crecimiento.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-white px-12 py-5 text-lg font-bold uppercase tracking-widest text-black transition hover:bg-white/80 shadow-2xl"
          >
            Crear mi Player Card Gratis
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white border-t border-black/10 text-center">
        <div className="max-w-7xl mx-auto px-6 text-black/60 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-6 bg-black/40"></div>
            <span className="font-black uppercase tracking-tighter">
              PERFORMANCE<span className="font-light">TRACKER</span>
            </span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} - Convierte disciplina en números.
          </p>
          <p className="mt-1 text-xs text-black/40">
            Un proyecto impulsado por datos y autodesarrollo.
          </p>
        </div>
      </footer>
    </div>
  );
}
