export function formatDate(date: string | number | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function formatDateDDMMYYYY(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}