export default function FinanceModulePlaceholder({
  title,
  description,
  examples,
}: {
  title: string;
  description: string;
  examples?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
        {examples ? (
          <p className="mt-2 text-sm text-gray-400">{examples}</p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
        Módulo en construcción.
      </div>
    </div>
  );
}
