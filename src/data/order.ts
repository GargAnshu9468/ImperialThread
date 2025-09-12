import type { Order } from "../types";

export const ORDER: Order[] = [
  {
    id: "IT-9A2F7C",
    date: "2025-08-24",
    status: "Delivered",
    trackingId: "IMP123456789",
    courier: "BlueDart",
    eta: "Aug 26, 2025",
    subtotal: 2499,
    shipping: 0,
    tax: 0,
    total: 2499,
    address: {
      name: "Arjun Kapoor",
      line1: "221B, Residency Road",
      city: "Bengaluru",
      zip: "560025",
      phone: "+91-98XXXXXX01",
    },
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
];
