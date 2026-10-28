// Apply the promotion, then the merchant's fixed price for items previously below R$ 5.
export const promotion = {
  percent: 75,
  scope: 'all',
  productGroup: 'Promoção relâmpago',
  href: '/catalog?promo=75',
  label: '75% OFF em produtos selecionados'
};
export function applyPromotion(product) {
  if (promotion.scope !== 'all' && product.group !== promotion.productGroup) return product;
  const originalCents = Math.round(product.price * 100);
  const promotionalCents = Math.round(originalCents * (100 - promotion.percent) / 100);
  const adjusted = promotionalCents < 500;
  const finalCents = adjusted ? 600 : promotionalCents;
  return {
    ...product,
    oldPrice: originalCents / 100,
    price: finalCents / 100,
    discountPercent: adjusted ? Math.max(0,Math.floor((originalCents-finalCents)*100/originalCents)) : promotion.percent
  };
}
