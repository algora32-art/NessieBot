"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, Card, Input, Label, GhostButton } from "@/components/ui";

export function SettingsClient({ initialWebhookUrl }: { initialWebhookUrl: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) throw new Error("Sesión no válida. Inicia sesión de nuevo.");

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, webhook_url: webhookUrl || null });

      if (error) throw error;
      setMsg("Webhook guardado.");
    } catch (e: any) {
      setMsg(e?.message ?? "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Webhook de Make</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cada usuario tiene su propio webhook. Aquí defines a qué escenario se enviará el texto de la cotización.
          </p>
        </div>
        <GhostButton type="button" onClick={() => (window.location.href = "/app")}>
          Volver
        </GhostButton>
      </div>

      <div className="mt-6 space-y-2">
        <Label>URL del Webhook</Label>
        <Input
          placeholder="https://hook.us1.make.com/xxxxx"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Recomendación: en Make, responde con PDF (binario) o con JSON que incluya <code>pdf_url</code> o{" "}
          <code>pdfBase64</code>.
        </p>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {msg}
        </div>
      ) : null}

      <div className="mt-6">
        <Button disabled={loading} onClick={save} type="button">
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </Card>
  );
}
