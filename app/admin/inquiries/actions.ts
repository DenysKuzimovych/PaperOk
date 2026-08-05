"use server";

import {
  deleteContactInquiry,
  updateContactInquiryStatus,
  type ContactInquiryStatus,
} from "lib/supabase/admin-contact-inquiries";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatusAction(
  id: string,
  status: ContactInquiryStatus,
) {
  try {
    await updateContactInquiryStatus(id, status);
    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Грешка при промяна на статуса",
    };
  }
}

export async function deleteInquiryAction(id: string) {
  try {
    await deleteContactInquiry(id);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Грешка при изтриване",
    };
  }
}
