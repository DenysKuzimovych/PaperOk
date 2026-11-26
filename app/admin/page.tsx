import { Suspense } from "react";
import { getAllOrders, isPaidRevenueOrder } from "lib/supabase/orders";
import { getAllContactInquiries } from "lib/supabase/admin-contact-inquiries";
import {
  orderInPeriod,
  resolveRevenuePeriod,
} from "lib/admin-dashboard-stats";
import { DashboardPeriodFilter } from "components/admin/dashboard-period-filter";
import { DeleteTestOrdersPanel } from "components/admin/delete-test-orders-panel";
import { SyncSpeedyButton } from "components/admin/sync-speedy-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRevenuePeriod(params);

  const [orders, inquiries] = await Promise.all([
    getAllOrders(),
    getAllContactInquiries().catch(() => []),
  ]);

  const paidInPeriod = orders.filter(
    (o) => orderInPeriod(o.created_at, range) && isPaidRevenueOrder(o),
  );

  const revenue = paidInPeriod.reduce(
    (sum, o) => sum + Number(o.total_price),
    0,
  );
  const paidCount = paidInPeriod.length;
  const averageOrderValue = paidCount > 0 ? revenue / paidCount : 0;

  const stats = {
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.status === "new").length,
    processingOrders: orders.filter((o) => o.status === "processing").length,
    newInquiries: inquiries.filter((i) => i.status === "new").length,
    revenue,
    paidCount,
    averageOrderValue,
  };

  // --- Monthly revenue, last 6 months (paid orders only) ---
  const MONTH_LABELS = [
    "яну", "фев", "мар", "апр", "май", "юни",
    "юли", "авг", "сеп", "окт", "ное", "дек",
  ];
  const now = new Date();
  const monthly: { key: string; label: string; revenue: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthly.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
      revenue: 0,
      count: 0,
    });
  }
  for (const o of orders) {
    if (!isPaidRevenueOrder(o)) continue;
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthly.find((m) => m.key === key);
    if (bucket) {
      bucket.revenue += Number(o.total_price);
      bucket.count += 1;
    }
  }
  const maxMonthlyRevenue = Math.max(...monthly.map((m) => m.revenue), 1);
  const prevMonth = monthly[monthly.length - 2];
  const currMonth = monthly[monthly.length - 1];
  const monthGrowth =
    prevMonth && prevMonth.revenue > 0
      ? ((currMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
      : null;

  // --- Top products for the selected period (paid orders) ---
  const productTotals = new Map<
    string,
    { name: string; variant: string | null; quantity: number; revenue: number }
  >();
  for (const o of paidInPeriod) {
    const items = Array.isArray(o.products) ? o.products : [];
    for (const p of items as any[]) {
      const key = `${p.name}|${p.variant_name || ""}`;
      const entry =
        productTotals.get(key) || {
          name: String(p.name || "—"),
          variant: p.variant_name ? String(p.variant_name) : null,
          quantity: 0,
          revenue: 0,
        };
      entry.quantity += Number(p.quantity) || 0;
      entry.revenue += (Number(p.price) || 0) * (Number(p.quantity) || 0);
      productTotals.set(key, entry);
    }
  }
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Административен панел
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Преглед на поръчките, запитванията и приходите
          </p>
        </div>
        <SyncSpeedyButton prominent />
      </div>

      {/* Main KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Общо поръчки
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalOrders}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <Link href="/admin/orders?status=new" className="block">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Нови поръчки
            </h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {stats.newOrders}
            </p>
          </Link>
        </div>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <Link href="/admin/orders?status=processing" className="block">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              За изпращане
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.processingOrders}
            </p>
          </Link>
        </div>
        <Link
          href="/admin/inquiries"
          className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Нови запитвания
          </h3>
          <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.newInquiries}
          </p>
        </Link>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Приходи
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            €{stats.revenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {range.label} · само платени
          </p>
        </div>
      </div>

      {/* Period + paid extras */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Приходи за периода
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Карта с статус „платено“ и наложен платеж при доставена поръчка
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-9 w-64 animate-pulse rounded-md bg-gray-100 dark:bg-gray-700" />
            }
          >
            <DashboardPeriodFilter />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Приходи</p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              €{stats.revenue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Платени поръчки
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {stats.paidCount}
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Средна стойност на поръчка
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              €{stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics: monthly revenue + top products */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Приходи по месеци
            </h2>
            {monthGrowth != null && (
              <span
                className={`text-sm font-semibold ${monthGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {monthGrowth >= 0 ? "▲" : "▼"} {Math.abs(monthGrowth).toFixed(0)}%
                <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                  спрямо предходния месец
                </span>
              </span>
            )}
          </div>
          <div className="flex h-44 items-end gap-3">
            {monthly.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  €{Math.round(m.revenue)}
                </span>
                <div
                  className="w-full rounded-t-md bg-green-500/80 dark:bg-green-500/60"
                  style={{
                    height: `${Math.max((m.revenue / maxMonthlyRevenue) * 100, 2)}%`,
                  }}
                  title={`${m.label}: €${m.revenue.toFixed(2)} (${m.count} поръчки)`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Само платени поръчки (карта „платено“ / наложен платеж при доставена)
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Топ продукти · {range.label}
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Няма платени поръчки за периода
            </p>
          ) : (
            <ol className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={`${p.name}-${p.variant}`} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {p.name}
                      {p.variant ? (
                        <span className="ml-2 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {p.variant}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.quantity} бр.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    €{p.revenue.toFixed(2)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <DeleteTestOrdersPanel
        orders={orders.map((o) => ({
          id: o.id,
          customer_name: o.customer_name,
          customer_email: o.customer_email,
          comment: o.comment ?? null,
          total_price: Number(o.total_price),
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          created_at: o.created_at,
        }))}
      />

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Управление на поръчки:{" "}
        <Link
          href="/admin/orders"
          className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          Поръчки →
        </Link>
      </p>
    </div>
  );
}
