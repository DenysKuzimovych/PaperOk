"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateInquiryStatusAction,
} from "app/admin/inquiries/actions";
import type { ContactInquiryStatus } from "lib/supabase/admin-contact-inquiries";

const STATUS_OPTIONS: { value: ContactInquiryStatus; label: string }[] = [
  { value: "new", label: "Ново" },
  { value: "read", label: "Прочетено" },
  { value: "archived", label: "Архивирано" },
];

export function InquiryStatusForm({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: ContactInquiryStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    const result = await updateInquiryStatusAction(inquiryId, status);
    if (result.success) {
      toast.success("Статусът е обновен");
      router.refresh();
    } else {
      toast.error(result.error || "Грешка");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label
          htmlFor="inquiry-status"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Статус
        </label>
        <select
          id="inquiry-status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ContactInquiryStatus)
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={loading || status === currentStatus}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Запазване..." : "Запази статус"}
      </button>
    </div>
  );
}
