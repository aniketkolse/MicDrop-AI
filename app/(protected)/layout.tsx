import { redirect } from "next/navigation";
import { getSession } from "@/lib/services/auth";

export default async function RootLayoutProtected() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  // This is a placeholder; actual protected layout should render children.
  return null;
}
