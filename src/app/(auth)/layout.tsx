import { BrandLogo } from "@/components/brand/BrandLogo";
import { APP_TAGLINE } from "@/lib/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo href="/login" size="lg" priority className="mx-auto" />
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-orange-500/20 bg-card/80 p-6 shadow-xl shadow-orange-950/20 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
