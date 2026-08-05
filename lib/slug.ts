/** Bulgarian → Latin slug helpers for admin handles */

const BG_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sht",
  ъ: "a",
  ь: "",
  ю: "yu",
  я: "ya",
};

export function transliterateBg(input: string): string {
  return input
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      const mapped = BG_MAP[lower];
      if (mapped === undefined) return ch;
      return ch === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join("");
}

/** Lowercase Latin slug: letters, digits, hyphens only. */
export function formatHandle(value: string): string {
  return transliterateBg(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateHandleFromTitle(title: string): string {
  return formatHandle(title);
}
