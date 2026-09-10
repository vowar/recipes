// Recipe manifest: the single registration point. One entry per recipe.
// Only what the home page needs to draw a card (without loading the recipe itself);
// the page content lives in the module that is loaded lazily via load().
//
//   slug        - page address (#/<slug>) and file name recipes/<slug>.js (ASCII kebab-case)
//   emoji       - big emoji on the card
//   title       - card title and the recipe page h1
//   description - one or two sentences for the card
//   theme       - a preset from assets/themes.js (or { ...themes.gold, "accent": "#..." })
//   load        - lazy import of the recipe module

import themes from "../assets/themes.js";

export default [
  {
    slug: "steak",
    emoji: "🥩",
    title: "Стейк с butter basting + два steakhouse-соуса",
    description: "Рибай ~3 см на нержавейке с butter basting до уверенной medium и два соуса на том же fond: Red Wine или Peppercorn Cream.",
    theme: themes.wine,
    load: () => import("./steak.js")
  },
  {
    slug: "chicken-pan-sauces",
    emoji: "🍗",
    title: "Куриная грудка + три pan sauce",
    description: "Dijon Cream, White Wine & Butter или Black Pepper Cream; с basting или без; на одну или две грудки.",
    theme: themes.gold,
    load: () => import("./chicken-pan-sauces.js")
  },
  {
    slug: "tom-yum-pasta",
    emoji: "🍜",
    title: "Паста «Том-ям» с креветками",
    description: "Fettuccine в сливочном том-ям соусе с креветками, черри и Džiugas. Версия с шампиньонами или только с эноки.",
    theme: themes.chili,
    load: () => import("./tom-yum-pasta.js")
  }
];
