const KNOWN_PREFIXES = [
  // Multi-word
  'sharp color streamline sharp color', 'plump color streamline plump color', 'ultimate color streamline ultimate color',
  'sharp streamline sharp', 'streamline sharp', 'streamline plump', 'streamline ultimate', 'streamline',
  'pepicons pencil pepicons pencil', 'pepicons pop pepicons pop', 'pop pepicons pop', 'pepicons pencil', 'pepicons pop', 'pepicons',
  'material symbols light', 'material symbols outlined', 'material symbols rounded', 'material symbols sharp', 'material symbols', 'material icons', 'material icon',
  'fluent emoji high contrast', 'fluent emoji', 'fluent color', 'fluent mdl2', 'fluent ui', 'fluent',
  'flat color icons', 'flat color icon', 'flat color', 'flat ui', 'flat',
  'simple line icons', 'simple icons', 'skill icons',
  'heroicons outline', 'heroicons solid', 'heroicons mini', 'heroicons micro', 'heroicons',
  'dinkie icons', 'game icons', 'healthicons', 'vscode icons', 'weather icons',
  'at icons', 'lets icons', 'eos icons', 'evil icons', 'akar icons', 'ant design',
  'font awesome', 'icon park', 'gravity ui', 'system uicons', 'line md',
  'emojione monotone', 'emojione v1', 'emojione',
  'fa6 solid', 'fa6 regular', 'fa6 brands', 'fa solid', 'fa regular', 'fa brands',
  'sidekickicons', 'sidekick icons', 'nimbus', 'bubbles',

  // Single word
  'iconify', 'lsicon', 'svgicon', 'mynaui', 'stash', 'griddy', 'mdl2', 'selfhst', 'tdesign',
  'fxemoji', 'pinhead', 'temaki', 'roentgen', 'guidance', 'clarity', 'coreui',
  'dashicons', 'devicons', 'devicon', 'dripicons', 'entypo', 'fontisto', 'foundation',
  'geist', 'gridicons', 'humbleicons', 'iconamoon', 'iconoir', 'icons8', 'ikons',
  'ionicons', 'lineicons', 'lucide', 'majesticons', 'octicons', 'octicon', 'openmoji',
  'pajamas', 'pixelarticons', 'teenyicons', 'twemoji', 'typicons', 'zondicons', 'grommet',
  'icomoon', 'si-glyph', 'picon', 'lets', 'basil', 'boxicons', 'carbon', 'circum',
  'feather', 'tabler', 'arcticons', 'emojis', 'famicons', 'flowbite', 'glyphs', 'glyph',
  'hugeicons', 'codicons', 'codicon', 'mingcute', 'remix', 'solar', 'noto', 'logos',

  // Short codes
  'f7', 'ic', 'ph', 'ix', 'fa7', 'fa6', 'fa', 'uil', 'uis', 'uit', 'uiw',
  'unjs', 'vaadin', 'v1', 'v2', 'whh', 'wi', 'wpf', 'prime', 'akar', 'eos',
  'eva', 'evil', 'geo', 'ion', 'jam', 'mage', 'maki', 'mdi2', 'mdi', 'oui',
  'radix', 'ri', 'si', 'la', 'lia', 'bx', 'bxs', 'bxl'
];

KNOWN_PREFIXES.sort((a, b) => b.length - a.length);

const prefixRegexes = KNOWN_PREFIXES.map(p => {
  const esc = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`^${esc}(?:[\\s_:-]+|$)`, 'i');
});

const LEADING_STYLE_WORDS = [
  'round', 'rounded', 'outline', 'outlined', 'sharp', 'solid', 'filled', 'twotone', 'two tone', 'flat', 'pop'
];
const leadingStyleRegexes = LEADING_STYLE_WORDS.map(s => {
  return new RegExp(`^${s}[\\s_-]+`, 'i');
});

const TRAILING_STYLE_WORDS = [
  'outline sharp', 'outline rounded', 'rounded sharp', 'outline light', 'outline loop',
  'alt filled', 'alt outline', 'circle solid', 'circle outline', 'circle filled',
  'square solid', 'square outline', 'box outline', 'box solid', 'shape fill', 'shape solid',
  'tall outline', 'filled', 'outline', 'outlined', 'solid', 'sharp',
  'rounded', 'round', 'light', 'regular', 'bold', 'thin', 'flat',
  'two tone', 'twotone', 'duotone', 'small', 'medium dark', 'medium', 'dark',
  'alt 1', 'alt 2', 'alt 3', 'alt'
];
TRAILING_STYLE_WORDS.sort((a, b) => b.length - a.length);
const trailingStyleRegexes = TRAILING_STYLE_WORDS.map(s => {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`[\\s_-]+${esc}$`, 'i');
});

export function cleanIconTitle(title) {
  if (!title || typeof title !== 'string') return title || '';
  let c = title.trim();

  // 1. Remove embedded '-in-...' strings
  c = c.replace(/-?in-[a-z0-9_-]+/gi, ' ');

  // 2. Strip import prefixes like Is1, Is2, Is3, Is4, In1, In2
  c = c.replace(/^(?:is\d*|in\d*)[\s_-]+/i, '');

  // 3. Repeatedly strip matching library prefixes
  let changed = true;
  let loops = 0;
  while (changed && loops < 10) {
    loops++;
    changed = false;
    for (const r of prefixRegexes) {
      if (r.test(c)) {
        const next = c.replace(r, '').trim();
        if (next.length > 1) {
          c = next;
          changed = true;
        }
      }
    }
  }

  // 4. Strip leading generic words: 'Color ', 'Colour ', 'Icons ', 'Icon ', 'A ', 'An '
  c = c.replace(/^(?:color|colour|icons|icon|a|an)[\s_-]+(?=[a-z0-9])/i, '');

  // Strip leading style word if followed by substantial name (e.g. 'Outline Keyboard' -> 'Keyboard')
  for (const lr of leadingStyleRegexes) {
    if (lr.test(c)) {
      const next = c.replace(lr, '').trim();
      if (next.length > 2) {
        c = next;
        break;
      }
    }
  }

  // 5. Strip trailing pixel indicators like ' 24px', ' 16px', ' 32px'
  c = c.replace(/[\s_-]+\d+px$/i, '');

  // 6. Strip trailing style words
  changed = true;
  loops = 0;
  while (changed && loops < 5) {
    loops++;
    changed = false;
    for (const tr of trailingStyleRegexes) {
      if (tr.test(c)) {
        const next = c.replace(tr, '').trim();
        if (next.length > 1) {
          c = next;
          changed = true;
        }
      }
    }
  }

  // 7. Strip trailing stand-alone resolution numbers like ' 16', ' 20', ' 24', ' 32', ' 48', ' 64'
  c = c.replace(/[\s_-]+(16|20|24|32|48|64|128)$/i, '');

  // 8. Deduplicate identical adjacent words (e.g. 'Streamline Streamline' or 'Pepicons Pepicons' or 'Bicycle Bike')
  const words = c.split(/[\s_-]+/).filter(Boolean);
  const dedupped = [];
  for (let i = 0; i < words.length; i++) {
    const curr = words[i].toLowerCase();
    const prev = dedupped.length > 0 ? dedupped[dedupped.length - 1].toLowerCase() : '';
    if (curr === prev) continue;
    if ((curr === 'bike' && prev === 'bicycle') || (curr === 'bicycle' && prev === 'bike')) continue;
    dedupped.push(words[i]);
  }

  if (dedupped.length > 0) {
    c = dedupped.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return c || title;
}
