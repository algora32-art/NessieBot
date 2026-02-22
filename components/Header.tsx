import Image from "next/image";
import Link from "next/link";
import { GhostButton } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-8">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Nessie" width={34} height={34} className="rounded-lg" />
        <div>
          <div className="text-sm font-semibold text-slate-900">Nessie</div>
          <div className="text-xs text-slate-500">Automatizations and Bots</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
<form action="/auth/signout" method="post">
          <GhostButton type="submit">Salir</GhostButton>
        </form>
      </div>
    </header>
  );
}
