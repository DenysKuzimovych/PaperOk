export function FieldHint({
  children,
  example,
}: {
  children: React.ReactNode;
  example?: string;
}) {
  return (
    <div className="mt-1.5 space-y-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
      <p>{children}</p>
      {example ? (
        <p className="rounded-md bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-gray-600 dark:text-gray-300">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Пример:{" "}
          </span>
          {example}
        </p>
      ) : null}
    </div>
  );
}
