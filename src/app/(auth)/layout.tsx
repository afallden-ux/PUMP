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
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
        {children}
      </div>
    </div>
  );
}
