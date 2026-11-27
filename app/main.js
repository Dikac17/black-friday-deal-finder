// The deal finder: every deal and a page for each, on hash routes. The deals
// live in data.js, so the site needs no network to show them; each deal links
// out to its store. Filters live in the hash query so a filtered view is a
// shareable link, e.g. #/?cat=TVs&min=40&sort=saving.
//
//   #/                              the list, with search and filters
//   #/?cat=TVs&min=40&store=Best+Buy&sort=price&q=oled&real=1
//   #/deal/<id>                     one deal
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from './data.js';
import { applyFilters, card as cardHtml, deal, list, missing } from './views.js';

const app = document.getElementById('app');

function readFilters() {
  const query = new URLSearchParams(location.hash.split('?')[1] || '');
  return {
    q: query.get('q') || '',
    cat: query.get('cat') || 'All',
    store: query.get('store') || 'All',
    min: query.get('min') || '',
    sort: query.get('sort') || 'discount',
    realOnly: query.get('real') === '1',
  };
}

function writeFilters(f) {
  const query = new URLSearchParams();
  if (f.q) query.set('q', f.q);
  if (f.cat && f.cat !== 'All') query.set('cat', f.cat);
  if (f.store && f.store !== 'All') query.set('store', f.store);
  if (f.min) query.set('min', f.min);
  if (f.sort && f.sort !== 'discount') query.set('sort', f.sort);
  if (f.realOnly) query.set('real', '1');
  const qs = query.toString();
  history.replaceState(null, '', '#/' + (qs ? '?' + qs : ''));
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder`;
    app.innerHTML = found ? deal(found) : missing();
  } else {
    document.title = 'Black Friday Deal Finder — 36 real deals, checked 27 Nov 2026';
    const f = readFilters();
    const shown = applyFilters(deals, f);
    app.innerHTML = list(shown, f, deals.length);
    const grid = app.querySelector('.grid');
    const count = app.querySelector('#count');
    const refresh = (next) => {
      const s = applyFilters(deals, next);
      grid.innerHTML = s.length
        ? s.map(cardHtml).join('')
        : '<p class="empty">No deal matches those filters. Try clearing the search or lowering the discount.</p>';
      count.textContent = `${s.length} of ${deals.length} deals`;
      writeFilters(next);
    };
    const q = app.querySelector('#q');
    q.addEventListener('input', () => {
      f.q = q.value;
      refresh(f);
    });
    app.querySelectorAll('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        f.cat = chip.dataset.cat;
        app.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
        refresh(f);
      });
    });
    app.querySelector('#store').addEventListener('change', (e) => {
      f.store = e.target.value;
      refresh(f);
    });
    app.querySelector('#min').addEventListener('change', (e) => {
      f.min = e.target.value;
      refresh(f);
    });
    app.querySelector('#sort').addEventListener('change', (e) => {
      f.sort = e.target.value;
      refresh(f);
    });
    app.querySelector('#realOnly').addEventListener('change', (e) => {
      f.realOnly = e.target.checked;
      refresh(f);
    });
    // Keep the search box focused where the shopper left it after a re-render.
    if (f.q) {
      q.focus();
      q.setSelectionRange(q.value.length, q.value.length);
    }
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
