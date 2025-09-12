import type { PriceKey } from "../utils/types";

export const PRICE_BUCKETS: { key: PriceKey; label: string; isIn: (price: number) => boolean }[] = [
    { key: "p0", label: "Under ₹499", isIn: (p) => p < 499 },
    { key: "p1", label: "₹500 – ₹999", isIn: (p) => p >= 500 && p <= 999 },
    { key: "p2", label: "₹1000 – ₹1499", isIn: (p) => p >= 1000 && p <= 1499 },
    { key: "p3", label: "₹1500+", isIn: (p) => p >= 1500 },
];
