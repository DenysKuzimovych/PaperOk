"use client";

import { useState } from "react";
import { deleteBlogPostAction } from "app/admin/blog/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteBlogButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${postTitle}"?`)) {
      return;
    }
    setLoading(true);
    const result = await deleteBlogPostAction(postId);
    if (result.success) {
      toast.success("Статията е изтрита");
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
      className="text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "..." : "Изтрий"}
    </button>
  );
}
