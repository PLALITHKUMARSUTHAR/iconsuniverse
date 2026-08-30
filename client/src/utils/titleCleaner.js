const SOURCE_PREFIXES = [
  // Multi-word library names & styles
  'material symbols light', 'material symbols outlined', 'material symbols rounded', 'material symbols sharp', 'material symbols', 'material icons', 'material icon',
  'flat color icons', 'flat color icon', 'flat color', 'flat ui',
  'cryptocurrency color', 'cryptocurrency', 'crypto icons',
  'ant design', 'akar icons', 'eos icons', 'evil icons', 'font awesome',
  'fa solid', 'fa regular', 'fa brands', 'fa6 solid', 'fa6 regular', 'fa6 brands', 'fa7 solid', 'fa7 regular', 'fa7 brands',
  'heroicons outline', 'heroicons solid', 'heroicons mini', 'heroicons micro', 'heroicons',
  'line md', 'radix icons', 'remix icon', 'simple icons', 'skill icons',
  'system uicons', 'system-uicons', 'vscode icons', 'weather icons',
  'emojione monotone', 'emojione v1', 'emojione',

  // Single-word library names & abbreviations
  'famicons', 'flowbite', 'glyphs', 'glyph', 'hugeicons', 'codicons', 'codicon',
  'healthicons', 'mynaui', 'stash', 'griddy', 'mdl2', 'selfhst', 'tdesign',
  'fxemoji', 'pinhead', 'temaki', 'roentgen', 'guidance', 'pepicons',
  'mingcute', 'fluent', 'tabler', 'feather', 'boxicons', 'carbon', 'circum',
  'clarity', 'coreui', 'dashicons', 'devicons', 'devicon', 'dripicons',
  'entypo', 'fontisto', 'foundation', 'geist', 'gridicons', 'humbleicons',
  'iconamoon', 'iconoir', 'icons8', 'ikons', 'ionicons', 'lineicons',
  'lucide', 'majesticons', 'monotone', 'octicons', 'octicon', 'openmoji',
  'pajamas', 'pixelarticons', 'simpleline', 'streamline',
  'teenyicons', 'twemoji', 'typicons', 'zondicons', 'grommet', 'icomoon',
  'si-glyph', 'picon', 'lets',

  // Short codes (only match when followed by space or delimiter)
  'f7', 'ic', 'ph', 'ix', 'fa7', 'fa6', 'fa', 'uil', 'uis', 'uit', 'uiw',
  'unjs', 'vaadin', 'v1', 'v2', 'whh', 'wi', 'wpf', 'prime', 'akar', 'eos',
  'eva', 'evil', 'geo', 'ion', 'jam', 'mage', 'maki', 'mdi', 'oui', 'radix',
  'remix', 'ri', 'solar', 'noto', 'si', 'la', 'lia'
];

// Sort prefixes by length descending so multi-word / longer prefixes match first
SOURCE_PREFIXES.sort((a, b) => b.length - a.length);

// Build regex list
const prefixRegexList = SOURCE_PREFIXES.map(p => {
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`^${escaped}(?:[\\s_:-]+|$)`, 'i');
});

export function cleanIconTitle(title) {
  if (!title || typeof title !== 'string') return title || '';
  let cleaned = title.trim();

  // Repeatedly strip matching prefixes (e.g. "V1 Emojione Monotone Goblin" -> "Goblin")
  let changed = true;
  while (changed) {
    changed = false;
    for (const regex of prefixRegexList) {
      if (regex.test(cleaned)) {
        const next = cleaned.replace(regex, '').trim();
        if (next.length > 0) {
          cleaned = next;
          changed = true;
        }
      }
    }
  }

  // Capitalize each word properly
  if (cleaned.length > 0) {
    cleaned = cleaned
      .split(/[\s_-]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return cleaned || title;
}
