import { mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { referenceAssets } from '../public/reference-assets.js';
import { cachedAssets } from '../public/reference-cache.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../public');
const directory=resolve(root,'assets/reference');
await mkdir(directory,{recursive:true});
const cached=new Set(cachedAssets);
let failed=0;
for (const [key,asset] of Object.entries(referenceAssets)) {
  if(cached.has(key))continue;
  try {
    const response=await fetch(asset.url,{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    if(!response.headers.get('content-type')?.startsWith('image/'))throw new Error('Resposta não é uma imagem');
    const buffer=Buffer.from(await response.arrayBuffer());
    if(!buffer.length||buffer.length>12*1024*1024)throw new Error('Tamanho de imagem inválido');
    // Check image signatures before replacing the source with a local cached file.
    const png=buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp=buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP';
    const jpg=buffer[0]===255&&buffer[1]===216&&buffer[2]===255;
    if(!png&&!webp&&!jpg)throw new Error('Assinatura de imagem inválida');
    const target=resolve(directory,asset.file);
    await writeFile(target+'.tmp',buffer);await rename(target+'.tmp',target);cached.add(key);
    console.log(`Salvo: ${key}`);
  } catch(error) {failed++;console.error(`${key}: ${error.message}`);}
}
await writeFile(resolve(root,'reference-cache.js'),'// Downloaded reference images, verified by scripts/sync-reference-assets.js.\nexport const cachedAssets = '+JSON.stringify([...cached])+';\n');
console.log(`${cached.size}/${Object.keys(referenceAssets).length} imagens originais disponíveis localmente.`);
if(failed)process.exitCode=1;
