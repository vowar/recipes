# Recipes

Personal recipe cards with step-by-step checklists. A static site with no build step: plain HTML, CSS and ES modules, with React 18 vendored in `assets/vendor/`.

Live: https://vowar.github.io/recipes/

## Layout

| Path | Purpose |
|---|---|
| `index.html` | The single page. `#/` lists the recipes, `#/<slug>` opens one. |
| `assets/site.css` | Shared styles. Colors come from CSS custom properties (the theme). |
| `assets/themes.js` | Color presets: `gold`, `wine`, `chili`, `ember`. |
| `assets/app.js` | Hash router, theme switching, home page, loading and error screens. |
| `assets/recipe-app.js` | Renders a recipe page: pickers, ingredients, checklist, progress. |
| `recipes/index.js` | The recipe manifest, one entry per recipe. |
| `recipes/<slug>.js` | One module per recipe: data plus a `view()` that builds the page. |
| `recipes/TEMPLATE.js` | Annotated copy of the recipe schema. Not registered. |

## Add a recipe

1. Copy `recipes/TEMPLATE.js` to `recipes/<slug>.js` (ASCII kebab-case slug) and fill in `badge`, `selectors` and `view()`.
2. Add an entry to `recipes/index.js`: `slug`, `emoji`, `title`, `description`, `theme`, and `load: () => import("./<slug>.js")`.
3. Preview locally (see below) and open `http://127.0.0.1:8000/#/<slug>`.
4. Commit and push. The site updates within about a minute; browsers may keep the old version cached for up to 10 minutes.

Progress (checked steps) is saved in the browser's localStorage, per recipe and per combination of picker values.

## Preview locally

ES modules do not load from `file://`, so serve the folder:

```
python -m http.server 8000
```

Then open http://127.0.0.1:8000/. `node --check recipes/<slug>.js` catches syntax errors without a browser.

## Themes

A theme is 11 hex colors in `assets/themes.js`. Use a preset in the manifest (`theme: themes.gold`) or override a few keys: `theme: { ...themes.gold, "accent": "#8fb3ff" }`.

## Deploy

GitHub Pages serves the root of the `main` branch. Every push to `main` redeploys.

Take the site offline (making the repo private unpublishes Pages automatically on the free plan):

```
gh repo edit vowar/recipes --visibility private --accept-visibility-change-consequences
```

Bring it back:

```
gh repo edit vowar/recipes --visibility public --accept-visibility-change-consequences
gh api -X POST repos/vowar/recipes/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
```

## Conventions

- No build step, no `package.json`, no CDN scripts. Relative URLs only, because the site lives under `/recipes/`.
- Recipe modules contain data only and never import React.
- Files are UTF-8 without BOM. Emoji only inside content, never in file names.
- Code comments in English, UI text in Russian.
- The original standalone pages are kept in git history (first commit).
