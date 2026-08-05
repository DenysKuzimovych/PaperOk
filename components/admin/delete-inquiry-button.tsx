"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteInquiryAction } from "app/admin/inquiries/actions";

export function DeleteInquiryButton({
  inquiryId,
  inquiryName,
}: {
  inquiryId: string;
  inquiryName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `Сигурни ли сте, че искате да изтриете запитването от "${inquiryName}"?`,
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await deleteInquiryAction(inquiryId);
    if (result.success) {
      toast.success("Запитването е изтрито");
      router.push("/admin/inquiries");
      router.refresh();
    } else {
      toast.error(result.error || "Грешка");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Изтриване..." : "Изтрий"}
    </button>
  );
}
