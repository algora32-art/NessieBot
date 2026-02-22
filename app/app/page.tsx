import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { QuoteClient } from "./quote-client";

export default async function AppPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("webhook_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="pb-16">
      <Header />
      <div className="mx-auto mt-10 w-full max-w-3xl px-4">
        <QuoteClient hasWebhook={Boolean(profile?.webhook_url)} />
      </div>
    </main>
  );
}
