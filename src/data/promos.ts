import { Promo } from "../utils/types";

export const PROMOS: Promo[] = [
  {
    code: "IMPERIAL10",
    label: "10% off",
    compute: (subtotal) => Math.round(subtotal * 0.1),
  },
  {
    code: "FREESHIP",
    label: "Free Shipping",
    compute: () => 0, // discount applies by waiving shipping below
  },
  // Tiered example:
  {
    code: "SAVE1500",
    label: "₹200 off orders ₹1500+",
    compute: (subtotal) => (subtotal >= 1500 ? 200 : 0),
  },
];
