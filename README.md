# Nessie Quote App (Next.js + Supabase + Make)

App web elegante y minimalista para que el usuario escriba o dicte una descripción de cotización, la envíe a un webhook de **Make**, y reciba un **PDF** para descargar.

## Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Supabase Auth (login / registro)
- Tabla `profiles` para guardar el `webhook_url` por usuario
- Web Speech API (dictado) en navegador compatible

---

## 1) Crear proyecto en Supabase
1. Crea un proyecto en Supabase.
2. Ve a **SQL Editor** y ejecuta el archivo: `supabase/schema.sql`
3. En **Authentication > Providers**, deja habilitado Email (por defecto).

## 2) Variables de entorno
Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Opcional) `NEXT_PUBLIC_SITE_URL` (ej. https://tuapp.vercel.app)

## 3) Instalar y correr
```bash
npm install
npm run dev
```
Abre http://localhost:3000

## 4) Configurar Make (Webhook)
Cada usuario configura su webhook en **/settings**.

### Formato recomendado de request hacia Make
La app envía:
```json
{ "text": "..." }
```

### Respuestas soportadas desde Make
La app soporta 3 maneras:

**A) Responder directo PDF**
- Content-Type: `application/pdf`
- Body: binario del PDF

**B) Responder JSON con URL**
```json
{ "pdf_url": "https://..." }
```

**C) Responder JSON con base64**
```json
{ "pdfBase64": "JVBERi0xLjcKJc..." }
```

## 5) Deploy en Vercel
1. Sube el repo a GitHub.
2. Importa en Vercel.
3. Configura env vars igual que `.env.local`.
4. Deploy ✅

---

## Nota sobre dictado
El dictado usa Web Speech API. Funciona mejor en Chrome/Edge.
Si el navegador no lo soporta, usa el modo **Escribir**.



## Webhook por usuario (admin-managed)

La app **lee** el webhook desde Supabase en la tabla `profiles.webhook_url`.  
**Los usuarios NO pueden editarlo desde la UI.**

Para habilitar a un usuario:
1. En Supabase → Table Editor → `profiles`
2. Busca el `id` del usuario
3. Coloca su `webhook_url` (URL del Custom Webhook de Make)
