// RecipeApp: shared renderer for a single recipe page.
// Props: entry (the manifest record from recipes/index.js) and recipe (the module's default export:
// { badge, selectors, view }). The data schema is documented in recipes/TEMPLATE.js.

const { createElement: h, Fragment, useState, useEffect } = window.React;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const list = value => (Array.isArray(value) ? value : []);

function defaultSelection(selectors) {
  const sel = {};
  for (const s of selectors) sel[s.key] = s.default != null ? s.default : s.options[0].value;
  return sel;
}

// Validate the stored selection against the current options; fall back to the default
// when a variant has been removed from the recipe.
function restoreSelection(selectors, stored) {
  const sel = defaultSelection(selectors);
  if (stored && typeof stored === "object") {
    for (const s of selectors) {
      if (s.options.some(o => o.value === stored[s.key])) sel[s.key] = stored[s.key];
    }
  }
  return sel;
}

// view may be a function of the selection or a plain object for recipes without variants.
function resolveView(recipe, sel) {
  const view = typeof recipe.view === "function" ? recipe.view(sel) : recipe.view;
  return view || {};
}

function Pair({ className, lead, text }) {
  return h("div", { className }, h("b", null, lead), h("span", null, text));
}

export function RecipeApp({ entry, recipe }) {
  const selectors = list(recipe.selectors);
  const storeSel = "recipes:" + entry.slug + ":sel";
  const storeDone = "recipes:" + entry.slug + ":done";

  const [sel, setSel] = useState(() => restoreSelection(selectors, load(storeSel, null)));
  const [doneAll, setDoneAll] = useState(() => {
    const stored = load(storeDone, {});
    return stored && typeof stored === "object" ? stored : {};
  });
  const [tab, setTab] = useState("Все");

  // Progress is stored separately for every combination of selector values.
  const doneKey = selectors.map(s => s.key + "=" + sel[s.key]).join("|") || "default";
  const view = resolveView(recipe, sel);
  const steps = list(view.steps);
  const done = doneAll[doneKey] || {};

  useEffect(() => { save(storeSel, sel); }, [storeSel, sel]);
  useEffect(() => { save(storeDone, doneAll); }, [storeDone, doneAll]);
  useEffect(() => { setTab("Все"); }, [doneKey]);

  const groups = ["Все", ...new Set(steps.map(s => s.group))];
  const filtered = tab === "Все" ? steps : steps.filter(s => s.group === tab);
  const completed = steps.filter((_, i) => done[i]).length;
  const percent = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  const choose = (key, value) => setSel(prev => ({ ...prev, [key]: value }));
  const toggle = idx => setDoneAll(prev => {
    const current = prev[doneKey] || {};
    return { ...prev, [doneKey]: { ...current, [idx]: !current[idx] } };
  });
  const reset = () => setDoneAll(prev => ({ ...prev, [doneKey]: {} }));
  const markAll = () => {
    const all = {};
    steps.forEach((_, i) => { all[i] = true; });
    setDoneAll(prev => ({ ...prev, [doneKey]: all }));
  };

  const plate = view.plate || null;
  const macros = view.macros && list(view.macros.items).length ? view.macros : null;

  return h("div", { className: "app" },
    h("nav", { className: "topbar" }, h("a", { className: "back", href: "#/" }, "← Все рецепты")),

    h("section", { className: "hero" },
      h("div", { className: "card hero-main" },
        recipe.badge ? h("div", { className: "badge" }, recipe.badge) : null,
        h("h1", null, view.title || entry.title),
        view.subtitle ? h("p", { className: "subtitle" }, view.subtitle) : null,

        selectors.map(s => h("div", { className: "picker-group", key: s.key },
          s.label ? h("div", { className: "picker-label" }, s.label) : null,
          h("div", { className: "picker", role: "tablist", "aria-label": "Выбор: " + (s.label || s.key) },
            s.options.map(o => h("button", {
              key: o.value,
              type: "button",
              role: "tab",
              "aria-selected": sel[s.key] === o.value,
              className: "picker-option" + (sel[s.key] === o.value ? " active" : ""),
              onClick: () => choose(s.key, o.value)
            }, o.label))
          )
        )),

        list(view.meta).length ? h("div", { className: "meta-grid" },
          view.meta.map((m, i) => h("div", { className: "meta", key: i }, h("b", null, m.value), h("span", null, m.label)))
        ) : null
      ),

      h("aside", { className: "card hero-side" },
        plate ? h("div", { className: "plate" },
          list(plate.floats).slice(0, 5).map((f, i) => h("span", { className: "float f" + (i + 1), key: i }, f)),
          h("span", { className: "big" }, plate.big)
        ) : null,
        h("div", { className: "progress-wrap" },
          h("div", { className: "progress-top" },
            h("span", null, view.progressLabel || "Прогресс готовки"),
            h("b", null, completed + "/" + steps.length + " · " + percent + "%")
          ),
          h("div", { className: "bar" }, h("div", { className: "fill", style: { width: percent + "%" } }))
        ),
        h("div", { className: "actions" },
          h("button", { className: "btn primary", type: "button", onClick: markAll }, "Готово всё"),
          h("button", { className: "btn", type: "button", onClick: reset }, "Сбросить")
        )
      )
    ),

    h("main", { className: "layout" },
      h("aside", { className: "card section" },
        h("h2", null, "Ингредиенты"),
        list(view.kickers).map((k, i) => h("div", { className: "kicker", key: i }, k)),
        view.intro ? h("p", { className: "subtitle intro" }, view.intro) : null,
        list(view.callouts).map((c, i) => h("div", { className: "callout " + (c.tone === "ok" ? "ok" : "accent"), key: i },
          c.lead ? h("b", null, c.lead) : null,
          c.text
        )),
        list(view.ingredientSections).map((section, i) => h(Fragment, { key: i },
          h("h3", null, section.heading),
          h("div", { className: "ingredients" },
            list(section.items).map((item, j) => h("div", { className: "ing", key: j },
              h("span", { className: "name" }, item[0]),
              h("span", { className: "amount" }, item[1])
            ))
          )
        )),
        view.note ? h("p", { className: "note" }, view.note) : null,
        macros ? h(Fragment, null,
          h("h3", null, macros.heading),
          h("div", { className: "macro-grid" },
            macros.items.map((m, i) => h("div", { className: "macro", key: i }, h("b", null, m.value), h("span", null, m.label)))
          )
        ) : null,
        list(view.variants).map((v, i) => h("div", { className: "variant", key: i }, h("b", null, v[0]), v[1]))
      ),

      h("section", { className: "card section" },
        h("h2", null, "Пошаговый todo"),
        h("div", { className: "tabs" },
          groups.map(g => h("button", {
            key: g,
            type: "button",
            className: "tab" + (tab === g ? " active" : ""),
            onClick: () => setTab(g)
          }, g))
        ),
        h("div", { className: "todo-list" },
          filtered.map(step => {
            const idx = steps.indexOf(step);
            return h("label", { className: "todo" + (done[idx] ? " done" : ""), key: doneKey + ":" + idx },
              h("input", { className: "check", type: "checkbox", checked: !!done[idx], onChange: () => toggle(idx) }),
              h("div", null,
                h("p", { className: "todo-title" }, step.icon + " " + step.title),
                h("p", { className: "todo-desc" }, step.desc)
              ),
              h("span", { className: "time" }, step.time)
            );
          })
        ),
        list(view.tips).length ? h("div", { className: "tips" },
          view.tips.map((t, i) => h(Pair, { className: "tip", lead: t[0], text: t[1], key: i }))
        ) : null
      )
    ),

    view.footer ? h("footer", null, view.footer) : null
  );
}
