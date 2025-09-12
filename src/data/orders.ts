import type { Order } from "../types";

export const ORDERS: Order[] = [
  {
    id: "IT-9A2F7C",
    date: "2025-08-24",
    status: "Delivered",
    total: 2499,
    items: [
      {
        id: "p1",
        name: "Oxford Shirt – Navy",
        price: 1499,
        quantity: 1,
        image: require("../../assets/img/products/product_2.jpeg"),
      },
      {
        id: "p2",
        name: "Polo Tee – White",
        price: 999,
        quantity: 1,
        image: require("../../assets/img/banners/banner_2.avif"),
      },
    ],
  },
  {
    id: "IT-5QW12B",
    date: "2025-08-22",
    status: "Shipped",
    total: 1799,
    items: [
      {
        id: "p3",
        name: "Casual Linen Shirt – Sand",
        price: 1799,
        quantity: 1,
        image: require("../../assets/img/products/product_1.jpeg"),
      },
    ],
  },
  {
    id: "IT-3KLM90",
    date: "2025-08-20",
    status: "Processing",
    total: 1299,
    items: [
      {
        id: "p4",
        name: "Essential Cotton Tee – Black",
        price: 1299,
        quantity: 1,
        image: require("../../assets/img/products/product_2.jpeg"),
      },
    ],
  },
];
