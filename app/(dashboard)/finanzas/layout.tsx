import FinanceModuleNav from "./_components/FinanceModuleNav";

export default function FinanzasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <FinanceModuleNav />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-12 md:py-14">
        {children}
      </div>
    </div>
  );
}
