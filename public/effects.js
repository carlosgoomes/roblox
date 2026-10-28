const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const interactive='.btn, .promo-cta, .login-btn, .cart-btn, .chip, .icon-btn';

// Delegation also covers controls created by SPA navigation, filters and drawers.
document.addEventListener('pointerdown',event=>{
  if(reducedMotion.matches||event.button!==0||!(event.target instanceof Element))return;
  const control=event.target.closest(interactive);
  if(!control||control.matches(':disabled,[aria-disabled="true"]'))return;
  const rect=control.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const x=Math.max(0,Math.min(rect.width,event.clientX-rect.left))-6;
  const y=Math.max(0,Math.min(rect.height,event.clientY-rect.top))-6;
  const ripple=document.createElement('span');
  ripple.className='neon-ripple';ripple.setAttribute('aria-hidden','true');control.append(ripple);
  const animation=ripple.animate([
    {transform:`translate(${x}px,${y}px) scale(0)`,opacity:.8},
    {transform:`translate(${x}px,${y}px) scale(${Math.max(rect.width,rect.height)/4})`,opacity:0}
  ],{duration:560,easing:'ease-out'});
  animation.finished.then(()=>ripple.remove(),()=>ripple.remove());
},{passive:true});

const selector='.product-card, .category-card, .benefits>div';
const seen=new WeakSet();
const entrance=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){
    if(!entry.isIntersecting)continue;
    entrance.unobserve(entry.target);
    if(reducedMotion.matches||seen.has(entry.target))continue;
    seen.add(entry.target);entry.target.classList.add('is-entering');
    entry.target.addEventListener('animationend',()=>entry.target.classList.remove('is-entering'),{once:true});
  }
},{threshold:.08}):null;
function elements(node){
  if(!(node instanceof Element))return [];
  return [...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)];
}
function watch(node){if(!entrance||reducedMotion.matches)return;for(const el of elements(node))if(!seen.has(el))entrance.observe(el);}
const app=document.getElementById('app');
if(app&&entrance){
  watch(app);
  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.removedNodes)for(const el of elements(node))entrance.unobserve(el);
      for(const node of record.addedNodes)watch(node);
    }
  }).observe(app,{childList:true,subtree:true});
}
reducedMotion.addEventListener('change',()=>{
  entrance?.disconnect();
  document.querySelectorAll('.is-entering').forEach(el=>el.classList.remove('is-entering'));
  if(!reducedMotion.matches&&app)watch(app);
});
function visibility(){document.documentElement.classList.toggle('motion-paused',document.hidden);}
document.addEventListener('visibilitychange',visibility);visibility();
