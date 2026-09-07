// Integer paise arithmetic — avoids IEEE-754 float drift in money totals.
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): number {
  return Math.round(paise) / 100;
}

// Named constant — change this one value to update the rate hospital-wide.
// Healthcare GST in India: most OPD/IPD services are exempt; diagnostics &
// pharmacy supplies may attract 5–12%. Using 5% as the baseline rate.
export const GST_RATE = 0.05;

export function billTotals(
  items: { amount: number }[],
  discount: number,
): {
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
} {
  const subtotalP = items.reduce((s, i) => s + toPaise(i.amount), 0);
  const discountP = Math.min(toPaise(discount), subtotalP);
  const taxableP = subtotalP - discountP;
  const taxP = Math.round(taxableP * GST_RATE);
  const totalP = taxableP + taxP;
  return {
    subtotal: toRupees(subtotalP),
    discount: toRupees(discountP),
    tax: toRupees(taxP),
    totalAmount: toRupees(totalP),
  };
}
