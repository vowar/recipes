// Site entry point. Hash router: "#/" is the recipe list, "#/<slug>" is a recipe page.
// Applies the recipe theme, sets the document title and lazily loads the recipe modules
// registered in recipes/index.js.

import manifest from "../recipes/index.js";
import { RecipeApp } from "./recipe-app.js";

const { createElement: h, Component } = window.React;
const { createRoot } = window.ReactDOM;

/* ---------- Theme ---------- */

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = s.split("").map(c => c + c).join("");
  const n = parseInt(s, 16);
  return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
}

// { accent: "#d9a85f" } -> { "--accent": "#d9a85f", "--accent-rgb": "217,168,95" }
export function themeVars(theme) {
  const vars = {};
  if (!theme) return vars;
  for (const [key, value] of Object.entries(theme)) {
    vars["--" + key] = value;
    const rgb = hexToRgb(value);
    if (rgb) vars["--" + key + "-rgb"] = rgb;
  }
  return vars;
}

const rootEl = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const defaultBg = getComputedStyle(rootEl).getPropertyValue("--bg").trim() || "#0f0f0d";
let appliedVars = [];

// Sets the theme variables on <html>; null restores the :root defaults (home page).
function applyTheme(theme) {
  for (const name of appliedVars) rootEl.style.removeProperty(name);
  appliedVars = [];
  for (const [name, value] of Object.entries(themeVars(theme))) {
    rootEl.style.setProperty(name, value);
    appliedVars.push(name);
  }
  if (themeColorMeta) themeColorMeta.setAttribute("content", (theme && theme.bg) || defaultBg);
}

/* ---------- Components ---------- */

// Russian plural form: 1 рецепт, 2 рецепта, 5 рецептов.
function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function Home() {
  return h("div", { className: "app" },
    h("section", { className: "card hero-main home-hero" },
      h("div", { className: "badge" }, "🍳 Recipe Todo"),
      h("h1", null, "Рецепты"),
      h("p", { className: "subtitle" }, "Пошаговые рецепты с чек-листом. Прогресс сохраняется в этом браузере.")
    ),
    h("div", { className: "home-grid" },
      manifest.map(entry => h("a", {
        key: entry.slug,
        className: "card home-card",
        href: "#/" + entry.slug,
        style: themeVars(entry.theme)
      },
        h("div", { className: "home-emoji" }, entry.emoji),
        h("h2", null, entry.title),
        h("p", null, entry.description),
        h("span", { className: "open" }, "Открыть →")
      ))
    ),
    h("footer", null, manifest.length + " " + plural(manifest.length, "рецепт", "рецепта", "рецептов"))
  );
}

function Status({ icon, title, text }) {
  return h("div", { className: "app" },
    h("nav", { className: "topbar" }, h("a", { className: "back", href: "#/" }, "← Все рецепты")),
    h("section", { className: "card status" },
      h("div", { className: "status-icon" }, icon),
      h("h2", null, title),
      text ? h("p", null, text) : null
    )
  );
}

// An error inside one recipe must not take down the whole site.
class RecipeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error("Recipe error:", error);
  }
  render() {
    const { error } = this.state;
    if (error) {
      return h(Status, { icon: "⚠️", title: "Ошибка в рецепте", text: String((error && error.message) || error) });
    }
    return this.props.children;
  }
}

/* ---------- Router ---------- */

const bySlug = new Map(manifest.map(entry => [entry.slug, entry]));
const loadedRecipes = new Map();
const root = createRoot(document.getElementById("root"));

function currentSlug() {
  const raw = location.hash.replace(/^#\/?/, "").replace(/\/+$/, "");
  try { return decodeURIComponent(raw); } catch { return raw; }
}

function renderRoute() {
  const slug = currentSlug();
  if (!slug) {
    root.render(h(Home));
    return;
  }
  const entry = bySlug.get(slug);
  if (!entry) {
    root.render(h(Status, { icon: "🤷", title: "Рецепт не найден", text: "Нет рецепта с адресом «" + slug + "»." }));
    return;
  }
  const recipe = loadedRecipes.get(slug);
  if (recipe) {
    root.render(h(RecipeBoundary, { key: slug }, h(RecipeApp, { entry, recipe })));
    return;
  }
  root.render(h(Status, { icon: entry.emoji, title: "Загрузка…", text: entry.title }));
  entry.load().then(
    module => {
      loadedRecipes.set(slug, module.default);
      // The user may have navigated elsewhere while the module was loading.
      if (currentSlug() === slug) renderRoute();
    },
    err => {
      console.error(err);
      if (currentSlug() === slug) {
        root.render(h(Status, { icon: "⚠️", title: "Не удалось загрузить рецепт", text: String((err && err.message) || err) }));
      }
    }
  );
}

// Theme and title are applied synchronously, before rendering, to avoid a flash of the default colors.
function route() {
  const entry = bySlug.get(currentSlug()) || null;
  applyTheme(entry ? entry.theme : null);
  document.title = entry ? entry.title + " — Рецепты" : "Рецепты";
  renderRoute();
  window.scrollTo(0, 0);
}

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("hashchange", route);
route();
