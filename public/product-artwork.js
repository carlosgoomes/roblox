// Original promotional illustrations generated for this project, not official game screenshots.
// Each sprite uses a cell in a local 6 × 6 atlas; the SVG viewport selects the cell without distortion.
export const artworkSheets = {
  fruits: '/assets/products/fruits-atlas.png',
  equipment: '/assets/products/equipment-atlas.png'
};
const fruits = ['rocket','spin','chop','spring','bomb','smoke','spike','flame','falcon','sand','dark','diamond','light','rubber','barrier','ghost','magma','quake','buddha','love','spider','phoenix','portal','rumble','dough','dragon','kitsune','leopard','ice','magnetic','venom','spirit','control','shadow','t-rex','mammoth'];
const equipment = ['cdk','ttk','dark-blade','shark-anchor','dragon-trident','spikey-trident','hallow-scythe','pole-v2','soul-guitar','godhuman','human-v4','shark-v4','angel-v4','rabbit-v4','ghoul-v4','cyborg-v4','veteran-account','premium-account','mastery','money-boost','fast-boats','lucky-drops','fruit-notifier','fruit-storage','boss-drops','vip','style-slot','flow-slot','style-spins','flow-spins','blue-lock-money','chromatic-box','chromatic-box-pack','jujutsu-early-access','jujutsu-emotes','mystery-account'];
export function artworkTile(key) {
  let index=fruits.indexOf(key),sheet='fruits';
  if(index<0){index=equipment.indexOf(key);sheet='equipment';}
  if(index<0)throw new Error(`Imagem de produto não encontrada: ${key}`);
  return {key,sheet,url:artworkSheets[sheet],row:Math.floor(index/6),column:index%6};
}

export function artworkForProduct(product) {
  const name=(product.name||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  let key;
  if(product.category==='blue-lock') {
    key=/dinheiro/.test(name)?'blue-lock-money':/spins/.test(name)?(/flow/.test(name)?'flow-spins':'style-spins'):/flow/.test(name)?'flow-slot':'style-slot';
  } else if(/chromatic/.test(name)) {
    key=/\b1x\b/.test(name)?'chromatic-box':'chromatic-box-pack';
  } else if(product.category==='jujutsu-shenanigans') {
    key=/emote/.test(name)?'jujutsu-emotes':/vip/.test(name)?'vip':/caixa/.test(name)?'chromatic-box-pack':'jujutsu-early-access';
  } else if(product.category==='contas-antigas-raras') {
    key=/\b20\d{2}\b/.test(name)?'veteran-account':'mystery-account';
  } else if(product.group==='Raças V4') {
    key=['shark','angel','rabbit','ghoul','cyborg'].find(r=>name.includes(r));
    key=(key||'human')+'-v4';
  } else if(product.group==='Contas PVP') {
    key=[['cdk','cdk'],['ttk','ttk'],['darkblade','dark-blade'],['dark blade','dark-blade'],['shark anchor','shark-anchor'],['dragon trident','dragon-trident'],['spikey trident','spikey-trident'],['hallow scythe','hallow-scythe'],['pole v2','pole-v2'],['soul guitar','soul-guitar']].find(([match])=>name.includes(match))?.[1]||'godhuman';
  } else if(product.group==='Gamepasses') {
    key=[['mastery','mastery'],['money','money-boost'],['fast boats','fast-boats'],['boss drops','boss-drops'],['drop chance','lucky-drops'],['fruit notifier','fruit-notifier'],['fruit storage','fruit-storage'],['dark blade','dark-blade'],['vip','vip']].find(([match])=>name.includes(match))?.[1]||'vip';
  } else {
    // Word boundaries distinguish Light from unrelated substrings, and Spin from Spins.
    key=fruits.find(f=>new RegExp(`\\b${f}\\b`,'i').test(name));
    if(!key)key=/caixa/.test(name)?'lucky-drops':/colecionador|exclusiv|especial/.test(name)?'premium-account':'godhuman';
  }
  const secondary=/soul guitar/.test(name)&&key!=='soul-guitar'?artworkTile('soul-guitar'):/godhuman|\+ god\b/.test(name)&&key!=='godhuman'?artworkTile('godhuman'):null;
  const year=name.match(/\b(20\d{2})\b/)?.[1];
  const amount=name.match(/\b(\d+)\s*(?:x|spins)\b/)?.[1];
  const variant=/permanente/.test(name)?'PERMANENTE':year?year:product.group==='Raças V4'?'RAÇA V4':amount?`${amount}${/spins/.test(name)?' SPINS':'X'}`:'';
  return {...artworkTile(key),secondary,variant};
}
