# Tasks
- [x] Task 1: Update `index.html` to include the LXGW WenKai Screen CDN link `<link rel="stylesheet" href="https://npm.elemecdn.com/lxgw-wenkai-screen-webfont@1.1.0/style.css" media="print" onload="this.media='all'">`.
- [x] Task 2: Update `src/index.css` to define a robust font stack using CSS variables. Define `--font-kai` combining the CDN font name, a local hook placeholder (`var(--local-font-hook, 'LXGW WenKai Screen')`), and system fallbacks.
- [x] Task 3: Update `src/index.css` to apply the `--font-kai` specifically to `.article-body` and its typography elements (p, h1, h2, h3, li), ensuring UI elements retain the default `--font-sans`.
- [x] Task 4: Provide instructions in a comment within `src/index.css` on how to activate the local font fallback.