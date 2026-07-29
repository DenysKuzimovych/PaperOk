import { isAdminAuthenticated } from "lib/admin-auth";

export async function isAdmin(): Promise<boolean> {
  return isAdminAuthenticated();
}

export async function getCurrentUser() {
  const admin = await isAdminAuthenticated();
  return admin ? { role: "admin" } : null;
}
