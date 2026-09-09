# CLAUDE.md

Static recipe site with a Russian UI, published on GitHub Pages at https://vowar.github.io/recipes/. No build step.

## Structure

- `index.html` is the only page. `assets/app.js` routes `#/` (home) and `#/<slug>` (recipe) and applies the recipe theme.
- `assets/recipe-app.js` renders a recipe from the module's `{ badge, selectors, view }`; `recipes/TEMPLATE.js` documents that schema.
- `recipes/index.js` is the manifest (card data + lazy `load()`); `recipes/<slug>.js` holds the recipe data and `view()`.
- `assets/site.css` is themed through CSS custom properties; presets live in `assets/themes.js`.
- React 18.3.1 UMD is vendored in `assets/vendor/`.

## Adding a recipe

1. Copy `recipes/TEMPLATE.js` to `recipes/<slug>.js` and fill it in.
2. Add one entry to `recipes/index.js`.
3. Check with `node --check recipes/<slug>.js`, then serve with `python -m http.server 8000` and open `http://127.0.0.1:8000/#/<slug>` (ES modules do not load from `file://`).

## Rules

- No bundler, no `package.json` or `node_modules`, no CDN scripts, relative URLs only.
- Recipe modules are pure data plus `view()`; they never reference React or the DOM.
- Keep `recipes/TEMPLATE.js` and `assets/recipe-app.js` in sync when the schema changes.
- Theme variables are leaf colors; derived `rgba(var(--x-rgb), a)` values are written inline in the CSS rules that use them.
- Code comments in English; UI strings in Russian; files UTF-8 without BOM.
- Commit messages: a short one-line description, no footer.
- The original standalone pages are in the first commit if older versions are needed.
