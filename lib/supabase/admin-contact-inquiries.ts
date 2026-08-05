import { createServiceClient } from "./service";

function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    error.$$typeof === Symbol.for("react.postpone")
  );
}

export type ContactInquiryStatus = "new" | "read" | "archived";

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactInquiryStatus;
  created_at: string;
  updated_at: string;
};

export type CreateContactInquiryData = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export async function createContactInquiry(
  data: CreateContactInquiryData,
): Promise<ContactInquiry> {
  try {
    const supabase = createServiceClient();

    const { data: inquiry, error } = await supabase
      .from("contact_inquiries")
      .insert({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        status: "new",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact inquiry:", error);
      throw new Error("Неуспешно запазване на запитването");
    }

    return inquiry as ContactInquiry;
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in createContactInquiry:", error);
    throw error;
  }
}

export async function getAllContactInquiries(): Promise<ContactInquiry[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contact inquiries:", error);
      throw new Error("Неуспешно зареждане на запитванията");
    }

    return (data || []) as ContactInquiry[];
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in getAllContactInquiries:", error);
    throw error;
  }
}

export async function getContactInquiryById(
  id: string,
): Promise<ContactInquiry | null> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return null;
      }
      console.error("Error fetching contact inquiry:", error);
      throw new Error("Неуспешно зареждане на запитването");
    }

    return data as ContactInquiry;
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in getContactInquiryById:", error);
    throw error;
  }
}

export async function updateContactInquiryStatus(
  id: string,
  status: ContactInquiryStatus,
): Promise<ContactInquiry> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("contact_inquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact inquiry status:", error);
      throw new Error("Неуспешна промяна на статуса");
    }

    return data as ContactInquiry;
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in updateContactInquiryStatus:", error);
    throw error;
  }
}

export async function deleteContactInquiry(id: string): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("contact_inquiries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact inquiry:", error);
      throw new Error("Неуспешно изтриване на запитването");
    }
  } catch (error) {
    if (isReactPostpone(error)) throw error;
    console.error("Error in deleteContactInquiry:", error);
    throw error;
  }
}
