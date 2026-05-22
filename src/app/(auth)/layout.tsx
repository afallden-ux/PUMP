export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            PUMP
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bouldering accountability with unreasonable forearm energy
        </p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-orange-500/20 bg-card/80 p-6 shadow-xl shadow-orange-950/20 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
