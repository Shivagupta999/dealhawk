export const normalizeProduct = (product) => ({
  name: product?.title ?? product?.productName ?? 'Unknown Product',
  price: Number(product?.price ?? 0),
  website: product?.website ?? 'Unknown',
  url: product?.url ?? '',
  imageUrl: product?.imageUrl ?? ''
});
