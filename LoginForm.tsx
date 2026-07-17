"use client";

import { useRouter } from "next/navigation";

export function LogoutClienteButton() {
  const router = useRouter();

  async function sair() {
    await fetch("/api/cliente/logout", { method: "POST" });
    router.push("/cliente/login");
    router.refresh();
  }

  return (
    <button onClick={sair} className="text-sm text-graphitesoft hover:text-graphite">
      Sair
    </button>
  );
}
