// Original image URLs extracted from the user-provided HTML. No tracking scripts.
import { cachedAssets } from "./reference-cache.js";
export const referenceAssets = {
  "product:dough-v2-+-godhuman-+-level-max": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/87a530ce-cba5-4aa4-ad43-24090c1918b2.webp",
    "file": "product-dough-v2-plus-godhuman-plus-level-max.webp"
  },
  "product:dragon-2x-mitica-ou-magnetic-no-inventario-popular": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/26605949-9e90-440f-b2b3-2c0b873a271a.webp",
    "file": "product-dragon-2x-mitica-ou-magnetic-no-inventario-popular.webp"
  },
  "product:contas-aleatorias-raras": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/63121bf3-b970-4443-9d38-9dd198f99477.webp",
    "file": "product-contas-aleatorias-raras.webp"
  },
  "product:cdkttk-ou-darkblade-+-god-+-lvl-max-popular": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/b831a590-f899-40cf-a7a9-abfcf22b9282.webp",
    "file": "product-cdkttk-ou-darkblade-plus-god-plus-lvl-max-popular.webp"
  },
  "product:3x-chromatic-box": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/845ca5f1-accf-4f93-a5a0-acf27fba2efc.webp",
    "file": "product-3x-chromatic-box.webp"
  },
  "product:1x-chromatic-box": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/467842d1-bbda-470c-9506-0e6a83697130.webp",
    "file": "product-1x-chromatic-box.webp"
  },
  "product:ice-permanente-750-robux": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/0618c1cd-2cbc-4029-b943-e853e119e724.png",
    "file": "product-ice-permanente-750-robux.png"
  },
  "product:kitsune-1x-mitica-ou-magnetic-no-inventario-popular": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/packages/fa01d3af-edde-4de0-bee8-6f6285ed411a.webp",
    "file": "product-kitsune-1x-mitica-ou-magnetic-no-inventario-popular.webp"
  },
  "brand": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/theme/4f3bdba7-7979-4f2e-8eed-3b2c7da5c938.png",
    "file": "brand.png"
  },
  "banner": {
    "url": "https://gnr-assets.centralcart.ai/bloxrealm/Banner-Blox-Realm2.webp",
    "file": "banner.webp"
  },
  "category:bloxfruits": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/categories/6ad33ddd-761d-49e1-9338-98304b57f827.webp",
    "file": "category-bloxfruits.webp"
  },
  "category:gamepass-blox-fruits": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/categories/b9195372-f4a1-418d-88e1-59543ba49101.webp",
    "file": "category-gamepass-blox-fruits.webp"
  },
  "category:blue-lock": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/categories/6447a6dc-e660-49f7-8f6f-f0403006465c.webp",
    "file": "category-blue-lock.webp"
  },
  "category:jujutsu-shenanigans": {
    "url": "https://bloxrealm.com.br/cdn/stores/12116/categories/48ca397a-73ac-4a2e-a678-a43f6b7d79bd.png",
    "file": "category-jujutsu-shenanigans.png"
  }
};
export function referenceImage(key, fallback) { const a=referenceAssets[key]; return a ? (cachedAssets.includes(key) ? `/assets/reference/${a.file}` : a.url) : fallback; }
