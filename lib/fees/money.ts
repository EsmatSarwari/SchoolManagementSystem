const amountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** Formats fee amounts consistently throughout the school application. */
export function formatAfghani(amount: number) {
  return `${amountFormatter.format(amount)} AFN`;
}
