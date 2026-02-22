import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  // Settings are managed by the admin in Supabase (profiles.webhook_url).
  // Users should not be able to change the webhook URL.
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  redirect("/app");
}
