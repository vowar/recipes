// Color theme presets. A theme is 11 base colors (hex); each key is a CSS custom property name without "--".
// The runtime (assets/app.js) sets --<key> and a derived --<key>-rgb triplet on <html>
// (e.g. --accent-rgb: 217,168,95) so the stylesheet can use rgba(var(--accent-rgb), .24).
//
// New theme: copy an object, change the colors, add it to the export and reference it in recipes/index.js.

const gold = {
  "accent": "#d9a85f",      // main accent: card borders, active buttons, progress bar
  "accent-3": "#ffe2aa",    // light accent: values, h3 headings, labels
  "accent-dark": "#7c5428", // dark accent: gradient starts
  "tint-a": "#dca76b",      // extra glow for the page background and the emoji "plate"
  "tint-b": "#c9a96b",      // second glow
  "bg": "#0f0f0d",          // page background
  "bg-deep": "#0b0b09",     // darkest point of the background gradient
  "panel": "#191813",       // card background
  "text": "#fffaf0",        // main text
  "muted": "#cfc5b1",       // secondary text
  "on-accent": "#2c1b0d"    // text on top of the accent color (active tab, checkmark)
};

// Steak: the gold palette with beef/wine glows.
const wine = { ...gold, "tint-a": "#a84d3e", "tint-b": "#8e4a53" };

// Tom yum: coral theme.
const chili = {
  "accent": "#ff6f4f",
  "accent-3": "#ffd18b",
  "accent-dark": "#9e3429",
  "tint-a": "#ff8a00",
  "tint-b": "#ff3f36",
  "bg": "#111017",
  "bg-deep": "#0e0c12",
  "panel": "#1c1a22",
  "text": "#fff4ed",
  "muted": "#c2b2ad",
  "on-accent": "#281112"
};

export default { gold, wine, chili };
