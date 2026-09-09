// Recipe template. Copy this file to recipes/<slug>.js, fill it in, and register the recipe
// in recipes/index.js. This file itself is not registered anywhere.
//
// A recipe module has three parts:
//   1. plain data (ingredients, steps, ...) in any shape you like, kept at the top of the file;
//   2. `selectors`: the variant pickers shown in the hero (portion, sauce, technique...); [] when there are none;
//   3. `view(sel)`: builds the page content for the current selection `sel` ({ [selector.key]: value }).
//      It may also be a plain object when the recipe has no variants.
// Every field returned by view() is optional; the runtime skips what is missing.
// Progress (checked steps) is stored separately for every combination of selector values.

const ingredients = [
  ["🍝 Паста", "200 г"],                       // [name, amount] pairs; names start with an emoji
  ["🧄 Чеснок", "2 зубчика"]
];

const steps = [
  // group = tab name (tabs appear in order of first use), icon = emoji, time = short label on the right
  { group: "Подготовка", icon: "🔪", title: "Нарежь чеснок", time: "2 мин", desc: "Подробное описание шага." },
  { group: "Готовка", icon: "🔥", title: "Обжарь чеснок", time: "1 мин", desc: "Ещё одно описание." }
];

export default {
  badge: "🍝 Recipe Todo · 2 порции",          // pill above the title

  selectors: [
    {
      key: "size",                              // read in view(sel) as sel.size
      label: "Порция",                          // small-caps label above the picker (optional)
      default: "two",
      options: [
        { value: "two", label: "🍽️ 2 порции" },
        { value: "four", label: "🍽️🍽️ 4 порции" }
      ]
    }
  ],

  view(sel) {
    const big = sel.size === "four";
    return {
      // title: "Другой заголовок",             // optional h1 override (defaults to the manifest title)
      subtitle: "Одно-два предложения о блюде.",
      meta: [                                   // four small stat tiles under the title
        { value: big ? "4" : "2", label: "порции" },
        { value: "30 мин", label: "время" },
        { value: "650", label: "ккал / порция" },
        { value: "35 г", label: "белка / порция" }
      ],
      plate: { big: "🍝", floats: ["🧄", "🌿", "🍅", "🧀", "🌶️"] },   // one big emoji + up to five floating ones
      progressLabel: "Прогресс готовки",        // text next to the progress counter
      kickers: ["🍽️ Порция: " + (big ? "4" : "2")],                  // small bold lines at the top of the ingredients card
      intro: "Короткое описание выбранного варианта.",                 // paragraph under the kickers
      callouts: [                               // highlighted notes; tone "ok" = green, "accent" = theme color
        { tone: "accent", lead: "Совет: ", text: "текст заметки." }
      ],
      ingredientSections: [                     // any number of [name, amount] lists, each with a heading
        { heading: "Основное", items: ingredients }
      ],
      note: "Главная пропорция рецепта одной фразой.",                 // tinted paragraph after the ingredients
      macros: {                                 // two-column grid of value/label tiles (temperatures, calories...)
        heading: "Температуры",
        items: [
          { value: "180°C", label: "духовка" },
          { value: "10 мин", label: "отдых" }
        ]
      },
      variants: [                               // "what if" blocks: [bold lead, text]
        ["Без сливок: ", "замени сливки бульоном."]
      ],
      steps,                                    // the checklist
      tips: [                                   // three tips under the checklist: [bold lead, text]
        ["🔥 Огонь", "текст"],
        ["🧂 Соль", "текст"],
        ["⏱️ Время", "текст"]
      ],
      footer: "Название блюда · короткая подпись внизу страницы"
    };
  }
};
