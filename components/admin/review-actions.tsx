"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteReviewAction,
  setReviewStatusAction,
} from "app/admin/reviews/actions";
import type { ReviewStatus } from "lib/supabase/reviews";

export function ReviewActions({
  id,
  status,
}: {
  id: string;
  status: ReviewStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const run = (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    startTransition(async () => {
      const res = await fn();
      setBusy(false);
      if (res.success) {
        toast.success(ok);
        router.refresh();
      } else {
        toast.error(res.error || "Грешка");
      }
    });
  };

  const disabled = busy || isPending;

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => run(() => setReviewStatusAction(id, "approved"), "Отзивът е одобрен")}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          Одобри
        </button>
      )}
      {status !== "rejected" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => run(() => setReviewStatusAction(id, "rejected"), "Отзивът е скрит")}
          className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Отхвърли
        </button>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (confirm("Изтриване на този отзив? Действието е необратимо.")) {
            run(() => deleteReviewAction(id), "Отзивът е изтрит");
          }
        }}
        className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-200 disabled:opacity-50"
      >
        Изтрий
      </button>
    </div>
  );
}
