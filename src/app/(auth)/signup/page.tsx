import { SignupForm } from "@/components/auth/SignupForm";
import { APP_NAME } from "@/lib/brand";

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-4 text-center text-lg font-bold">Join {APP_NAME}</h2>
      <SignupForm />
    </>
  );
}
