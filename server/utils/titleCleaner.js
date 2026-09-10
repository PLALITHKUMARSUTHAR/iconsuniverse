const SOURCE_PREFIXES = [
  // Multi-word library names & styles
  'material symbols light', 'material symbols outlined', 'material symbols rounded', 'material symbols sharp', 'material symbols', 'material icons', 'material icon',
  'flat color icons', 'flat color icon', 'flat color', 'flat ui', 'flat',
  'fluent color', 'fluent emoji', 'fluent ui', 'fluent',
  'emojione monotone', 'emojione v1', 'emojione',
  'cryptocurrency color', 'cryptocurrency', 'crypto icons',
  'ant design', 'akar icons', 'eos icons', 'evil icons', 'font awesome',
  'fa solid', 'fa regular', 'fa brands', 'fa6 solid', 'fa6 regular', 'fa6 brands', 'fa7 solid', 'fa7 regular', 'fa7 brands',
  'heroicons outline', 'heroicons solid', 'heroicons mini', 'heroicons micro', 'heroicons',
  'line md', 'radix icons', 'remix icon', 'simple icons', 'skill icons',
  'system uicons', 'system-uicons', 'vscode icons', 'weather icons',
  'sidekickicons', 'sidekick icons', 'simple line icons', 'at icons', 'nimbus', 'bubbles',

  // Single-word library names
  'famicons', 'flowbite', 'glyphs', 'glyph', 'hugeicons', 'codicons', 'codicon',
  'healthicons', 'mynaui', 'stash', 'griddy', 'mdl2', 'selfhst', 'tdesign',
  'fxemoji', 'pinhead', 'temaki', 'roentgen', 'guidance', 'pepicons',
  'mingcute', 'tabler', 'feather', 'boxicons', 'carbon', 'circum',
  'clarity', 'coreui', 'dashicons', 'devicons', 'devicon', 'dripicons',
  'entypo', 'fontisto', 'foundation', 'geist', 'gridicons', 'humbleicons',
  'iconamoon', 'iconoir', 'icons8', 'ikons', 'ionicons', 'lineicons',
  'lucide', 'majesticons', 'monotone', 'octicons', 'octicon', 'openmoji',
  'pajamas', 'pixelarticons', 'simpleline', 'streamline',
  'teenyicons', 'twemoji', 'typicons', 'zondicons', 'grommet', 'icomoon',
  'si-glyph', 'picon', 'lets', 'basil', 'bxs', 'bxl', 'bx', 'emojis', 'arcticons',

  // Short codes
  'f7', 'ic', 'ph', 'ix', 'fa7', 'fa6', 'fa', 'uil', 'uis', 'uit', 'uiw',
  'unjs', 'vaadin', 'v1', 'v2', 'whh', 'wi', 'wpf', 'prime', 'akar', 'eos',
  'eva', 'evil', 'geo', 'ion', 'jam', 'mage', 'maki', 'mdi', 'oui', 'radix',
  'remix', 'ri', 'solar', 'noto', 'si', 'la', 'lia'
];

SOURCE_PREFIXES.sort((a, b) => b.length - a.length);

const prefixRegexList = SOURCE_PREFIXES.map(p => {
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`^${escaped}(?:[\\s_:-]+|$)`, 'i');
});

const STYLE_SUFFIXES = [
  'outline sharp', 'outline rounded', 'rounded sharp', 'outline light',
  'alt filled', 'alt outline', 'circle solid', 'circle outline',
  'square solid', 'square outline', 'box outline', 'box solid',
  'tall outline', 'filled', 'outline', 'outlined', 'solid', 'sharp',
  'rounded', 'round', 'light', 'regular', 'bold', 'thin',
  'two tone', 'twotone', 'duotone', 'alt 1', 'alt 2', 'alt 3', 'alt'
];

STYLE_SUFFIXES.sort((a, b) => b.length - a.length);

const suffixRegexList = STYLE_SUFFIXES.map(s => {
  const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`[\\s_-]+${escaped}$`, 'i');
});

function cleanIconTitle(title) {
  if (!title || typeof title !== 'string') return title || '';
  let cleaned = title.trim();

  // 1. Remove embedded library strings like "-in-material-symbols-light-"
  cleaned = cleaned.replace(/-?in-[a-z0-9_-]+/gi, ' ');

  // 2. Remove import code prefixes like "Is3", "Is2", "Is", "In3", "In"
  cleaned = cleaned.replace(/^(?:is\d*|in\d*)[\s_-]+/i, '');

  // 3. Repeatedly strip matching library prefixes
  let changed = true;
  while (changed) {
    changed = false;
    for (const regex of prefixRegexList) {
      if (regex.test(cleaned)) {
        const next = cleaned.replace(regex, '').trim();
        if (next.length > 1) {
          cleaned = next;
          changed = true;
        }
      }
    }
  }

  // 4. Strip leading 'Color ' or 'Colour ' if followed by other words (e.g. 'Color Bicycle' -> 'Bicycle')
  cleaned = cleaned.replace(/^(?:color|colour)[\s_-]+(?=[a-z0-9])/i, '');

  // 5. Strip leading article 'A ' or 'An ' (e.g. 'A High Speed Train' -> 'High Speed Train')
  cleaned = cleaned.replace(/^(?:a|an)[\s_-]+(?=[a-z0-9])/i, '');

  // 6. Strip trailing style suffixes (e.g. "Outline Sharp", "Filled", "Solid", "Alt")
  changed = true;
  while (changed) {
    changed = false;
    for (const regex of suffixRegexList) {
      if (regex.test(cleaned)) {
        const next = cleaned.replace(regex, '').trim();
        if (next.length > 1) {
          cleaned = next;
          changed = true;
        }
      }
    }
  }

  // 7. Strip trailing dimension/variant numbers (e.g. ' 16', ' 24', ' 20', ' 28', ' 48', ' 01')
  cleaned = cleaned.replace(/[\s_-]+[0-9]{1,3}$/, '');

  // 8. Deduplicate redundant adjacent words (e.g. 'Bicycle Bike' -> 'Bicycle')
  const words = cleaned.split(/[\s_-]+/).filter(Boolean);
  const dedupped = [];
  for (let i = 0; i < words.length; i++) {
    const curr = words[i].toLowerCase();
    const prev = dedupped.length > 0 ? dedupped[dedupped.length - 1].toLowerCase() : '';
    if ((curr === 'bike' && prev === 'bicycle') || (curr === 'bicycle' && prev === 'bike')) continue;
    if ((curr === 'flat' && prev === 'planet')) continue;
    if (curr === prev) continue;
    dedupped.push(words[i]);
  }

  if (dedupped.length > 0) {
    cleaned = dedupped
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return cleaned || title;
}

module.exports = { cleanIconTitle, SOURCE_PREFIXES };
