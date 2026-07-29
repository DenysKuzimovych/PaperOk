import clsx from "clsx";
import { Suspense } from "react";

import { getStorefrontCollections } from "lib/supabase/products";
import FilterList from "./filter";

async function CollectionList() {
  const collections = await getStorefrontCollections();
  // Transform Collection[] to PathFilterItem[] format
  const list = collections.map((collection) => ({
    title: collection.title,
    path: `/search/${collection.handle}`,
  }));
  return <FilterList list={list} title="Колекции" />;
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded-sm";
const activeAndTitles = "bg-paper-heading";
const items = "bg-paper-muted";

export default function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, activeAndTitles)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
          <div className={clsx(skeleton, items)} />
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
