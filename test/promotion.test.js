import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyPromotion} from '../public/promotion.js';
import {products} from '../public/catalog.js';

test('preço de R$ 6 se aplica somente aos produtos que ficavam abaixo de R$ 5',()=>{
  assert.equal(applyPromotion({price:6.90}).price,6);
  assert.equal(applyPromotion({price:19.96}).price,6); // Promotional price was R$ 4.99.
  assert.equal(applyPromotion({price:20}).price,5); // Exact R$ 5.00 is preserved.
  assert.equal(applyPromotion({price:24.90}).price,6.23);
  assert.equal(products.filter(p=>p.price===6).length,32);
  assert.equal(products.filter(p=>p.price<5).length,0);
  assert.equal(products.filter(p=>p.discountPercent===75).length,89);
  assert.equal(products.find(p=>p.id==='promocao-level-max').discountPercent,13);
  assert.equal(products.find(p=>p.id==='blue-lock-style-slot').price,6);
});
