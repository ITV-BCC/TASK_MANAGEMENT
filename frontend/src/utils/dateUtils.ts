/**
 * Formats a date string or Date object into DD/MM/YYYY format
 * Example: "2026-08-18" -> "18/08/2026"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date string or Date object into DD/MM/YYYY, HH:MM format
 * Example: "2026-08-18T14:30:00" -> "18/08/2026, 14:30"
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};
