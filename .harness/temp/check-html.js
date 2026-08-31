const fs=require('fs');
const h=fs.readFileSync('build/md_writing.html','utf8');
const imgs=[...h.matchAll(/images\/(20\d\d|21\d\d)-[a-z-]+\.svg/g)].map(m=>m[1]);
console.log('ch20/21 图片数:',imgs.length);
console.log([...new Set(imgs)].join(','));
console.log('ch20 节标题「意图驱动的开发流程」:',h.includes('意图驱动的开发流程'));
console.log('ch21 节标题「AI 原生组织」:',h.includes('AI 原生组织'));
console.log('提示词模板预格式块:',(h.match(/<pre class="prompt">/g)||[]).length,'个');
console.log('表格数:',(h.match(/<table>/g)||[]).length);
