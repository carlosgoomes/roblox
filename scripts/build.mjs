import {renderAboveFold} from '../public/above-fold.js';
import {buildSync} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const result=buildSync({
  absWorkingDir:root,
  entryPoints:{app:'public/app.js',effects:'public/effects.js',styles:'scripts/store.css'},
  outdir:'public/dist',entryNames:'[name]-[hash]',
  bundle:true,minify:true,format:'esm',platform:'browser',
  target:['chrome100','firefox100','safari15.4'],
  metafile:true,legalComments:'none'
});
const entries={};
for(const [path,output] of Object.entries(result.metafile.outputs)){
  if(!output.entryPoint)continue;
  const name=output.entryPoint==='scripts/store.css'?'styles':output.entryPoint.endsWith('/app.js')?'app':'effects';
  entries[name]='/'+relative(resolve(root,'public'),resolve(root,path)).split(sep).join('/');
}
let html=readFileSync(resolve(root,'public/index.html'),'utf8');
html=html.replace(/^\s*<link rel="stylesheet" href="\/(?:style|reference-layout|product-artwork|promotion|neon)\.css">\n/gm,'');
html=html.replace(/^\s*<link rel="stylesheet" href="\/dist\/styles-[^"]+">\n/gm,'');
html=html.replace('  <!-- Meta Pixel Code:', '  <link rel="stylesheet" href="'+entries.styles+'">\n  <!-- Meta Pixel Code:');
html=html.replace(/^\s*<link rel="modulepreload"[^>]+>\n/gm,'');
html=html.replace(/<script type="module" src="\/(?:app\.js[^"]*|dist\/app-[^"]+)"><\/script>/,'<script type="module" src="'+entries.app+'"></script>');
html=html.replace(/<script type="module" src="\/(?:effects\.js|dist\/effects-[^"]+)"><\/script>/,'<script type="module" src="'+entries.effects+'"></script>');
const boot='if(location.pathname!=="/")document.documentElement.classList.add("client-route");';
html=html.replace(/^\s*<script data-route-boot>[^<]*<\/script>\n/gm,'');
html=html.replace('  <!-- Meta Pixel Code:', '  <script data-route-boot>'+boot+'</script>\n  <!-- Meta Pixel Code:');
const shell='<!-- Initial storefront --><main id="main" tabindex="-1"><div class="home-reference container">'+renderAboveFold()+'</div></main><!-- End initial storefront -->';
if(html.includes('<!-- Initial storefront -->'))html=html.replace(/<!-- Initial storefront -->[\s\S]*?<!-- End initial storefront -->/,shell);
else html=html.replace('<div id="app"></div>','<div id="app" data-initial-shell>'+shell+'</div>');
writeFileSync(resolve(root,'public/index.html'),html);
writeFileSync(resolve(root,'public/dist/manifest.json'),JSON.stringify(entries,null,2)+'\n');
console.log('Frontend bundles: '+JSON.stringify(entries));
