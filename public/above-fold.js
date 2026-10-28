import {optimizedAssets} from './optimized-assets.js';
import {categories} from './catalog.js';
import {promotion} from './promotion.js';

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 19L19 5M5 5h14v14"/></svg>';
function banner(name,alt,fallback){
 const a=optimizedAssets.banners[name];
 return `<img src="${a.src}" srcset="${a.srcset}" sizes="${a.sizes}" alt="${escape(alt)}" data-fallback="${fallback}" width="2172" height="724" fetchpriority="high" decoding="async">`;
}
export function renderAboveFold(){
 return `<div class="home-hero-layout"><section class="reference-hero" aria-label="Banner REALBUX"><h1 class="sr-only">REALBUX — Contas, itens e gamepasses Roblox</h1><a href="#store" aria-label="Ver produtos da loja">${banner('hero','Banner REALBUX','/assets/banner-fallback.svg')}</a></section><aside class="promo-banner" aria-label="Promoção REALBUX: 75% OFF"><a class="promo-link" href="${promotion.href}" aria-label="75% OFF em produtos selecionados Seu próximo upgrade custa menos. APROVEITAR OFERTAS">${banner('promotion','REALBUX — 75% OFF em produtos Roblox selecionados','/assets/realbux-promo-75.png')}<span class="promo-action"><span class="promo-action-copy"><strong>${promotion.label}</strong><small>Seu próximo upgrade custa menos.</small></span><span class="promo-cta">APROVEITAR OFERTAS ${arrow}</span></span></a></aside></div><section class="categories-section"><h2>Escolha uma categoria</h2><div class="category-grid">${categories.slice(0,4).map(c=>`<a class="category-card" href="/category/${c.id}" aria-label="${escape(c.name)}"><img src="/assets/${c.art}.svg" alt="${escape(c.name)}" loading="lazy"><span class="category-fallback-label">${escape(c.name)}</span></a>`).join('')}</div></section>`;
}
