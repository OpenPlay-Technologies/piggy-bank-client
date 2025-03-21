// Overload signatures
export function formatSuiAmount(amount: number): string;
export function formatSuiAmount(amount: bigint): string;

// Actual implementation
export function formatSuiAmount(amount: number | bigint): string {
  if (typeof amount === "bigint") {
    const SUI_DECIMALS = 9n;
    const base = 10n ** SUI_DECIMALS;

    const whole = amount / base;
    const fraction = amount % base;

    const fractionStr = (fraction * 100n / base).toString().padStart(2, '0');

    return `${whole.toString()}.${fractionStr.slice(0, 2)} SUI`;
  } else {
    return (amount / 1e9).toFixed(2) + " SUI";
  }
}



export function formatBps(bps: number) {
  return (bps / 100).toFixed(2) + "%"
}

export function mistToSUI(mist: number) {
  return (mist / 1e9).toFixed(2)
}

export function formatAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(-5)}`
}

export function bpsToMultiplier(bps: number) {
  return (bps / 10000).toFixed(2) + "x"
}