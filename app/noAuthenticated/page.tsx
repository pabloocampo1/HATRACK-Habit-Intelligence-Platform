import Link from "next/link";

export default function NoAuthenticated() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <p className="text-black/70 mb-4">No hay usuario autenticado.</p>
      <Link href="/login" className="font-bold text-black hover:text-black/70">
        ← Volver a login
      </Link>
    </div>
  );
}
