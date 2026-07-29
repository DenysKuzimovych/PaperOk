"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { Product, ProductSizeVariant } from "lib/types";
import { useActionState } from "react";
import { useCart } from "./cart-context";
import Price from "components/price";

type ButtonState = "idle" | "adding" | "added";

function SubmitButton({
  available,
  state,
}: {
  available: boolean;
  state: ButtonState;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-xl bg-paper-green p-4 tracking-wide text-white transition-all duration-300";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!available) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Изчерпан
      </button>
    );
  }

  const isBusy = state !== "idle";

  return (
    <button
      type="submit"
      disabled={isBusy}
      aria-label="Добави в количка"
      aria-busy={state === "adding"}
      className={clsx(
        buttonClasses,
        isBusy && "cursor-not-allowed",
        state === "adding" && "scale-[0.98] opacity-90",
        state === "added" && "bg-paper-green-hover scale-[1.02]",
        state === "idle" && "hover:bg-paper-green-hover hover:opacity-90 active:scale-[0.98]",
      )}
    >
      <div className="absolute left-0 ml-4">
        {state === "added" ? (
          <CheckIcon className="h-5 animate-cart-check" />
        ) : state === "adding" ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <PlusIcon className="h-5" />
        )}
      </div>
      {state === "adding"
        ? "Добавяне..."
        : state === "added"
          ? "Добавено!"
          : "Добави в Количка"}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { available, variants } = product;
  const enabledVariants = (variants || []).filter((v) => v.enabled);
  const hasVariants = enabledVariants.length > 0;

  const [selectedVariant, setSelectedVariant] = useState<ProductSizeVariant | null>(
    hasVariants ? enabledVariants[0]! : null,
  );
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : product.price;

  const { addCartItem } = useCart();
  const [message, formAction] = useActionState(addItem, null);

  const variantData = {
    id: selectedVariant?.id || product.id,
    title: selectedVariant?.name || product.title,
    price: displayPrice,
    available: product.available,
    selectedOptions: selectedVariant
      ? [{ name: "Размер", value: selectedVariant.name }]
      : [],
  };

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <label className="mb-2 block text-sm font-medium">Размер</label>
          <div className="flex flex-wrap gap-2">
            {enabledVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={buttonState !== "idle"}
                onClick={() => setSelectedVariant(variant)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selectedVariant?.id === variant.id
                    ? "border-paper-green bg-paper-green text-white"
                    : "border-paper-border hover:border-paper-green",
                  buttonState !== "idle" && "pointer-events-none opacity-60",
                )}
              >
                {variant.name}
              </button>
            ))}
          </div>
          {selectedVariant?.description && (
            <p className="mt-2 text-sm text-paper-muted">
              {selectedVariant.description}
            </p>
          )}
        </div>
      )}

      <div className="text-lg font-medium">
        <Price amount={displayPrice.toString()} currencyCode="EUR" />
      </div>

      <form
        action={async () => {
          if (buttonState !== "idle") return;
          setButtonState("adding");
          addCartItem(variantData, product);
          await formAction({
            productId: product.id,
            variantId: variantData.id,
            price: displayPrice,
          });
          setButtonState("added");
          window.setTimeout(() => setButtonState("idle"), 1400);
        }}
      >
        <SubmitButton available={available} state={buttonState} />
        <p aria-live="polite" className="sr-only" role="status">
          {buttonState === "added" ? "Продуктът е добавен в количката" : message}
        </p>
      </form>
    </div>
  );
}
