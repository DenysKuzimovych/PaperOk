import type { Metadata } from "next";
import { ImpositionStudio } from "components/admin/imposition/imposition-studio";

export const metadata: Metadata = {
  title: "Раскладка за печат | PaperOK Админ",
};

export default function ImpositionPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Раскладка за печат
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Качете дизайни или снимки, изберете размер с вылети — и получете
          готов PDF за печат с метки за рязане.
        </p>
      </div>
      <ImpositionStudio />
    </div>
  );
}
