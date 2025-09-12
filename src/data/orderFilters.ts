import type { OrderStatus } from "../types";

export const FILTERS: ("All" | OrderStatus)[] = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
