"use client";

import { useEffect } from "react";
import { reportViewItem } from "lib/ga-ecommerce";

/** Fires a GA4 view_item event once when a product page mounts. */
export function TrackViewItem({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price?: number;
}) {
  useEffect(() => {
    reportViewItem({ item_id: id, item_name: name, price });
  }, [id, name, price]);

  return null;
}
