import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const text = body?.text?.toString?.().trim?.();
  if (!text) {
    return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("webhook_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) {
    return NextResponse.json({ error: "No se pudo leer el perfil" }, { status: 500 });
  }
  const webhookUrl = profile?.webhook_url as string | null;

  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Make respondió ${upstream.status}: ${txt.slice(0, 180)}` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "";

    // We now expect Make to return JSON with a link.
    if (contentType.includes("application/json")) {
      const j = await upstream.json().catch(() => null);
      const pdfUrl: string | undefined = j?.pdf_url ?? j?.pdfUrl ?? j?.url;
      if (!pdfUrl) {
        return NextResponse.json(
          { error: "Respuesta JSON inválida: faltó pdf_url" },
          { status: 502 }
        );
      }
      return NextResponse.json({ pdf_url: pdfUrl }, { status: 200 });
    }

    // If Make returned a PDF or anything else, guide the user to configure Make to return a link.
    return NextResponse.json(
      { error: "Make debe devolver application/json con pdf_url (link público)." },
      { status: 502 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error llamando al webhook" }, { status: 500 });
  }
}
