# black-friday-deal-finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Dikac17/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Dikac17/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Black Friday Deal Finder — a static site of 36 real Black Friday and Cyber Monday deals, each found and price-checked by hand on Friday 27 November 2026 against retailer listings and reputable deal roundups (9to5Toys, 9to5Mac, MacRumors, Yahoo Shopping, DealNews, Best Buy's own Black Friday release, Target's official ad). Every deal shows the product, its store, a link to it there, the sale price, the store's usual price, and when the price was checked — plus a verdict that says whether the cut is really a deal.

Search and filter by category, store and discount, sort by biggest discount, biggest saving, lowest price or name, and flip on "Real deals only" to see just the 27 deals that clear the bar. Filter views live in the hash, so any filtered view is a shareable link. Every deal has its own page with the full price breakdown and the source it was read in. The site runs from static files with no network request, on desktop and on phone.

How we call a deal: **REAL DEAL** — at least 40% off, a verified all-time low, or $100+ saved on a big-ticket item. **GOOD DEAL** — 20–39% off or $30+ saved. Anything weaker never made the list. "Was" prices are the store's own list or reference price. Prices move fast in Black Friday week — check the store page before you pay.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` directly in a browser. To hand in the entry:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=1xzg4p72&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
