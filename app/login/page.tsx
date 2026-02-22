"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, Card, Input, Label, GhostButton } from "@/components/ui";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit() {
    setMsg(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/app";
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Create empty profile row (webhook_url can be added in /settings)
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, webhook_url: null });
        }

        setMsg("Cuenta creada. Ya puedes iniciar sesión.");
        setMode("signin");
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Nessie" width={44} height={44} className="rounded-xl" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Nessie</h1>
            <p className="text-sm text-slate-500">Cotizaciones en PDF con IA</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <GhostButton
            className={mode === "signin" ? "bg-slate-100" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Iniciar sesión
          </GhostButton>
          <GhostButton
            className={mode === "signup" ? "bg-slate-100" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Crear cuenta
          </GhostButton>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Correo</Label>
            <Input
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {msg ? (
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              {msg}
            </div>
          ) : null}

          <Button
            disabled={loading || !email || !password}
            onClick={handleSubmit}
            type="button"
            className="w-full"
          >
            {loading ? "Procesando..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
          </Button>

          <p className="text-xs text-slate-500">
            Tip: después configura tu <b>Webhook</b> para que tu usuario apunte a tu escenario en Make.
          </p>
        </div>
      </Card>
    </main>
  );
}
