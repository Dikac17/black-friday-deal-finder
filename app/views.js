// HTML for the deal finder, built from the deal data. Every value is escaped
// before it goes into the page. Views: the list (search + filters + sort),
// one deal's page, and the not-found page.

import { CATEGORIES, STORES } from './data.js';

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const day = (iso) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';

const VERDICT = {
  real: { label: 'REAL DEAL', cls: 'verdict-real', hint: 'A real deal: deep cut, all-time low, or $100+ saved.' },
  good: { label: 'GOOD DEAL', cls: 'verdict-good', hint: 'A solid cut — worth buying, not the deepest of the sale.' },
  small: { label: 'SMALL CUT', cls: 'verdict-small', hint: 'A modest cut. Check the store before you buy.' },
};

export function applyFilters(deals, f) {
  const q = (f.q || '').trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    if (f.cat && f.cat !== 'All' && d.category !== f.cat) return false;
    if (f.store && f.store !== 'All' && d.store !== f.store) return false;
    if (f.min && percentOff(d) < Number(f.min)) return false;
    if (f.realOnly && d.verdict !== 'real') return false;
    return true;
  });
  const sort = f.sort || 'discount';
  const by = {
    discount: (a, b) => percentOff(b) - percentOff(a) || saved(b) - saved(a),
    saving: (a, b) => saved(b) - saved(a) || percentOff(b) - percentOff(a),
    price: (a, b) => a.price - b.price || percentOff(b) - percentOff(a),
    name: (a, b) => a.title.localeCompare(b.title),
  }[sort] || ((a, b) => percentOff(b) - percentOff(a));
  return [...shown].sort(by);
}

export function card(d) {
  const v = VERDICT[d.verdict];
  return `<article class="card">
  <div class="card-top"><span class="cat">${escape(d.category)}</span><span class="store">${escape(d.store)}</span></div>
  <h2><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h2>
  <div class="price-row"><span class="price">${usd(d.price)}</span><s class="was">${usd(d.was)}</s><span class="off">${percentOff(d)}% off</span></div>
  <p class="save">You save ${usd(saved(d))}</p>
  <p class="verdict ${v.cls}" title="${escape(v.hint)}">${v.label}</p>
  <p class="note">${escape(d.verdictNote)}</p>
  <div class="card-actions">
    <a class="btn" href="#/deal/${encodeURIComponent(d.id)}">Details</a>
    <a class="btn btn-store" href="${escape(d.url)}" target="_blank" rel="noopener">Shop at ${escape(d.store)} ↗</a>
  </div>
  <p class="checked">Checked ${day(d.checked)}</p>
</article>`;
}

export function list(deals, f, total) {
  const cats = ['All', ...CATEGORIES];
  const stores = ['All', ...STORES];
  const chips = cats
    .map((c) => `<button type="button" class="chip${f.cat === c || (!f.cat && c === 'All') ? ' active' : ''}" data-cat="${escape(c)}">${escape(c)}</button>`)
    .join('');
  const storeOpts = stores.map((s) => `<option value="${escape(s)}"${f.store === s || (!f.store && s === 'All') ? ' selected' : ''}>${escape(s)}</option>`).join('');
  const minOpts = [['', 'Any discount'], ['20', '20% off or more'], ['30', '30% off or more'], ['40', '40% off or more'], ['50', '50% off or more']]
    .map(([v, l]) => `<option value="${v}"${String(f.min || '') === v ? ' selected' : ''}>${l}</option>`)
    .join('');
  const sortOpts = [['discount', 'Biggest discount'], ['saving', 'Biggest saving ($)'], ['price', 'Lowest price'], ['name', 'Name A–Z']]
    .map(([v, l]) => `<option value="${v}"${(f.sort || 'discount') === v ? ' selected' : ''}>${l}</option>`)
    .join('');
  const cards = deals.length ? deals.map(card).join('') : '<p class="empty">No deal matches those filters. Try clearing the search or lowering the discount.</p>';
  return `<section class="hero">
  <p class="kicker">BLACK FRIDAY · CYBER MONDAY · 27–30 NOV 2026</p>
  <h1>Real deals, checked today.</h1>
  <p class="lede">36 Black Friday and Cyber Monday deals, each found and price-checked by hand on
  Friday 27 November 2026. Every card shows the sale price, the store's usual price, when it was
  checked — and whether the cut is really a deal.</p>
  <p class="stats"><strong>${total} deals</strong> · <strong>${STORES.length} stores</strong> ·
  up to <strong>79% off</strong> · <strong>${usd(deals.reduce((a, d) => a + saved(d), 0))} total savings</strong> across the board</p>
</section>
<section class="controls" aria-label="Search and filter deals">
  <label class="search">Search <input id="q" type="search" placeholder="Try “AirPods”, “OLED”, “Dyson”…" value="${escape(f.q || '')}"></label>
  <div class="chips" role="group" aria-label="Category">${chips}</div>
  <div class="selects">
    <label>Store <select id="store">${storeOpts}</select></label>
    <label>Discount <select id="min">${minOpts}</select></label>
    <label>Sort <select id="sort">${sortOpts}</select></label>
    <label class="real-only"><input id="realOnly" type="checkbox"${f.realOnly ? ' checked' : ''}> Real deals only</label>
  </div>
</section>
<p class="count" id="count">${deals.length} of ${total} deals</p>
<div class="grid">${cards}</div>
<section class="method">
  <h2>How we call a deal</h2>
  <p><span class="verdict verdict-real">REAL DEAL</span> — at least 40% off, a verified all-time low,
  or $100+ saved on a big-ticket item. <span class="verdict verdict-good">GOOD DEAL</span> — 20–39% off
  or $30+ saved: worth buying, not the deepest of the sale. Anything weaker never made the list.
  “Was” prices are the store's own list or reference price — Best Buy calls it a “comparable value”,
  which is the store's reference number, not proof the item ever sold for that much. Prices move fast
  in Black Friday week: check the store page before you pay.</p>
</section>`;
}

export function deal(d) {
  const v = VERDICT[d.verdict];
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top"><span class="cat">${escape(d.category)}</span><span class="store">${escape(d.store)}</span></div>
  <h1>${escape(d.title)}</h1>
  <div class="price-row big"><span class="price">${usd(d.price)}</span><s class="was">${usd(d.was)}</s><span class="off">${percentOff(d)}% off</span></div>
  <p class="save big">You save ${usd(saved(d))}</p>
  <p class="verdict ${v.cls}">${v.label}</p>
  <p class="note big">${escape(d.verdictNote)}</p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Price checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p class="store-link"><a class="btn btn-store" href="${escape(d.url)}" target="_blank" rel="noopener">Find it at ${escape(d.store)} ↗</a></p>
  <p class="fine">Prices were live when checked on 27 November 2026 and can change or sell out.
  The link goes to the store's search for this product — confirm the price at checkout.</p>
</article>`;
}

export function missing() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
