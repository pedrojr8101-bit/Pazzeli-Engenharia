import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginAdminPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-night px-6">
      <div className="w-full max-w-sm space-y-5">
        <h1 className="font-display text-2xl font-semibold text-paper">Área admin</h1>
        <Suspense fallback={<p className="text-sm text-paper/40">Carregando...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
