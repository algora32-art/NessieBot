"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ModeSwitch } from "@/components/ModeSwitch";
import { Button, Card, GhostButton, Textarea } from "@/components/ui";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

type InputMode = "type" | "dictate";

export function QuoteClient({ hasWebhook }: { hasWebhook: boolean }) {
  const [mode, setMode] = useState<InputMode>("type");
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const supportsSpeech = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!supportsSpeech) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "es-MX";
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event: any) => {
      let finalText = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      // Append final text; show interim at the end
      setText((prev) => {
        const base = prev.replace(/\s*\[dictando\].*$/i, "").trimEnd();
        const next = (base + " " + finalText).trimStart();
        return interim ? `${next} [dictando] ${interim}` : next;
      });
    };

    rec.onerror = () => {
      setRecording(false);
    };
    rec.onend = () => {
      setRecording(false);
      setText((prev) => prev.replace(/\s*\[dictando\].*$/i, "").trim());
    };

    recognitionRef.current = rec;
    // cleanup
    return () => {
      try {
        rec.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [supportsSpeech]);

  function startRecording() {
    setError(null);
    if (!supportsSpeech) {
      setError("Tu navegador no soporta dictado (Web Speech API). Usa modo escribir.");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    if (recording) return;

    setRecording(true);
    try {
      rec.start();
    } catch {}
  }

  function stopRecording() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (!recording) return;

    setRecording(false);
    try {
      rec.stop();
    } catch {}
  }

  async function generate() {
    setError(null);
    setPdfUrl(null);

    if (!hasWebhook) {
      setError("Tu cuenta aún no está habilitada para generar cotizaciones. Contacta al administrador.");
      return;
    }

    const cleanText = text.replace(/\s*\[dictando\].*$/i, "").trim();
    if (!cleanText) {
      setError("Describe tu cotización.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error || `Error ${res.status}`);
      }

      const j = await res.json().catch(() => null);
      const url: string | undefined = j?.pdf_url;
      if (!url) throw new Error("Make no devolvió pdf_url");
      setPdfUrl(url);
    } catch (e: any) {
      setError(e?.message ?? "Ocurrió un error al generar el PDF.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <div className="absolute right-0 -top-16">
        <ModeSwitch
          value={mode === "type" ? "type" : "dictate"}
          onChange={(v) => {
            setMode(v === "type" ? "type" : "dictate");
            setError(null);
            setPdfUrl(null);
            if (recording) stopRecording();
          }}
          leftLabel="Dictar"
          rightLabel="Escribir"
        />
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <Image src="/logo.png" alt="Nessie" width={28} height={28} className="rounded-lg" />
          <h1 className="text-xl font-semibold text-slate-900">
            Hola, ¿Qué necesitas cotizar?
          </h1>
        </div>

        <div className="mt-6">
          {mode === "type" ? (
            <Textarea
              placeholder="Describe tu cotización"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white/70 shadow-soft">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    startRecording();
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    stopRecording();
                  }}
                  onPointerCancel={(e) => {
                    e.preventDefault();
                    stopRecording();
                  }}
                  onPointerLeave={(e) => {
                    e.preventDefault();
                    stopRecording();
                  }}
                  onContextMenu={(e) => e.preventDefault()}

                  className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  aria-label={recording ? "Dictando..." : "Mantén presionado para hablar"}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M19 11a7 7 0 0 1-14 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 18v3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                {recording ? "Escuchando..." : "Toca el micrófono para dictar"}
              </p>

              <div className="mt-4 w-full">
                <Textarea
                  placeholder="Tu dictado aparecerá aquí"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {!supportsSpeech ? (
                <p className="mt-3 text-xs text-slate-500">
                  Nota: el dictado depende de tu navegador. Chrome suele funcionar mejor.
                </p>
              ) : null}
            </div>
          )}
        </div>

        {!hasWebhook ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No tienes webhook configurado. Ve a{" "}
            <Link href="/settings" className="underline">
              Ajustes
            </Link>{" "}
            para guardarlo.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={generate} disabled={sending}>
            {sending ? "Generando..." : "Generar PDF"}
          </Button>
          <GhostButton
            type="button"
            onClick={() => {
              setText("");
              setPdfUrl(null);
              setError(null);
              if (recording) stopRecording();
            }}
          >
            Limpiar
          </GhostButton>

          {pdfUrl ? (
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-sky-700 underline"
              >
                Abrir PDF
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pdfUrl);
                  } catch {
                    // ignore
                  }
                }}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Copiar link
              </button>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
