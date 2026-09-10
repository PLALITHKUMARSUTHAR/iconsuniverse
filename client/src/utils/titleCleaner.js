const KNOWN_PREFIXES = [
  // Repeated / Multi-word variants
  'token branded token branded', 'token branded', 'token',
  'memory box light', 'memory box',
  'vs code icons file type light', 'vs code icons file type', 'vs code icons',
  'vscode icons file type light', 'vscode icons file type', 'vscode icons',
  'streamline plump color streamline plump color', 'streamline plump color',
  'streamline ultimate color streamline ultimate color', 'streamline ultimate streamline ultimate',
  'ultimate streamline ultimate', 'ultimate streamline',
  'streamline ultimate color', 'streamline ultimate',
  'sharp color streamline sharp color', 'streamline sharp color', 'streamline sharp',
  'streamline freehand', 'streamline plump', 'streamline light', 'streamline regular', 'streamline bold', 'streamline',
  'pepicons pencil pepicons pencil', 'pepicons pop pepicons pop', 'pop pepicons pop', 'pepicons pencil', 'pepicons pop', 'pepicons',
  'material symbols light', 'material symbols outlined', 'material symbols rounded', 'material symbols sharp', 'material symbols', 'material icons', 'material icon',
  'fluent emoji high contrast', 'fluent emoji', 'fluent color', 'fluent mdl2', 'fluent ui', 'fluent fluent', 'fluent',
  'flat color icons', 'flat color icon', 'flat color', 'flat ui', 'flat',
  'simple line icons', 'simple icons', 'skill icons',
  'heroicons outline', 'heroicons solid', 'heroicons mini', 'heroicons micro', 'heroicons',
  'dinkie icons dinkie icons', 'dinkie icons', 'game icons', 'healthicons', 'weather icons',
  'at icons', 'lets icons', 'eos icons', 'evil icons', 'akar icons', 'ant design',
  'font awesome', 'icon park solid', 'icon park', 'gravity ui', 'system uicons', 'line md',
  'emojione monotone', 'emojione v1', 'emojione',
  'fa6 solid', 'fa6 regular', 'fa6 brands', 'fa solid', 'fa regular', 'fa brands',
  'sidekickicons', 'sidekick icons', 'nimbus', 'bubbles',
  'griddy icons', 'griddy', 'pixelarticons', 'pixel art icons',
  'emoji high contrast',

  // Single word libraries
  'iconify', 'lsicon', 'svgicon', 'mynaui', 'stash', 'mdl2', 'selfhst selfhst', 'selfhst', 'tdesign',
  'fxemoji', 'pinhead', 'temaki', 'roentgen', 'guidance', 'clarity', 'coreui',
  'dashicons', 'devicons', 'devicon', 'dripicons', 'entypo', 'fontisto', 'foundation',
  'geist', 'gridicons', 'humbleicons', 'iconamoon', 'iconoir', 'icons8 icons8', 'icons8', 'ikons',
  'ionicons', 'lineicons', 'lucide', 'majesticons', 'octicons', 'octicon', 'openmoji',
  'pajamas', 'teenyicons', 'twemoji', 'typicons', 'zondicons', 'grommet',
  'icomoon', 'si-glyph', 'picon', 'lets', 'basil', 'boxicons', 'carbon carbon', 'carbon', 'circum',
  'feather', 'tabler', 'arcticons', 'emojis', 'famicons', 'flowbite', 'glyphs', 'glyph',
  'hugeicons', 'codicons', 'codicon', 'mingcute', 'remix', 'solar solar', 'solar', 'noto v1', 'noto', 'logos',
  'garden', 'mit',

  // Short codes
  'f7', 'ic', 'ph', 'ix', 'fa7', 'fa6', 'fa', 'uil', 'uis', 'uit', 'uiw',
  'unjs', 'vaadin', 'v1', 'v2', 'whh', 'wi', 'wpf', 'prime', 'akar', 'eos',
  'eva', 'evil', 'geo', 'ion', 'jam', 'mage', 'maki', 'mdi2', 'mdi', 'oui',
  'radix', 'ri', 'si', 'la', 'lia', 'bx', 'bxs', 'bxl', 'bi', 'tb', 'pi'
];

KNOWN_PREFIXES.sort((a, b) => b.length - a.length);

const prefixRegexes = KNOWN_PREFIXES.map(p => {
  const esc = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`^${esc}(?:[\\s_:-]+|$)`, 'i');
});

const LEADING_STYLE_WORDS = [
  'round', 'rounded', 'outline', 'outlined', 'sharp', 'solid', 'filled',
  'twotone', 'two tone', 'duotone', 'flat', 'pop',
  'logo', 'logos', 'brand', 'brands', 'baseline',
  'ultimate color', 'ultimate', 'color', 'colour', 'freehand'
];
const leadingStyleRegexes = LEADING_STYLE_WORDS.map(s => {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`^${esc}[\\s_-]+`, 'i');
});

const TRAILING_STYLE_WORDS = [
  // Compound size + style
  '24 filled', '24 regular', '24 outline', '24 solid', '24px filled', '24px regular',
  '20 filled', '20 regular', '20 outline', '20 solid', '20px filled', '20px regular',
  '16 filled', '16 regular', '16 outline', '16 solid', '16px filled', '16px regular',
  '48 filled', '48 regular', '48 outline', '48 solid', '48px filled', '48px regular',
  '32 filled', '32 regular', '32 outline', '32 solid', '32px filled', '32px regular',
  '12 filled', '12 regular', '12 outline', '12 solid', '12px filled', '12px regular',
  'fill 12', 'fill 16', 'fill 20', 'fill 24', 'fill 32', 'fill 48',

  // Compound styles
  'outline sharp', 'outline rounded', 'rounded sharp', 'outline light', 'outline loop',
  'alt filled', 'alt outline', 'circle solid', 'circle outline', 'circle filled',
  'square solid', 'square outline', 'box outline', 'box solid', 'shape fill', 'shape solid',
  'tall outline', 'filled', 'outline', 'outlined', 'solid', 'sharp',
  'rounded', 'round', 'light', 'regular', 'bold', 'thin', 'flat',
  'two tone', 'twotone', 'duotone', 'small', 'medium dark', 'medium', 'dark',
  'alt 1', 'alt 2', 'alt 3', 'alt',
  'fill', 'line', 'pop', 'loop', 'icon', 'icons'
];
TRAILING_STYLE_WORDS.sort((a, b) => b.length - a.length);
const trailingStyleRegexes = TRAILING_STYLE_WORDS.map(s => {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s_-]+');
  return new RegExp(`[\\s_-]+${esc}$`, 'i');
});

export function cleanIconTitle(title) {
  if (!title || typeof title !== 'string') return title || '';
  let c = title.trim();

  // Strip path directory if present (e.g. 'Transport/in_akar...svg')
  if (c.includes('/') || c.includes('\\')) {
    c = c.split(/[\/\\]/).pop();
  }

  // Strip .svg extension if present
  c = c.replace(/\.svg$/i, '');

  // If slug-like with dashes or underscores, convert to spaces
  if (c.includes('-') || c.includes('_')) {
    c = c.replace(/[_-]+/g, ' ');
  }

  // 1. Remove embedded '-in-...' strings and trim
  c = c.replace(/\b(?:is\d*|in\d*)[\s_-]+/gi, ' ').trim();

  // 2. Strip import prefixes at start: Is1, Is2, Is3, Is4, In1, In2, etc.
  c = c.replace(/^(?:is\d*|in\d*)[\s_-]+/i, '').trim();

  // 3. Repeatedly strip matching library prefixes
  let changed = true;
  let loops = 0;
  while (changed && loops < 12) {
    loops++;
    changed = false;
    for (const r of prefixRegexes) {
      if (r.test(c)) {
        const next = c.replace(r, '').trim();
        if (next.length >= 1) {
          c = next;
          changed = true;
        }
      }
    }
  }

  // 4. Strip leading style / noise words
  changed = true;
  loops = 0;
  while (changed && loops < 6) {
    loops++;
    changed = false;
    for (const lr of leadingStyleRegexes) {
      if (lr.test(c)) {
        const next = c.replace(lr, '').trim();
        if (next.length >= 2) {
          c = next;
          changed = true;
        }
      }
    }
  }

  // Strip leading generic words: 'Color ', 'Colour ', 'Icons ', 'Icon ', 'A ', 'An ', 'Logo ', 'Brand '
  c = c.replace(/^(?:color|colour|icons|icon|a|an|logo|logos|brand|brands)[\s_-]+(?=[a-z0-9])/i, '');

  // 5. Strip trailing pixel indicators like ' 24px', ' 16px', ' 32px'
  c = c.replace(/[\s_-]+\d+px$/i, '');

  // 6. Strip trailing style words
  changed = true;
  loops = 0;
  while (changed && loops < 6) {
    loops++;
    changed = false;
    for (const tr of trailingStyleRegexes) {
      if (tr.test(c)) {
        // Protect compound nouns ending with 'Light' (Traffic Light, Spot Light, Night Light, etc.)
        if (/[\s_-]+light$/i.test(c)) {
          if (/\b(?:traffic|spot|night|flash|brake|tail|dome|flood|ceiling|warning|indicator|street|head|neon)[\s_-]+light$/i.test(c)) {
            continue;
          }
        }
        const next = c.replace(tr, '').trim();
        if (next.length >= 2) {
          c = next;
          changed = true;
        }
      }
    }
  }

  // 7. Strip trailing stand-alone resolution numbers like ' 12', ' 16', ' 20', ' 24', ' 32', ' 48', ' 64'
  c = c.replace(/[\s_-]+(12|16|20|24|32|48|64|128)$/i, '');

  // 8. Strip trailing single letter ' O' (e.g. 'Envelope Open O' -> 'Envelope Open')
  c = c.replace(/[\s_-]+[oO]$/, '');

  // 9. Deduplicate identical adjacent words (e.g. 'Streamline Streamline' or 'Solar Solar' or 'Pepicons Pepicons')
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
    c = dedupped.map(w => {
      // Special acronyms uppercase
      if (['hdmi', 'usb', 'cpu', 'ram', 'api', 'ui', 'ux', 'ai', 'vr', 'ar', 'os', 'tv', 'id', 'ip', 'qr', 'url', 'sms', 'sim', 'gps', 'pin'].includes(w.toLowerCase())) {
        return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  // Final fallback safeguard: if stripped down to empty or single character, return original clean
  if (!c || c.trim().length <= 1) {
    let fallback = title.replace(/\.svg$/i, '').replace(/[_-]+/g, ' ').trim();
    if (fallback.includes('/') || fallback.includes('\\')) {
      fallback = fallback.split(/[\/\\]/).pop();
    }
    return fallback || title;
  }

  return c;
}

export const SOURCE_PREFIXES = KNOWN_PREFIXES;
