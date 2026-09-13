const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";

/** Convert Persian / Arabic-Indic digits to ASCII 0-9. */
export function toAsciiDigits(raw: string): string {
  return (raw || "").replace(/[۰-۹٠-٩]/g, (ch) => {
    const persian = PERSIAN.indexOf(ch);
    if (persian >= 0) return String(persian);
    const arabic = ARABIC_INDIC.indexOf(ch);
    return arabic >= 0 ? String(arabic) : ch;
  });
}
