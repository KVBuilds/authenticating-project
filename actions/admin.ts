"use server";

import { currentRole } from "@/lib/auth";

export const admin = async () => {
  const role = await currentRole();

  if (role !== "ADMIN") {
    return { error: "Forbidden" }
  }

  return { success: "Success!" }
}