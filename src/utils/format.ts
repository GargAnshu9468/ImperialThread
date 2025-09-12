import { STATUS_STEPS } from "../data/statusSteps";
import type { OrderStatus, Order } from "./types";

export const formatINR = (value: number) => `₹${value.toFixed(0)}`;

export function getCurrentStepIndex(status: OrderStatus) {
  const i = STATUS_STEPS.indexOf(status);
  return i >= 0 ? i : 0;
}

export const currency = (n?: number) => `₹${Math.round(n ?? 0).toLocaleString("en-IN")}`;

export function buildInvoiceHTML(order: Order) {
  const rows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${it.price}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${it.price * it.quantity}</td>
      </tr>`
    )
    .join("");

  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.shipping ?? 0;
  const tax = order.tax ?? 0;

  const total = order.total ?? subtotal + shipping + tax;

  return `... long HTML ...`.replace("... long HTML ...", `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color:#111; }
        .brand { font-size: 20px; font-weight: 800; letter-spacing:.3px; color:#1E2749 }
        .muted { color:#666 }
        .card { border:1px solid #eee; border-radius:10px; padding:16px }
        .row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .mt16 { margin-top:16px }
        .mt8 { margin-top:8px }
        table { border-collapse:collapse; width:100%; margin-top:10px }
        th { text-align:left; font-size:12px; color:#666; padding:8px 12px; border-bottom:1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="row">
        <div class="brand">Imperial Thread</div>
        <div style="text-align:right">
          <div class="muted">Invoice</div>
          <div><b>${order.id}</b></div>
          <div class="muted">${new Date(order.date).toDateString()}</div>
        </div>
      </div>

      <div class="row mt16">
        <div class="card" style="flex:1">
          <div style="font-weight:700">Billed To</div>
          <div class="mt8">${order.address?.name ?? "-"}</div>
          <div>${order.address?.line1 ?? ""}</div>
          <div>${order.address?.city ?? ""} ${order.address?.zip ?? ""}</div>
          <div>${order.address?.phone ?? ""}</div>
        </div>
        <div class="card" style="flex:1">
          <div style="font-weight:700">Shipment</div>
          <div class="mt8">Status: ${order.status}</div>
          <div>Courier: ${order.courier ?? "-"}</div>
          <div>Tracking: ${order.trackingId ?? "-"}</div>
          <div>ETA: ${order.eta ?? "-"}</div>
        </div>
      </div>

      <div class="card mt16">
        <table>
          <thead>
            <tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="display:flex; justify-content:flex-end; margin-top:12px">
          <div style="min-width:240px;">
            <div class="row"><div class="muted">Subtotal</div><div>${currency(subtotal)}</div></div>
            <div class="row"><div class="muted">Shipping</div><div>${currency(shipping)}</div></div>
            <div class="row"><div class="muted">Tax</div><div>${currency(tax)}</div></div>
            <div class="row" style="font-weight:800; font-size:16px; margin-top:8px;"><div>Total</div><div>${currency(total)}</div></div>
          </div>
        </div>
      </div>

      <div style="text-align:center; color:#666; margin-top:18px">
        Thank you for shopping with Imperial Thread
      </div>
    </body>
  </html>`);
}
