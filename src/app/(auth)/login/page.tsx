import { Suspense } from "react";
import { LoginAuthAlert } from "@/components/auth/LoginAuthAlert";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginMotivationBanner } from "@/components/auth/LoginMotivationBanner";

export default function LoginPage() {
  return (
    <div className="space-y-5">
      <LoginMotivationBanner />
      <Suspense fallback={null}>
        <LoginAuthAlert />
      </Suspense>
      <h2 className="text-center text-lg font-bold">Log in</h2>
      <LoginForm />
    </div>
  );
}
