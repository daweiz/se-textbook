// generate.js —— 从书稿 src/chapter-NN/NNNN-*.md 生成幻灯片数据文件
//
// 用法：node slides/tools/generate.js
// 输出：
//   slides/data/chapter-NN.js   每章幻灯片数据（window.SLIDES，章节数据源）
//   slides/data/unit-NN.js      每小节讲解用 deck（window.SLIDES，按 tools/units.js 划分 + 拆细）
//   slides/data/_manifest.js    章节清单（window.CHAPTERS）+ 小节清单（window.UNITS）
//
// 仅依赖 Node 内置模块。图片不复制，数据中以 ../src/chapter-NN/images/... 相对路径引用原图。
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..'); // book/
const SRC = path.join(ROOT, 'src');
const DATA_DIR = path.join(ROOT, 'slides', 'data');
const NARR_DIR = path.join(__dirname, 'narration');
const units = require('./units');

// —— 小工具 ——

/** HTML 转义（用于非行内格式的普通文本兜底） */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 行内格式转换：**加粗**、`代码`、$数学$、[链接](url) */
function inline(seg) {
  let s = esc(seg);
  s = s.replace(/\$([^$]+)\$/g, '<i>$1</i>');                    // 行内数学 → 斜体
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');      // 加粗
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');                // 行内代码
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => {       // 链接
    return `<a href="${esc(u)}">${t}</a>`;
  });
  return s;
}

/** 按中文标点切句 */
function sentences(text) {
  return text.split(/(?<=[。！？；])/).map((s) => s.trim()).filter(Boolean);
}

/** 去除行内 Markdown 标记，得到纯文本（用于 TTS 朗读与字幕） */
function plainText(s) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[#*\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 取文本前 n 句 */
function firstSentences(text, n) {
  return sentences(text).slice(0, n).join('');
}

/** 在 Node 沙箱中执行 JS 数据文件，返回 window.<name> */
function loadJsData(file, name) {
  const src = fs.readFileSync(file, 'utf8');
  // eslint-disable-next-line no-new-func
  return new Function('window', src + `;return window.${name};`)({});
}

/** 加载所有章节人工旁白文件，返回 { chapterSlug: { slideId: narration } } */
function loadNarrationMap(slugs) {
  const map = {};
  for (const slug of slugs) {
    const file = path.join(NARR_DIR, `${slug}.js`);
    if (!fs.existsSync(file)) continue;
    const sandbox = {};
    Function('window', fs.readFileSync(file, 'utf8') + '\nreturn window.NARRATION;')(sandbox);
    if (sandbox.NARRATION) map[slug] = sandbox.NARRATION;
  }
  return map;
}

// —— Markdown 解析 ——

/**
 * 把一节内容解析成"块"列表。
 * 块类型：h3 / p / list / table / img
 */
function parseChapter(mdPath) {
  const lines = fs.readFileSync(mdPath, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
  const sections = []; // { title, blocks }
  let chapterTitle = '';
  let introPara = '';
  let cur = null;

  const newSection = (title) => {
    cur = { title, blocks: [] };
    sections.push(cur);
    return cur;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) continue;

    // 章标题
    if (t.startsWith('# ')) {
      chapterTitle = t.slice(2).trim();
      cur = null;
      continue;
    }
    // 节标题（新幻灯片）
    if (t.startsWith('## ')) {
      newSection(t.slice(3).trim());
      continue;
    }
    // 小节标题（幻灯片内）
    if (t.startsWith('### ')) {
      const name = t.slice(4).trim();
      if (cur) cur.blocks.push({ type: 'h3', text: name });
      else cur = newSection(name);
      continue;
    }
    // 表格
    if (t.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[i].trim()));
        i++;
      }
      i--;
      if (cur) cur.blocks.push({ type: 'table', rows });
      continue;
    }
    // 图片
    if (t.startsWith('![')) {
      const m = t.match(/!\[([^\]]*)\]\(([^)]+)\)\s*\{([^}]*)\}/) || t.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        const widthAttr = m[3] ? m[3].match(/width=([\d.]+)%?/) : null;
        if (cur) {
          cur.blocks.push({
            type: 'img',
            alt: m[1],
            src: m[2],
            width: widthAttr ? parseInt(widthAttr[1], 10) : null,
          });
        }
      }
      continue;
    }
    // 列表
    if (t.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      i--;
      if (cur) cur.blocks.push({ type: 'list', items });
      continue;
    }
    // 代码围栏（提示词模板等），渲染为提示词框，围栏标记不进正文
    if (t.startsWith('```')) {
      const lang = t.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (cur) cur.blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      continue;
    }
    // 普通段落（收集到空行或标题为止）
    const para = [];
    while (i < lines.length) {
      const lt = lines[i].trim();
      if (!lt) break;
      if (/^#{1,3} /.test(lt)) break;
      if (lt.startsWith('|')) break;
      if (lt.startsWith('![')) break;
      if (lt.startsWith('- ')) break;
      if (lt.startsWith('```')) break;
      para.push(lt);
      i++;
    }
    i--;
    const text = para.join(' ');
    if (!text) continue;
    if (cur) cur.blocks.push({ type: 'p', text });
    else if (!introPara) introPara = text; // 章标题下的引导段
  }

  return { chapterTitle, introPara, sections };
}

/** 解析表格一行，返回单元格文本数组 */
function parseTableRow(line) {
  return line
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c !== '');
}

// —— 渲染 HTML ——

const IMG_BASE = (slug) => `../src/${slug}/`; // 书稿内图片 src 已含 images/ 前缀

/** 把图片块渲染为 <img>，带可选宽度 */
function renderImg(block, slug) {
  const w = block.width ? ` style="width:${block.width}%"` : '';
  return `<img src="${IMG_BASE(slug)}${esc(block.src)}" alt="${esc(block.alt)}"${w}>`;
}

/** 把块列表渲染为 HTML（含并排图片处理），返回 HTML 字符串 */
function renderBlocks(blocks, slug) {
  const out = [];
  let sawLead = false;
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    switch (b.type) {
      case 'h3':
        out.push(`<h3>${inline(b.text)}</h3>`);
        i++;
        break;
      case 'p': {
        // 每个块内的句子切句；本块中的第一段作为导语，其余句子拆成要点
        const sents = sentences(b.text);
        if (sents.length) {
          const isLead = !sawLead;
          if (isLead) sawLead = true;
          if (isLead) out.push(`<p class="lead">${inline(sents.slice(0, 2).join(''))}</p>`);
          const rest = isLead ? sents.slice(2) : sents;
          if (rest.length) out.push(`<ul>${rest.slice(0, 3).map((s) => `<li>${inline(s)}</li>`).join('')}</ul>`);
        }
        i++;
        break;
      }
      case 'list':
        out.push(`<ul>${b.items.map((it) => `<li>${inline(it)}</li>`).join('')}</ul>`);
        i++;
        break;
      case 'table': {
        let rows = b.rows;
        // 跳过 Markdown 表格分隔线行（---）
        if (rows.length >= 2 && rows[1].every((c) => /^:?-{2,}:?$/.test(c))) {
          rows = [rows[0], ...rows.slice(2)];
        } else if (rows.length >= 1 && rows[0].every((c) => /^:?-{2,}:?$/.test(c))) {
          rows = rows.slice(1);
        }
        const header = rows[0] || [];
        const dataRows = rows.slice(1);
        const th = header.map((c) => `<th>${inline(c)}</th>`).join('');
        const trs = dataRows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('');
        if (th) out.push(`<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`);
        else if (trs) out.push(`<table><tbody>${trs}</tbody></table>`);
        i++;
        break;
      }
      case 'img': {
        // 连续两张窄图并排显示
        const nb = blocks[i + 1];
        if (nb && nb.type === 'img' && nb.width && b.width && nb.width <= 55 && b.width <= 55) {
          out.push(`<div class="img-pair">${renderImg(b, slug)}${renderImg(nb, slug)}</div>`);
          i += 2;
        } else {
          out.push(`<div class="img-single">${renderImg(b, slug)}</div>`);
          i++;
        }
        break;
      }
      case 'code':
        out.push(`<pre class="prompt"><code>${esc(b.text)}</code></pre>`);
        i++;
        break;
      default:
        i++;
    }
  }
  return out.join('\n');
}

// —— 章节幻灯片切分 ——

/** 块权重：决定一张幻灯片最多容纳多少内容 */
const weightOf = (b) =>
  b.type === 'table' ? 2 : b.type === 'code' ? 2 : b.type === 'list' ? 1 : b.type === 'p' ? 1 : b.type === 'img' ? 1 : 0.5;
const MAX_WEIGHT = 6;

/** 把一个节切分为若干张幻灯片（每张权重 ≤ MAX_WEIGHT） */
function splitSection(section, slug, chapterNum, slideNo) {
  const slides = [];
  let chunk = [];
  let weight = 0;
  const flush = () => {
    if (!chunk.length) return;
    slides.push({ blocks: chunk });
    chunk = [];
    weight = 0;
  };
  for (const b of section.blocks) {
    const w = weightOf(b);
    if (weight + w > MAX_WEIGHT && chunk.length) flush();
    chunk.push(b);
    weight += w;
  }
  flush();

  const out = [];
  for (let k = 0; k < slides.length; k++) {
    const isFirst = k === 0;
    const title = isFirst ? section.title : `${section.title}（续）`;
    out.push({
      id: `${slug.replace('-', '')}-${slideNo++}`,
      type: 'section',
      title,
      body: renderBlocks(slides[k].blocks, slug),
      narration: draftNarration(section, k === 0),
    });
  }
  return { slides: out, next: slideNo };
}

/** 生成章节旁白草稿（后续由 apply-narration.js 用人工旁白覆盖） */
function draftNarration(section, isFirst) {
  const lead = section.blocks.find((b) => b.type === 'p');
  const leadText = lead ? plainText(firstSentences(lead.text, 2)) : '';
  if (isFirst) {
    return `${section.title}。${leadText}`;
  }
  return `继续讨论${section.title}。${leadText}`;
}

// —— 小节 deck 生成（拆细为讲解用子页） ——

/** 把一段 body HTML 切成顶层块列表：h3 / lead / list / table / img */
function splitHtmlBlocks(html) {
  const lines = String(html || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let i = 0;
  let firstLead = true; // 同一逻辑节内仅首个导语块成"导引"页，后续导语并入要点
  // 块可能是单行（<ul>…</ul> 同行）或多行，按闭合标签收集
  const collect = (closeTag) => {
    const buf = [lines[i]];
    if (!lines[i].includes(closeTag)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(closeTag)) { buf.push(lines[j]); j++; }
      if (j < lines.length) buf.push(lines[j]);
      i = j;
    }
    i++;
    return buf.join('\n');
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('<h3>')) { blocks.push({ kind: 'h3', html: line }); i++; }
    else if (line.startsWith('<p class="lead">')) {
      if (firstLead) { blocks.push({ kind: 'lead', html: line }); firstLead = false; i++; }
      else { blocks.push({ kind: 'list', html: leadToLi(line) }); i++; }
    }
    else if (line.startsWith('<ul>')) { blocks.push({ kind: 'list', html: collect('</ul>') }); }
    else if (line.startsWith('<table>')) { blocks.push({ kind: 'table', html: collect('</table>') }); }
    else if (line.startsWith('<div class="img-')) { blocks.push({ kind: 'img', html: collect('</div>') }); }
    else if (line.startsWith('<pre class="prompt">')) { blocks.push({ kind: 'code', html: collect('</pre>') }); }
    else { blocks.push({ kind: 'other', html: line }); i++; }
  }
  return blocks;
}

/** 把后续导语段落转为要点条目（<p class="lead">…</p> → <ul><li>…</li></ul>） */
function leadToLi(html) {
  const inner = String(html || '').replace(/^<p class="lead">/, '').replace(/<\/p>$/, '');
  return `<ul><li>${inner}</li></ul>`;
}

/**
 * 顶层块 → 讲解子页分组。
 * 规则：h3 起新组；导引页吸收其后相邻的列表块（段落续句并入导引，避免 1–2 条要点独占一页）；
 * 表格、图示各自独立成页；其余（孤立要点列表、同种相邻块）按 kind 合并。
 */
function groupBlocks(blocks) {
  const groups = [];
  let cur = null;
  const flush = () => {
    if (cur) {
      cur.html = cur.blocks.map((b) => b.html).join('\n');
      groups.push(cur);
      cur = null;
    }
  };
  for (const b of blocks) {
    if (b.kind === 'h3') { flush(); cur = { h3: htmlToText(b.html), kind: null, blocks: [], listCount: 0, tableRows: 0 }; continue; }
    if (!cur) cur = { h3: null, kind: null, blocks: [], listCount: 0, tableRows: 0 };
    if (cur.kind === null) {
      cur.kind = b.kind;
    } else {
      // 概述页不吸收列表（引导段独立成页，列表各自成页，撑足每节页数）；图示/小表格/提示词页吸收其后 1 条要点；
      // 列表不合并同类，各自成组再拆页；其余各自成组
      let mergeable = b.kind === cur.kind && b.kind !== 'list';
      if (b.kind === 'list' && cur.kind === 'lead') mergeable = false;
      if (b.kind === 'list' && cur.kind === 'img') mergeable = false;
      if (b.kind === 'list' && cur.kind === 'table') mergeable = false;
      if (b.kind === 'list' && cur.kind === 'code') mergeable = cur.listCount < 1;
      if (!mergeable) { flush(); cur = { h3: null, kind: b.kind, blocks: [], listCount: 0, tableRows: 0 }; }
    }
    cur.blocks.push(b);
    if (b.kind === 'list') cur.listCount++;
    if (b.kind === 'table') cur.tableRows += (b.html.match(/<tr>/g) || []).length;
  }
  flush();
  return groups;
}

/** 把一个列表页拆成若干页（每页至多 perPage 条要点），返回多个 <ul> 片段 */
function splitListHtml(html, perPage) {
  const items = [];
  const re = /<li>[\s\S]*?<\/li>/g;
  let m;
  while ((m = re.exec(html))) items.push(m[0]);
  if (items.length <= perPage) return [html];
  const chunks = [];
  for (let i = 0; i < items.length; i += perPage) {
    chunks.push('<ul>' + items.slice(i, i + perPage).join('') + '</ul>');
  }
  return chunks;
}

/** 把导引页拆成若干页（首段导语始终留在首页，要点按 perPage 拆分） */
function splitLeadHtml(html, perPage) {
  const leadMatch = html.match(/<p class="lead">[\s\S]*?<\/p>/);
  const lead = leadMatch ? leadMatch[0] : '';
  const rest = leadMatch ? html.slice(0, leadMatch.index) + html.slice(leadMatch.index + leadMatch[0].length) : html;
  const items = [];
  const re = /<li>[\s\S]*?<\/li>/g;
  let m;
  while ((m = re.exec(rest))) items.push(m[0]);
  if (items.length <= perPage) return [html];
  const chunks = [];
  for (let i = 0; i < items.length; i += perPage) {
    const body = '<ul>' + items.slice(i, i + perPage).join('') + '</ul>';
    chunks.push(i === 0 ? lead + '\n' + body : body);
  }
  return chunks;
}

/** 把列表组/导引组按每页要点数进一步拆细，返回扩展后的分组列表 */
function expandGroups(groups) {
  const PER_PAGE = 3; // 每页至多 3 条要点，配合每节 ≥30 页
  const out = [];
  for (const g of groups) {
    if (g.kind === 'list') {
      for (const h of splitListHtml(g.html, PER_PAGE)) out.push({ ...g, html: h });
    } else if (g.kind === 'lead') {
      const chunks = splitLeadHtml(g.html, PER_PAGE);
      chunks.forEach((h, idx) => {
        // 概述续页不含导语段，改记为要点页
        out.push(idx === 0 ? { ...g, html: h } : { ...g, kind: 'list', html: h });
      });
    } else {
      out.push(g);
    }
  }
  return out;
}

/** 去除 HTML 标签与实体，得到纯文本（用于 TTS 旁白） */
function htmlToText(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const KIND_LABEL = { lead: '概述', list: '要点', table: '表格', img: '图示', code: '提示词' };

/** 为子页生成旁白：导引页复用该节首片人工旁白；其余为内容派生草案 */
function groupNarration(g, ls, handNarr) {
  if (g.kind === 'lead') {
    if (!/<p class="lead">/.test(g.html)) {
      return `继续本节要点：${htmlToText(g.html)}。`; // 导引页拆出的续页，改读要点
    }
    const hand = handNarr[ls.chapterSlug] && handNarr[ls.chapterSlug][ls.chapterSlideId];
    if (hand && hand.trim()) return hand;
    return ls.narration; // 无人工旁白时回退到生成草稿
  }
  if (g.h3) {
    const txt = `下面讨论${g.h3}。`;
    const lead = g.blocks.find((b) => b.kind === 'lead');
    const list = g.blocks.find((b) => b.kind === 'list');
    const table = g.blocks.find((b) => b.kind === 'table');
    const img = g.blocks.find((b) => b.kind === 'img');
    if (lead) return txt + ' ' + htmlToText(lead.html);
    if (list) return txt + ' ' + htmlToText(list.html);
    if (table) return txt + ' 具体见表。';
    if (img) return txt + ' 请看图示。';
    return txt;
  }
  if (g.kind === 'list') return `本页要点：${htmlToText(g.html)}。`;
  if (g.kind === 'table') {
    const li = g.blocks.filter((b) => b.kind === 'list').map((b) => htmlToText(b.html)).join('；');
    return `请看这张表，它概括了本节的关键信息。${li ? '要点：' + li + '。' : ''}`;
  }
  if (g.kind === 'img') {
    const li = g.blocks.filter((b) => b.kind === 'list').map((b) => htmlToText(b.html)).join('；');
    return `请看本页图示，帮助理解本节内容。${li ? '要点：' + li + '。' : ''}`;
  }
  if (g.kind === 'code') {
    const li = g.blocks.filter((b) => b.kind === 'list').map((b) => htmlToText(b.html)).join('；');
    return `这是一个可直接套用的提示词模板。${li ? '要点：' + li + '。' : ''}`;
  }
  return '';
}

/** 封面片正文：删除规划内容（本讲导引提纲、模块/时长/环节徽标），封面只留节标题 */
function buildCoverBody() {
  return '';
}

/** 根据划分定义构造一个小节 deck 数据 */
function buildUnit(unitDef, chapterMap, handNarr) {
  const pad = (n) => String(n).padStart(2, '0');
  const slug = `unit-${pad(unitDef.num)}`;
  const idPrefix = slug.replace('-', ''); // unit01
  const slides = [];
  const chapterNames = [];
  const seen = new Set();
  const logicalSections = []; // { name, chapterSlug, chapterSlideId, narration, htmlBody }

  // 1) 把覆盖范围内的内容片按"逻辑节"（去「（续）」）归并
  for (const part of unitDef.parts) {
    const ch = chapterMap[part.ch];
    if (!ch) throw new Error(`unit ${unitDef.num}：缺少章节数据 ${part.ch}，请先运行章节生成`);
    if (!seen.has(ch.num)) { seen.add(ch.num); chapterNames.push(`第${ch.num}章　${ch.title}`); }
    for (let i = part.from; i <= part.to; i++) {
      const s = ch.slides[i];
      if (!s) throw new Error(`unit ${unitDef.num}：${part.ch} 缺少内容片下标 ${i}`);
      const base = s.title.replace(/（续）$/, '');
      const last = logicalSections[logicalSections.length - 1];
      if (last && last.chapterSlug === part.ch && last.name === base) {
        last.htmlBody += '\n' + (s.body || '');
      } else {
        logicalSections.push({
          name: base,
          chapterSlug: part.ch,
          chapterSlideId: s.id,
          narration: s.narration || '',
          htmlBody: s.body || '',
        });
      }
    }
  }

  // 2) 封面片（旁白由 apply-narration.js 注入）
  slides.push({
    id: `${idPrefix}-cover`,
    type: 'title',
    title: `第${unitDef.num}节　${unitDef.title}`,
    body: buildCoverBody(unitDef, chapterNames, logicalSections.length),
    narration: '',
  });

  // 3) 拆细为讲解子页
  let sub = 0;
  for (const ls of logicalSections) {
    const groups = expandGroups(groupBlocks(splitHtmlBlocks(ls.htmlBody)));
    const kindCount = {};
    for (const g of groups) {
      let title;
      if (g.h3) {
        title = `${ls.name} · ${g.h3}`;
      } else {
        const label = KIND_LABEL[g.kind] || '补充';
        kindCount[g.kind] = (kindCount[g.kind] || 0) + 1;
        title = `${ls.name}（${label}${kindCount[g.kind] > 1 ? ' ' + kindCount[g.kind] : ''}）`;
      }
      slides.push({
        id: `${idPrefix}-${++sub}`,
        type: 'section',
        title,
        body: g.html,
        narration: groupNarration(g, ls, handNarr),
      });
    }
  }

  // 4) 结束片
  slides.push({
    id: `${idPrefix}-end`,
    type: 'section',
    title: '本节小结',
    body: `<ul>${logicalSections.map((ls) => `<li>${inline(ls.name)}</li>`).join('')}</ul>`,
    narration: `本节主要内容就介绍到这里，我们依次学习了：${logicalSections.map((ls) => ls.name).join('、')}。`,
  });

  return {
    unit: unitDef.num,
    slug,
    title: unitDef.title,
    module: unitDef.module,
    moduleNum: unitDef.moduleNum,
    minutes: unitDef.minutes,
    qa: unitDef.qa,
    chapters: chapterNames,
    subtitle: '', // 封面只留节标题，不显示规划性副标题
    count: slides.length,
    slides,
  };
}

// —— 主流程 ——

/** 章节 slug 排序：chapter-01 … chapter-17 */
function chapterSlugs() {
  return fs
    .readdirSync(SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^chapter-\d{2}$/.test(d.name))
    .map((d) => d.name)
    .sort();
}

/** 校验 HTML 中引用的图片是否真实存在（img src 形如 ../src/chapter-NN/images/xxx） */
function checkImages(slides) {
  const missing = [];
  const re = /<img src="\.\.\/src\/(chapter-\d{2})\/images\/([^/"']+)"/g;
  for (const s of slides) {
    let m;
    while ((m = re.exec(s.body || ''))) {
      const p = path.join(SRC, m[1], 'images', m[2]);
      if (!fs.existsSync(p)) missing.push(`${m[1]} → ${m[2]}`);
    }
  }
  return missing;
}

function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const slugs = chapterSlugs();
  const manifest = [];
  let missingImgs = [];

  // —— 第 1 步：章节数据（保留为数据源与历史备份） ——
  for (const slug of slugs) {
    const dir = path.join(SRC, slug);
    const mdFiles = fs.readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f));
    if (mdFiles.length !== 1) {
      console.error(`[跳过] ${slug}：Markdown 文件数量异常（${mdFiles.length}）`);
      continue;
    }
    const mdPath = path.join(dir, mdFiles[0]);
    const { chapterTitle, introPara, sections } = parseChapter(mdPath);
    const num = parseInt(slug.slice(8), 10);

    const slides = [];
    let slideNo = 1;
    // 封面幻灯片
    slides.push({
      id: `${slug.replace('-', '')}-title`,
      type: 'title',
      title: `第${num}章　${chapterTitle}`,
      body: '',
      narration: `欢迎学习《智能软件工程基础》第${num}章，${chapterTitle}。${plainText(firstSentences(introPara, 1))}`,
    });

    for (const section of sections) {
      const r = splitSection(section, slug, num, slideNo);
      slides.push(...r.slides);
      slideNo = r.next;
    }

    missingImgs.push(...checkImages(slides));

    // 标题幻灯片副标题草稿（引导段首句去掉"。"）
    const subtitle = plainText(firstSentences(introPara, 1)).replace(/[。！？]$/, '');
    const data = {
      chapter: slug,
      num,
      slug,
      title: chapterTitle,
      subtitle,
      slides,
    };

    const outFile = path.join(DATA_DIR, `${slug}.js`);
    fs.writeFileSync(outFile, '// 由 slides/tools/generate.js 生成；旁白文本可人工润色\n', 'utf8');
    fs.writeFileSync(outFile, 'window.SLIDES = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
    manifest.push({ num, slug, title: chapterTitle, file: `data/${slug}.js` });
    console.log(`[生成] ${slug}　${chapterTitle}　（${slides.length} 张幻灯片）`);
  }

  // —— 第 2 步：小节 deck（tools/units.js 划分 + 拆细） ——
  const chapterMap = {};
  for (const entry of manifest) chapterMap[entry.slug] = loadJsData(path.join(ROOT, 'slides', entry.file), 'SLIDES');
  const handNarr = loadNarrationMap(manifest.map((e) => e.slug));
  const unitManifest = [];

  for (const unitDef of units) {
    const data = buildUnit(unitDef, chapterMap, handNarr);
    missingImgs.push(...checkImages(data.slides));
    const outFile = path.join(DATA_DIR, `${data.slug}.js`);
    fs.writeFileSync(outFile, '// 由 slides/tools/generate.js 生成；封面旁白由 apply-narration.js 注入\n', 'utf8');
    fs.writeFileSync(outFile, 'window.SLIDES = ' + JSON.stringify(data, null, 2) + ';\n', 'utf8');
    unitManifest.push({
      num: data.unit,
      slug: data.slug,
      title: data.title,
      module: data.module,
      moduleNum: data.moduleNum,
      minutes: data.minutes,
      qa: data.qa,
      chapters: data.chapters,
      outline: unitDef.outline,
      count: data.count,
      file: `data/${data.slug}.js`,
    });
    console.log(`[生成] ${data.slug}　${data.title}　（${data.slides.length} 张幻灯片）`);
  }

  // —— 清单 ——
  const manifestFile = path.join(DATA_DIR, '_manifest.js');
  fs.writeFileSync(
    manifestFile,
    '// 章节清单与小节清单（由 generate.js 生成）\n' +
      'window.CHAPTERS = ' + JSON.stringify(manifest, null, 2) + ';\n' +
      'window.UNITS = ' + JSON.stringify(unitManifest, null, 2) + ';\n',
    'utf8'
  );

  if (missingImgs.length) {
    console.warn(`\n[告警] ${missingImgs.length} 张图片缺失：`);
    for (const s of missingImgs) console.warn('  ' + s);
  }
  console.log(`\n完成：${slugs.length} 章 → ${DATA_DIR}；${unitManifest.length} 小节 → ${DATA_DIR}`);
}

main();
