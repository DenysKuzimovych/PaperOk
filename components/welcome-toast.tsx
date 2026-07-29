"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { SITE_NAME } from "lib/constants";

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes("welcome-toast=2")) {
      const siteName = SITE_NAME;
      toast(`🛍️ Добре дошли в ${siteName}!`, {
        id: "welcome-toast",
        duration: 5000,
        onDismiss: () => {
          document.cookie = "welcome-toast=2; max-age=31536000; path=/";
        },
        description: "Започнете да пазарувате от нашия каталог с продукти.",
      });
    }
  }, []);

  return null;
}
