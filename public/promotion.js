// Demo promotion: the discount is calculated from the price already listed in the catalog.
export const promotion = {
  percent: 80,
  scope: 'flash',
  productGroup: 'Promoção relâmpago',
  href: '/catalog?promo=80'
};
export function applyPromotion(product) {
  if (promotion.scope !== 'all' && product.group !== promotion.productGroup) return product;
  const originalCents = Math.round(product.price * 100);
  return {
    ...product,
    oldPrice: originalCents / 100,
    price: Math.round(originalCents * (100 - promotion.percent) / 100) / 100,
    discountPercent: promotion.percent
  };
}
