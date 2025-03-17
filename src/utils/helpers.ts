export function formatSuiAmount(amount: number) {
  return (amount / 1e9).toFixed(2) + " SUI"
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