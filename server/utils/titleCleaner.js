const knownPacks = [
  'material-icon-theme', 'material-symbols-light', 'material-symbols-rounded', 'material-symbols-sharp',
  'material-symbols-outlined', 'material-symbols', 'material-icons', 'material-design-extra', 'material-design-icons',
  'material-design', 'material-you', 'material', 'fluent-emoji-flat', 'fluent-emoji-high-contrast', 'fluent-emoji',
  'fluent-color', 'fluent-icons', 'fluent', 'akar-icons', 'ant-design-icons', 'ant-design', 'arcticons',
  'academicons', 'bootstrap-icons', 'bootstrap-extra', 'bootstrap', 'boxicons-extra', 'boxicons', 'css-gg-extra2',
  'css-gg-extra', 'css-gg', 'dripicons-extra', 'dripicons', 'flat-color-extra', 'flat-color-icons', 'flat-color',
  'fontawesome-extra', 'fontawesome6-extra', 'fontawesome6', 'fontawesome', 'font-awesome-6', 'font-awesome',
  'fa6-brands', 'fa7-brands', 'fa-brands', 'fa6-solid', 'fa-solid', 'fa6-regular', 'fa-regular', 'fa6', 'fa7', 'fa',
  'game-icons-extra', 'game-icons', 'graphics-extra', 'grommet-icons', 'grommet-extra', 'grommet', 'heroicons-extra',
  'heroicons2-extra', 'heroicons2', 'heroicons', 'icomoon-extra', 'icomoon', 'icon-park-outline', 'icon-park-solid',
  'icon-park-twotone', 'icon-park', 'ionicons-extra', 'ionicons5-extra', 'ionicons5', 'ionicons', 'line-awesome-extra',
  'line-awesome', 'line-md', 'lineicons', 'lucide-extra2', 'lucide-extra', 'lucide', 'openmoji', 'phosphor-extra',
  'phosphor-icons', 'phosphor', 'pixelarticons', 'radix-icons', 'radix-extra', 'radix', 'remix-extra', 'remix-icon',
  'remix', 'security-extra', 'simple-icons-extra', 'simple-icons', 'sl-icons-extra', 'sl-icons', 'svg-spinners',
  'tabler-icons', 'tabler-extra', 'tabler', 'teenyicons', 'tf-icons-extra', 'tf-icons', 'themify-extra',
  'themify', 'vscode-icons', 'vscode-extra', 'vscode', 'carbon-icons', 'carbon', 'feather-icons', 'feather',
  'devicon', 'octicons', 'octicon', 'emojione', 'twemoji', 'noto', 'weather-icons', 'weather', 'crypto-icons',
  'crypto', 'brand-icons', 'brand', 'brands', 'clarity', 'dashicons', 'entypo', 'ep', 'eos-icons', 'bubbles',
  'codex', 'streamline-interface', 'streamline-pixel', 'streamline', 'eva', 'evil', 'jam', 'zondicons', 'typicons',
  'system-uicons', 'solar', 'dinkie', 'cbi', 'cib', 'cif', 'cil', 'mdi', 'bx', 'bxs', 'bxl', 'bi', 'bs', 'ai',
  'ci', 'cg', 'di', 'fi', 'fc', 'gi', 'go', 'gr', 'hi', 'hi2', 'im', 'io', 'io5', 'lu', 'md', 'pi', 'ri', 'rx',
  'si', 'si2', 'tb', 'ti', 'vsc', 'wi'
];

const exactShortPrefixes = new Set([
  'ai', 'bi', 'bs', 'bx', 'bxs', 'bxl', 'ci', 'cg', 'di', 'fa', 'fa6', 'fa7', 'fi', 'fc', 'gi', 'go', 'gr',
  'hi', 'hi2', 'im', 'io', 'io5', 'lu', 'md', 'mdi', 'pi', 'ri', 'rx', 'si', 'si2', 'tb', 'ti', 'vsc', 'wi',
  'cil', 'cib', 'cif', 'cbi', 'dinkie', 'akar', 'antd', 'ant', 'hero', 'oct', 'fluent', 'solar', 'clarity',
  'codex', 'ep', 'eva', 'jam', 'carbon'
]);

const ACRONYM_MAP = {
  ai: 'AI',
  ui: 'UI',
  ux: 'UX',
  html: 'HTML',
  css: 'CSS',
  js: 'JS',
  ts: 'TS',
  php: 'PHP',
  sql: 'SQL',
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  ssd: 'SSD',
  hdd: 'HDD',
  usb: 'USB',
  wifi: 'WiFi',
  xml: 'XML',
  json: 'JSON',
  svg: 'SVG',
  png: 'PNG',
  jpg: 'JPG',
  pdf: 'PDF',
  api: 'API',
  url: 'URL',
  ip: 'IP',
  id: 'ID',
  qr: 'QR',
  gps: 'GPS',
  nfc: 'NFC',
  sms: 'SMS',
  rss: 'RSS',
  vpn: 'VPN',
  dns: 'DNS',
  ftp: 'FTP',
  tv: 'TV',
  pc: 'PC',
  vr: 'VR',
  ar: 'AR',
  '3d': '3D',
  '2d': '2D',
  ibm: 'IBM',
  tailwindcss: 'Tailwind CSS',
  github: 'GitHub',
  gitlab: 'GitLab',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  pinterest: 'Pinterest',
  snapchat: 'Snapchat',
  reddit: 'Reddit',
  discord: 'Discord',
  slack: 'Slack',
  telegram: 'Telegram',
  figma: 'Figma',
  wordpress: 'WordPress',
  vscode: 'VS Code',
  nextjs: 'Next.js',
  nodejs: 'Node.js',
  reactjs: 'React',
  vuejs: 'Vue',
};

function cleanIconTitle(filename) {
  if (!filename) return 'Icon';
  let name = pathBasename(filename).replace(/\.(svg|png)$/i, '');

  // 1. Remove initial system prefix like 'in_', 'is4_', 'is3_', 'is_'
  name = name.replace(/^(?:in|is[0-9]*|icon[0-9]*|svg)[_-]+/i, '');

  // 2. Remove known pack prefixes (repeating or single) in 4 passes
  for (let pass = 0; pass < 4; pass++) {
    for (const pack of knownPacks) {
      const reg = new RegExp('^' + pack + '[-_ ]+', 'i');
      name = name.replace(reg, '');
    }
  }

  // 3. Remove repeating word tokens at start (e.g. carbon-carbon-, lineicons-lineicons-)
  name = name.replace(/^([a-zA-Z0-9]+)[-_ ]+\1[-_ ]+/i, '$1-');
  for (const pack of knownPacks) {
    const reg = new RegExp('^' + pack + '[-_ ]+', 'i');
    name = name.replace(reg, '');
  }

  // 4. Clean exact short prefixes
  for (let pass = 0; pass < 2; pass++) {
    const shortMatch = name.match(/^([a-z0-9]{1,6})[-_ ]+/i);
    if (shortMatch && exactShortPrefixes.has(shortMatch[1].toLowerCase())) {
      name = name.slice(shortMatch[0].length);
    }
  }

  // 5. Handle camelCase / PascalCase names (e.g. AiFillAlert -> Alert, BsArrowRight -> Arrow Right, MdiCarWash -> Car Wash)
  name = name.replace(
    /^(?:Ai|Bi|Bs|Bx|Ci|Cg|Di|Fa|Fi|Fc|Gi|Go|Gr|Hi|Im|Io|Lu|Md|Mdi|Pi|Ri|Rx|Si|Tb|Ti|Vsc|Wi)(?:Fill|Filled|Outline|Outlined|Round|Rounded|Sharp|Twotone|Light|Bold|Duotone|Thin|Solid|Regular)?([A-Z0-9])/g,
    '$1'
  );

  // Split camelCase words
  name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  name = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Streamline taxonomy trimmer (e.g. text formatting text to speech 1 speech automated translate -> Text To Speech 1)
  if (/text-formatting-|interface-essential-/i.test(name)) {
    name = name.replace(/^(?:interface essential|text formatting)\s+/i, '');
    name = name.replace(/\s+(?:speech automated|language voice technology|interface essential).*$/i, '');
  }

  // Replace dashes & underscores with spaces
  name = name.replace(/[-_]+/g, ' ').trim();

  // 6. Clean leading style adjectives when followed by actual noun (e.g. "Solid Braille" -> "Braille", "Regular Eye" -> "Eye")
  name = name.replace(
    /^(?:Solid|Regular|Outline|Outlined|Filled|Sharp|Rounded|Round|Twotone|Two Tone|Duotone|Thin)\s+(?=[A-Za-z0-9])/i,
    ''
  );

  // Remove numeric size tokens like ' 20', ' 24', ' 16'
  name = name.replace(/\b(?:12|16|20|24|32|48|64)\b/g, '');

  // 7. Clean repeating library words at start
  name = name.replace(
    /^(?:Material Icon Theme|Material Symbols Light|Material Symbols|Material Icons|Material Design|Material You|Material|Arcticons|Akar Icons|Ant Design|Academicons|Carbon|Boxicons|Bootstrap Icons|Bootstrap|Feather|Lucide|Tabler Icons|Tabler|Remix Icon|Remix|Fontawesome|Font Awesome|Ionicons|Phosphor|Radix|Fluent|Codex|Clarity|Dashicons|Entypo|Openmoji|Lineicons)\s+/i,
    ''
  );

  // 8. Deduplicate adjacent identical words (e.g. "Microphone Microphone" -> "Microphone")
  name = name.replace(/\b(\w+)\s+\1\b/gi, '$1');

  // 9. Split into words and format with acronyms
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return 'Icon';
  }

  const formattedWords = words.map((w) => {
    const lower = w.toLowerCase();
    if (ACRONYM_MAP[lower]) {
      return ACRONYM_MAP[lower];
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  let cleanResult = formattedWords.join(' ');

  // Clean trailing or awkward single words if name is just "Outline" or "Filled"
  if (/^(?:Outline|Filled|Fill|Sharp|Rounded|Round|Light|Bold|Duotone|Solid|Regular)$/i.test(cleanResult)) {
    const origBase = pathBasename(filename).replace(/\.(svg|png)$/i, '').replace(/^(?:in|is[0-9]*)[_-]+/i, '');
    cleanResult = origBase.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return cleanResult.trim() || 'Icon';
}

function pathBasename(p) {
  return p.split(/[/\\]/).pop() || p;
}

module.exports = {
  cleanIconTitle,
  ACRONYM_MAP,
};
