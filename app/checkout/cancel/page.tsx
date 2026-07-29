import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-paper-heading">
          Плащането е отменено
        </h1>
        <p className="mb-8 text-lg text-paper-text">
          Вашата поръчка не е завършена. Можете да опитате отново по-късно.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="btn-primary"
          >
            Към началната страница
          </Link>
          <Link
            href="/search"
            className="btn-outline"
          >
            Продължи пазаруване
          </Link>
        </div>
      </div>
    </div>
  );
}
