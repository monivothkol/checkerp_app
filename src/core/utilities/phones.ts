/**
 * v1 stores customer phone numbers as a JSON array serialized into a text
 * column — '["011 856 230","092 857 787"]' (2,242 rows), with a few legacy
 * plain strings. These helpers translate between that storage format, the
 * multi-input editor, and human-readable display.
 */

/** Raw stored value (JSON array / comma list / plain) → list of numbers. */
export function parsePhones(raw: unknown): string[] {
    const s = (typeof raw === "string" ? raw : "").trim();
    if (!s) return [];
    if (s.startsWith("[")) {
        try {
            const arr = JSON.parse(s);
            if (Array.isArray(arr)) return arr.map((x) => String(x).trim()).filter(Boolean);
        } catch { /* fall through to plain handling */ }
    }
    return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/** List of numbers → the v1 storage format (JSON array string, "" when none). */
export function mergePhones(list: string[]): string {
    const clean = list.map((x) => x.trim()).filter(Boolean);
    return clean.length ? JSON.stringify(clean) : "";
}

/** Raw stored value → "011 856 230, 092 857 787" for read-only display. */
export function displayPhones(raw: unknown): string {
    return parsePhones(raw).join(", ");
}
