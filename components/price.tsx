import clsx from "clsx";

const Price = ({
  amount,
  className,
  currencyCode = "EUR",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"span">) => {
  const formatted = new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(parseFloat(amount));

  return (
    <span
      suppressHydrationWarning={true}
      className={clsx("inline-block whitespace-nowrap", className)}
    >
      <span>
        {formatted}
        <span className={clsx("ml-1 inline", currencyCodeClassName)}>
          {currencyCode}
        </span>
      </span>
    </span>
  );
};

export default Price;
