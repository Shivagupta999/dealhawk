export function validateTargetPrice(targetPrice, currentPrice) {
  const value = Number(targetPrice);

  if (!value || value <= 0) {
    return 'Please enter a valid price';
  }

  if (value >= currentPrice) {
    return `Target price must be lower than current price (₹${currentPrice})`;
  }

  return null;
}
