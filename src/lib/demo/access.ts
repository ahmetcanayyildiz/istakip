import "server-only";

import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/lib/auth/account";

export async function isCurrentAccountDemo() {
  const account = await getCurrentAccount();
  return account.status === "ready" && account.isDemo;
}

export async function redirectDemoMutationRoute(destination: string) {
  if (await isCurrentAccountDemo()) redirect(destination);
}
