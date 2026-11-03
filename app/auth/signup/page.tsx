import { redirect } from "next/navigation";
import { getSession } from "@/lib/services/auth";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  redirect("/auth");
}
