"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={sair} className="text-sm text-paper/50 hover:text-paper">
      Sair
    </button>
  );
}
