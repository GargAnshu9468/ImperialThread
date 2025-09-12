import type { OrderStatus } from "../utils/types";

export const FILTERS: ("All" | OrderStatus)[] = [
  "All",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
