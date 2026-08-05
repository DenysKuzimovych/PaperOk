"use client";

import { useEffect, useMemo, useState } from "react";

export type ShippingMethod = "office" | "apt" | "address";

export type SpeedyShippingSelection = {
  method: ShippingMethod;
  siteId: number;
  siteName: string;
  officeId?: number;
  officeName?: string;
  addressLine?: string;
  shippingPrice: number;
  deliveryDeadline?: string;
  customerAddressSummary: string;
};

type SiteOption = {
  id: number;
  label: string;
  name: string;
};

type OfficeOption = {
  id: number;
  label: string;
  name: string;
  type: string;
};

type Props = {
  itemCount: number;
  onChange: (value: SpeedyShippingSelection | null) => void;
};

export function SpeedyShippingForm({ itemCount, onChange }: Props) {
  const [method, setMethod] = useState<ShippingMethod>("office");
  const [siteQuery, setSiteQuery] = useState("");
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [siteId, setSiteId] = useState<number | null>(null);
  const [siteName, setSiteName] = useState("");
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [officeId, setOfficeId] = useState<number | null>(null);
  const [officeName, setOfficeName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [shippingPrice, setShippingPrice] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>();
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingOffices, setLoadingOffices] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search sites (debounced)
  useEffect(() => {
    if (siteQuery.trim().length < 2) {
      setSites([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSites(true);
      try {
        const res = await fetch(
          `/api/speedy/sites?q=${encodeURIComponent(siteQuery.trim())}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Грешка");
        setSites(data.sites || []);
      } catch (err: any) {
        setError(err.message || "Грешка при търсене");
      } finally {
        setLoadingSites(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [siteQuery]);

  // Load offices when site + method needs office list
  useEffect(() => {
    if (!siteId || method === "address") {
      setOffices([]);
      setOfficeId(null);
      setOfficeName("");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingOffices(true);
      setError(null);
      try {
        const type = method === "apt" ? "APT" : "OFFICE";
        const res = await fetch(
          `/api/speedy/offices?siteId=${siteId}&type=${type}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Грешка");
        if (!cancelled) {
          setOffices(data.offices || []);
          setOfficeId(null);
          setOfficeName("");
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Грешка при офиси");
      } finally {
        if (!cancelled) setLoadingOffices(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteId, method]);

  // Calculate price
  useEffect(() => {
    const needsOffice = method === "office" || method === "apt";
    if (!siteId) {
      setShippingPrice(null);
      onChange(null);
      return;
    }
    if (needsOffice && !officeId) {
      setShippingPrice(null);
      onChange(null);
      return;
    }
    if (method === "address" && addressLine.trim().length < 5) {
      setShippingPrice(null);
      onChange(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingPrice(true);
      setError(null);
      try {
        const res = await fetch("/api/speedy/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId,
            officeId: needsOffice ? officeId : undefined,
            itemCount,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Грешка");
        if (cancelled) return;

        const price = Number(data.price) || 0;
        setShippingPrice(price);
        setDeadline(data.deliveryDeadline);

        const summaryParts = [
          method === "office"
            ? "Speedy офис"
            : method === "apt"
              ? "Speedy автомат"
              : "Speedy до адрес",
          siteName,
        ];
        if (officeName) summaryParts.push(officeName);
        if (method === "address" && addressLine.trim()) {
          summaryParts.push(addressLine.trim());
        }

        onChange({
          method,
          siteId,
          siteName,
          officeId: officeId || undefined,
          officeName: officeName || undefined,
          addressLine: method === "address" ? addressLine.trim() : undefined,
          shippingPrice: price,
          deliveryDeadline: data.deliveryDeadline,
          customerAddressSummary: summaryParts.filter(Boolean).join(" · "),
        });
      } catch (err: any) {
        if (!cancelled) {
          setShippingPrice(null);
          setError(err.message || "Грешка при цена");
          onChange(null);
        }
      } finally {
        if (!cancelled) setLoadingPrice(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, siteName, officeId, officeName, method, addressLine, itemCount]);

  const methodButtons = useMemo(
    () =>
      [
        { id: "office" as const, label: "До офис" },
        { id: "apt" as const, label: "До автомат" },
        { id: "address" as const, label: "До адрес" },
      ] as const,
    [],
  );

  return (
    <div className="space-y-4 rounded-lg border border-paper-border bg-paper-white p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium text-paper-heading">
          Доставка със Speedy *
        </h3>
        <div className="flex flex-wrap gap-2">
          {methodButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                setMethod(btn.id);
                setShippingPrice(null);
                onChange(null);
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                method === btn.id
                  ? "border-paper-green bg-paper-green text-white"
                  : "border-paper-border text-paper-heading hover:border-paper-green"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-paper-heading">
          Населено място *
        </label>
        <input
          type="text"
          value={siteQuery}
          onChange={(e) => {
            setSiteQuery(e.target.value);
            setSiteId(null);
            setSiteName("");
            setShippingPrice(null);
            onChange(null);
          }}
          placeholder="Започнете да пишете — напр. София"
          className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
        />
        {loadingSites ? (
          <p className="mt-1 text-xs text-paper-muted">Търсене...</p>
        ) : null}
        {sites.length > 0 && !siteId ? (
          <ul className="paper-dropdown-list mt-2 max-h-48 overflow-auto">
            {sites.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="paper-dropdown-item"
                  onClick={() => {
                    setSiteId(s.id);
                    setSiteName(s.label || s.name);
                    setSiteQuery(s.label || s.name);
                    setSites([]);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {(method === "office" || method === "apt") && siteId ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-paper-heading">
            {method === "apt" ? "Автомат *" : "Офис *"}
          </label>
          {loadingOffices ? (
            <p className="text-sm text-paper-muted">Зареждане...</p>
          ) : (
            <select
              value={officeId || ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const office = offices.find((o) => o.id === id);
                setOfficeId(id || null);
                setOfficeName(office?.label || office?.name || "");
              }}
              className="paper-select"
              required
            >
              <option value="">
                — Изберете {method === "apt" ? "автомат" : "офис"} —
              </option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {!loadingOffices && offices.length === 0 ? (
            <p className="mt-1 text-xs text-amber-700">
              Няма налични{" "}
              {method === "apt" ? "автомати" : "офиси"} за това място.
            </p>
          ) : null}
        </div>
      ) : null}

      {method === "address" && siteId ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-paper-heading">
            Адрес за доставка *
          </label>
          <textarea
            rows={3}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="ул. Примерна 1, вх. А, ет. 2, ап. 5"
            className="w-full rounded-lg border border-paper-border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-paper-green"
            required
          />
        </div>
      ) : null}

      <div className="rounded-lg bg-paper-section px-4 py-3 text-sm">
        {loadingPrice ? (
          <p className="text-paper-muted">Изчисляване на доставка...</p>
        ) : shippingPrice != null ? (
          <div className="space-y-1">
            <p className="font-medium text-paper-heading">
              Доставка: €{shippingPrice.toFixed(2)}
            </p>
            {deadline ? (
              <p className="text-xs text-paper-muted">
                Ориентировъчен срок:{" "}
                {new Date(deadline).toLocaleString("bg-BG")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-paper-muted">
            Изберете населено място и начин на доставка за цена.
          </p>
        )}
        {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

