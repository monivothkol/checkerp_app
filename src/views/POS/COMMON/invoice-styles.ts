// Print stylesheets for the two invoice formats. Kept as plain strings so they
// can be injected both into the on-screen preview and the print window.
// Palette follows the checkerp POS tokens (primary #3A53A4, ink #16192C).

import type { SaleInvoice } from "@/models/POS/invoice";
import UT from "@/core/utilities/ut";

/** Full A4 formal invoice. Selectors are all `.inv-` prefixed (self-scoped). */
export const INVOICE_A4_STYLES = `
@page { size: A4 portrait; margin: 10mm; }
.inv-doc { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #16192C; width: 190mm; max-width: 190mm; margin: 0 auto; background: #fff; }
.inv-card { border: 1px solid #E9E9EE; border-radius: 14px; overflow: hidden; }
.inv-header { display: flex; justify-content: space-between; align-items: flex-start;
    padding: 20px 22px; border-bottom: 2px solid #E9E9EE; }
.inv-store-name { font-size: 18px; font-weight: 700; color: #16192C; }
.inv-store-line { font-size: 12px; color: #6E7180; line-height: 1.6; }
.inv-title { text-align: right; }
.inv-title h1 { font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #3A53A4; margin: 0; }
.inv-title .inv-code { font-size: 13px; color: #16192C; font-weight: 600; margin-top: 4px;
    font-family: "SFMono-Regular", Menlo, Consolas, monospace; }
.inv-info { display: flex; gap: 12px; padding: 16px 22px 8px; }
.inv-box { flex: 1 1 50%; border: 1px solid #E9E9EE; border-radius: 10px; padding: 14px 16px; background: #F7F7F9; }
.inv-box-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #6E7180; margin-bottom: 6px; }
.inv-line { font-size: 12px; color: #16192C; line-height: 1.7; }
.inv-line span { color: #6E7180; display: inline-block; min-width: 92px; }
.inv-table-wrap { padding: 8px 22px 0; }
.inv-table { width: 100%; border-collapse: collapse; }
.inv-table th { background: #EEF1FA; color: #16192C; font-weight: 700; font-size: 11px;
    text-align: left; padding: 9px 8px; border: 1px solid #E9E9EE; white-space: nowrap; }
.inv-table td { padding: 8px; border: 1px solid #E9E9EE; font-size: 12px; color: #16192C; vertical-align: top; }
.inv-table .num { text-align: right; white-space: nowrap; }
.inv-table .ctr { text-align: center; }
.inv-item-code { font-size: 11px; color: #6E7180; }
.inv-free { color: #3A53A4; font-weight: 600; }
.inv-bundle { font-size: 11px; color: #3A53A4; font-style: italic; }
.inv-foot { display: flex; gap: 12px; padding: 16px 22px; }
.inv-notes { flex: 1 1 55%; font-size: 12px; color: #6E7180; }
.inv-notes .inv-box-title { margin-bottom: 8px; }
.inv-summary { flex: 1 1 45%; }
.inv-sum-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #16192C; }
.inv-sum-row .lbl { color: #6E7180; }
.inv-sum-row.total { border-top: 2px solid #E9E9EE; margin-top: 6px; padding-top: 8px; font-weight: 800; font-size: 16px; }
.inv-sum-row.total .val { color: #3A53A4; }
.inv-pay { padding: 0 22px 12px; }
.inv-pay-row { display: flex; justify-content: space-between; font-size: 12px; color: #16192C; padding: 3px 0; }
.inv-terms { padding: 0 22px 12px; font-size: 12px; color: #6E7180; }
.inv-terms .inv-box-title { margin-bottom: 6px; }
.inv-terms-body { line-height: 1.5; }
.inv-terms-body p { margin: 0 0 4px; }
.inv-terms-body ul { list-style: disc; padding-left: 18px; }
.inv-terms-body ol { list-style: decimal; padding-left: 18px; }
.inv-sign { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 24px 22px 36px; border-top: 1px solid #E9E9EE; }
.inv-sign-cell { text-align: center; }
.inv-sign-line { border-top: 1px dotted #9A9CA8; margin: 56px 12px 8px; }
.inv-sign-label { font-size: 12px; color: #6E7180; }
@media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .inv-doc { width: auto; }
    .inv-table tr, .inv-box, .inv-sign { page-break-inside: avoid; }
}
`;

/** 80mm thermal receipt. Monospace, dashed dividers, no color. */
export const POS_RECEIPT_STYLES = `
@page { size: 80mm auto; margin: 0; }
html, body { margin: 0; }
.rcpt { width: 72mm; padding: 6mm 4mm; font-family: "Courier New", ui-monospace, monospace;
    font-size: 12px; line-height: 1.35; color: #000; }
.rcpt-hd { text-align: center; padding-bottom: 6px; border-bottom: 1px dashed #000; }
.rcpt-hd .name { font-size: 15px; font-weight: bold; text-transform: uppercase; }
.rcpt-hd .sub { font-size: 11px; }
.rcpt-meta { padding: 6px 0; border-bottom: 1px dashed #000; }
.rcpt-row { display: flex; justify-content: space-between; }
.rcpt-items { padding: 6px 0; border-bottom: 1px dashed #000; }
.rcpt-item .nm { font-size: 12px; }
.rcpt-item .ln { display: flex; justify-content: space-between; font-size: 11px; }
.rcpt-tot { padding: 6px 0; }
.rcpt-tot .grand { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;
    border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin: 4px 0; }
.rcpt-terms { margin-top: 8px; padding-top: 6px; border-top: 1px dashed #999; font-size: 11px; line-height: 1.4; }
.rcpt-terms p { margin: 0 0 3px; }
.rcpt-terms ul, .rcpt-terms ol { padding-left: 16px; }
.rcpt-ft { text-align: center; padding-top: 8px; font-size: 12px; }
`;

/** Build the 80mm receipt HTML from a sale invoice. `money` formats amounts. */
export function buildReceiptHtml(inv: SaleInvoice, money: (v: unknown) => string): string {
    const store = inv.store ?? {};
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
    const line = (l: string, r: string) => `<div class="rcpt-row"><span>${esc(l)}</span><span>${esc(r)}</span></div>`;

    const items = (inv.items ?? []).map((it) => `
        <div class="rcpt-item">
            <div class="nm">${esc(it.productName)}${it.isFreeItem ? " (FREE)" : ""}</div>
            <div class="ln"><span>${esc(it.quantity)} x ${money(it.unitPrice)}</span><span>${money(it.amount)}</span></div>
        </div>`).join("");

    const payments = (inv.payments ?? []).map((p) => line(p.methodName ?? "Payment", money(p.amount))).join("");

    return `
    <div class="rcpt">
        <div class="rcpt-hd">
            <div class="name">${esc(store.name ?? "")}</div>
            ${store.address ? `<div class="sub">${esc(store.address)}</div>` : ""}
            ${store.phone ? `<div class="sub">Tel: ${esc(store.phone)}</div>` : ""}
        </div>
        <div class="rcpt-meta">
            ${line("Invoice", inv.saleCode ?? "")}
            ${line("Date", inv.saleDate ?? "")}
            ${inv.customerName ? line("Customer", inv.customerName) : ""}
        </div>
        <div class="rcpt-items">${items || "<div class=\"sub\">No items</div>"}</div>
        <div class="rcpt-tot">
            ${line("Subtotal", money(inv.subtotal))}
            ${Number(inv.discountAmount) ? line("Discount", "-" + money(inv.discountAmount)) : ""}
            ${Number(inv.taxAmount) ? line("Tax", money(inv.taxAmount)) : ""}
            <div class="grand"><span>TOTAL</span><span>${money(inv.totalAmount)}</span></div>
            ${payments}
            ${Number(inv.changeAmount) ? line("Change", money(inv.changeAmount)) : ""}
        </div>
        ${store.terms ? `<div class="rcpt-terms">${UT.purifyHTML(store.terms)}</div>` : ""}
        <div class="rcpt-ft">${esc(inv.paymentStatusName ?? inv.paymentStatus ?? "")}<br/>THANK YOU!</div>
    </div>`;
}
