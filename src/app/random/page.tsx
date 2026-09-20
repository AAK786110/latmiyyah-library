import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RandomRedirect() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("latmiyyahs")
    .select("slug")
    .eq("status", "published");

  if (!data || data.length === 0) redirect("/search");

  const pick = data[Math.floor(Math.random() * data.length)];
  redirect(`/latmiyyah/${pick.slug}`);
}
