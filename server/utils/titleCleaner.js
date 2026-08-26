const knownPacks = [
  'material-symbols-light', 'material-symbols', 'material-icons', 'material-design-extra', 'material-design',
  'akar-icons', 'ant-design', 'arcticons', 'academicons', 'bootstrap-extra', 'boxicons-extra',
  'css-gg-extra2', 'css-gg-extra', 'css-gg', 'dripicons-extra', 'dripicons', 'flat-color-extra', 'flat-color',
  'fontawesome-extra', 'fontawesome6-extra', 'fontawesome6', 'fontawesome', 'font-awesome', 'game-icons-extra',
  'game-icons', 'graphics-extra', 'grommet-extra', 'grommet', 'heroicons-extra', 'heroicons2-extra',
  'heroicons2', 'heroicons', 'icomoon-extra', 'icomoon', 'ionicons-extra', 'ionicons5-extra', 'ionicons5',
  'ionicons', 'line-awesome-extra', 'line-awesome', 'lineicons', 'lucide-extra2', 'lucide-extra',
  'lucide', 'phosphor-extra', 'phosphor', 'radix-extra', 'radix', 'remix-extra', 'remix',
  'security-extra', 'simple-icons-extra', 'simple-icons', 'sl-icons-extra', 'sl-icons', 'tabler-extra',
  'tabler', 'tf-icons-extra', 'tf-icons', 'themify-extra', 'themify', 'vscode-extra', 'vscode',
  'carbon', 'boxicons', 'bootstrap', 'feather', 'devicon', 'octicons', 'fluent',
  'emojione', 'twemoji', 'noto', 'weather', 'crypto', 'brand', 'brands'
];

const exactShortPrefixes = new Set([
  'ai', 'bi', 'bs', 'bx', 'bxs', 'bxl', 'ci', 'cg', 'di', 'fa', 'fa6', 'fi', 'fc', 'gi', 'go', 'gr',
  'hi', 'hi2', 'im', 'io', 'io5', 'lu', 'md', 'pi', 'ri', 'rx', 'si', 'si2', 'tb', 'ti', 'vsc', 'wi',
  'cil', 'cib', 'cif', 'cbi', 'dinkie', 'akar', 'antd', 'ant', 'hero', 'oct'
]);

function cleanIconTitle(filename) {
  if (!filename) return 'Icon';
  let name = pathBasename(filename).replace(/\.(svg|png)$/i, '');
  
  // 1. Remove initial 'in_' or 'in-' prefix
  name = name.replace(/^in[_-]+/i, '');

  // 2. Remove known pack prefixes (repeating or single)
  for (const pack of knownPacks) {
    const reg = new RegExp('^' + pack + '[-_]+(?:' + pack + '[-_]+)*', 'i');
    name = name.replace(reg, '');
  }

  // 3. Remove exact short prefixes if present (e.g. bi-bi-, ai-, fa-, etc.)
  const shortMatch = name.match(/^([a-z0-9]{1,6})[-_]+(?:\1[-_]+)?/i);
  if (shortMatch && exactShortPrefixes.has(shortMatch[1].toLowerCase())) {
    name = name.slice(shortMatch[0].length);
  }

  // 4. Handle camelCase / PascalCase names (e.g. AiFillAlert -> Alert, BsArrowRight -> Arrow Right)
  name = name.replace(/^(?:Ai|Bi|Bs|Bx|Ci|Cg|Di|Fa|Fi|Fc|Gi|Go|Gr|Hi|Im|Io|Lu|Md|Pi|Ri|Rx|Si|Tb|Ti|Vsc|Wi)(?:Fill|Outline|Round|Sharp|Twotone|Light|Bold|Duotone|Thin)?([A-Z])/g, '$1');
  
  // Split camelCase words
  name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  name = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Replace dashes, underscores with spaces
  name = name.replace(/[-_]+/g, ' ').trim();

  // 5. Capitalize all words
  name = name.replace(/\b\w/g, c => c.toUpperCase());

  // Clean common word artifacts if still present at start
  name = name.replace(/^(?:Arcticons|Akar Icons|Ant Design|Academicons|Carbon|Boxicons|Bootstrap|Feather|Lucide|Tabler|Remix|Fontawesome|Ionicons|Material Symbols|Material Icons|Phosphor|Radix)\s+/i, '');

  return name.trim() || pathBasename(filename).replace(/\.(svg|png)$/i, '');
}

function pathBasename(p) {
  return p.split(/[/\\]/).pop() || p;
}

module.exports = {
  cleanIconTitle,
};
