// GymLog Mobile - Appearance & Theme Customization Engine

const THEME_PRESETS = {
  zinc:     { name: 'Zinc',       dark: true,  bg: '#09090b', surface: '#141417', surface2: '#1c1c21', offset: '#25252c', border: 'rgba(255, 255, 255, 0.08)', text: '#f4f4f5', muted: '#9ca3af', faint: '#4b5563' },
  oled:     { name: 'OLED Black', dark: true,  bg: '#000000', surface: '#0a0a0a', surface2: '#141414', offset: '#1c1c1c', border: 'rgba(255, 255, 255, 0.08)', text: '#f5f5f5', muted: '#8a8a8a', faint: '#3f3f3f' },
  midnight: { name: 'Midnight',   dark: true,  bg: '#0b1020', surface: '#111831', surface2: '#18213f', offset: '#202a4d', border: 'rgba(148, 163, 255, 0.12)', text: '#e6e9f5', muted: '#8b93b5', faint: '#3d4566' },
  slate:    { name: 'Slate',      dark: true,  bg: '#0f172a', surface: '#1e293b', surface2: '#273449', offset: '#334155', border: 'rgba(255, 255, 255, 0.08)', text: '#f1f5f9', muted: '#94a3b8', faint: '#475569' },
  forest:   { name: 'Forest',     dark: true,  bg: '#0b120e', surface: '#111b15', surface2: '#17241c', offset: '#1f2f25', border: 'rgba(255, 255, 255, 0.08)', text: '#ecf3ee', muted: '#86998c', faint: '#3a4a40' },
  mocha:    { name: 'Mocha',      dark: true,  bg: '#14110f', surface: '#1c1815', surface2: '#25201c', offset: '#2f2924', border: 'rgba(255, 240, 220, 0.08)', text: '#f3ece4', muted: '#a09283', faint: '#4d443b' },
  light:    { name: 'Light',      dark: false, bg: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9', offset: '#e2e8f0', border: 'rgba(0, 0, 0, 0.08)', text: '#0f172a', muted: '#64748b', faint: '#94a3b8' },
  paper:    { name: 'Paper',      dark: false, bg: '#faf7f2', surface: '#fffdf9', surface2: '#f3eee6', offset: '#e9e2d6', border: 'rgba(60, 40, 20, 0.12)', text: '#2a2420', muted: '#6b6055', faint: '#b3a898' }
};

const ACCENT_PRESETS = [
  { name: 'Green', hex: '#4ade80' }, { name: 'Lime', hex: '#a3e635' }, { name: 'Cyan', hex: '#22d3ee' },
  { name: 'Blue', hex: '#60a5fa' }, { name: 'Indigo', hex: '#818cf8' }, { name: 'Violet', hex: '#a78bfa' },
  { name: 'Pink', hex: '#f472b6' }, { name: 'Red', hex: '#f87171' }, { name: 'Orange', hex: '#fb923c' },
  { name: 'Amber', hex: '#fbbf24' }
];

const SPLIT_COLOR_DEFAULTS = {
  push: '#f97316', pull: '#60a5fa', legs: '#a78bfa', upper: '#fbbf24',
  lower: '#2dd4bf', abs: '#f472b6', arms: '#84cc16', rest: '#6b7280'
};

const RADIUS_PRESETS = {
  sharp:   { name: 'Sharp',   sm: '4px',  md: '6px',  lg: '10px' },
  default: { name: 'Default', sm: '8px',  md: '12px', lg: '18px' },
  rounded: { name: 'Round',   sm: '12px', md: '18px', lg: '26px' }
};

const TEXT_SIZE_PRESETS = {
  small:   { name: 'S', size: '14px' },
  default: { name: 'M', size: '16px' },
  large:   { name: 'L', size: '18px' }
};

const DEFAULT_APPEARANCE = {
  mode: 'dark', darkTheme: 'zinc', lightTheme: 'light', accent: '#4ade80',
  radius: 'default', textSize: 'default', reduceMotion: false, splitColors: {}
};

function normalizeAppearance(raw, legacyTheme) {
  const a = { ...DEFAULT_APPEARANCE, ...(raw && typeof raw === 'object' ? raw : {}) };
  if (!raw && legacyTheme === 'light') a.mode = 'light';
  if (!THEME_PRESETS[a.darkTheme] || !THEME_PRESETS[a.darkTheme].dark) a.darkTheme = DEFAULT_APPEARANCE.darkTheme;
  if (!THEME_PRESETS[a.lightTheme] || THEME_PRESETS[a.lightTheme].dark) a.lightTheme = DEFAULT_APPEARANCE.lightTheme;
  if (a.mode !== 'light') a.mode = 'dark';
  if (!/^#[0-9a-f]{6}$/i.test(a.accent)) a.accent = DEFAULT_APPEARANCE.accent;
  if (!RADIUS_PRESETS[a.radius]) a.radius = 'default';
  if (!TEXT_SIZE_PRESETS[a.textSize]) a.textSize = 'default';
  a.reduceMotion = !!a.reduceMotion;
  const splits = {};
  Object.keys(SPLIT_COLOR_DEFAULTS).forEach(k => {
    const v = a.splitColors && a.splitColors[k];
    if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) splits[k] = v;
  });
  a.splitColors = splits;
  return a;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shadeHex(hex, amount) {
  // amount < 0 darkens, > 0 lightens (fraction 0..1)
  const [r, g, b] = hexToRgb(hex).map(c => {
    const target = amount < 0 ? 0 : 255;
    return Math.round(c + (target - c) * Math.abs(amount));
  });
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Chart.js draws to canvas and can't read CSS variables, so resolve them at render time
function getThemeColor(varName, fallback) {
  const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
  return v || fallback;
}

function isDarkAppearance() {
  const a = appState.appearance || DEFAULT_APPEARANCE;
  return a.mode !== 'light';
}

function applyAppearance() {
  const a = appState.appearance = normalizeAppearance(appState.appearance, appState.theme);
  const theme = THEME_PRESETS[a.mode === 'light' ? a.lightTheme : a.darkTheme];
  const style = document.body.style;

  appState.theme = a.mode; // keep legacy field in sync
  document.body.classList.toggle('light-theme', !theme.dark);

  style.setProperty('--bg', theme.bg);
  style.setProperty('--surface', theme.surface);
  style.setProperty('--surface-2', theme.surface2);
  style.setProperty('--surface-offset', theme.offset);
  style.setProperty('--border', theme.border);
  style.setProperty('--text', theme.text);
  style.setProperty('--text-muted', theme.muted);
  style.setProperty('--text-faint', theme.faint);

  // Default green is too bright on light backgrounds; use the original deeper green there
  const accent = (!theme.dark && a.accent === DEFAULT_APPEARANCE.accent) ? '#16a34a' : a.accent;
  const rgb = hexToRgb(accent).join(', ');
  style.setProperty('--primary', accent);
  style.setProperty('--primary-hover', shadeHex(accent, -0.15));
  style.setProperty('--primary-rgb', rgb);
  style.setProperty('--primary-glow', `rgba(${rgb}, ${theme.dark ? 0.25 : 0.2})`);
  style.setProperty('--border-focus', `rgba(${rgb}, ${theme.dark ? 0.5 : 0.4})`);
  style.setProperty('--on-primary', relativeLuminance(accent) > 0.4 ? '#000000' : '#ffffff');

  Object.keys(SPLIT_COLOR_DEFAULTS).forEach(k => {
    const color = a.splitColors[k] || SPLIT_COLOR_DEFAULTS[k];
    style.setProperty(`--workout-${k}`, color);
    style.setProperty(`--on-workout-${k}`, relativeLuminance(color) > 0.4 ? '#000000' : '#ffffff');
  });

  const radius = RADIUS_PRESETS[a.radius];
  style.setProperty('--radius-sm', radius.sm);
  style.setProperty('--radius-md', radius.md);
  style.setProperty('--radius-lg', radius.lg);
  document.documentElement.style.fontSize = TEXT_SIZE_PRESETS[a.textSize].size;
  document.body.classList.toggle('reduce-motion', a.reduceMotion);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme.bg);

  renderAppearanceSettings();
}

function renderAppearanceSettings() {
  const a = appState.appearance;
  const themeGrid = document.getElementById('appearance-theme-grid');
  if (!themeGrid || !a) return;

  themeGrid.innerHTML = Object.entries(THEME_PRESETS).map(([key, t]) => {
    const isActive = key === (a.mode === 'light' ? a.lightTheme : a.darkTheme);
    return `
      <button type="button" class="theme-card ${isActive ? 'active' : ''}" onclick="setAppearanceTheme('${key}')">
        <div class="theme-card-preview" style="background:${t.bg};">
          <span style="width:40%; height:100%; background:${t.surface};"></span>
          <span style="width:22%; height:60%; background:${t.offset};"></span>
          <span style="width:14%; height:35%; background:${a.accent};"></span>
        </div>
        <div class="theme-card-name">${t.name}</div>
        <div class="theme-card-mode">${t.dark ? 'Dark' : 'Light'}</div>
      </button>`;
  }).join('');

  const accentRow = document.getElementById('appearance-accent-row');
  const accentLower = a.accent.toLowerCase();
  const isPreset = ACCENT_PRESETS.some(p => p.hex === accentLower);
  accentRow.innerHTML = ACCENT_PRESETS.map(p => `
    <button type="button" class="color-swatch ${p.hex === accentLower ? 'active' : ''}" style="background:${p.hex};" aria-label="${p.name} accent" onclick="setAppearanceOption('accent', '${p.hex}')"></button>
  `).join('') + `
    <label class="custom-color-wrap ${isPreset ? '' : 'active'}" style="${isPreset ? '' : `background:${a.accent};`}" aria-label="Custom accent colour">
      ${isPreset ? '+' : ''}
      <input type="color" value="${a.accent}" onchange="setAppearanceOption('accent', this.value)">
    </label>`;

  const splitGrid = document.getElementById('appearance-split-grid');
  splitGrid.innerHTML = Object.keys(SPLIT_COLOR_DEFAULTS).map(k => `
    <label class="split-color-item">
      <input type="color" value="${a.splitColors[k] || SPLIT_COLOR_DEFAULTS[k]}" onchange="setSplitColor('${k}', this.value)" aria-label="${SPLIT_CONFIG[k].label} colour">
      <span style="flex:1;">${SPLIT_CONFIG[k].label}</span>
      ${a.splitColors[k] ? `<button type="button" class="split-reset-btn" aria-label="Reset ${SPLIT_CONFIG[k].label} colour" onclick="event.preventDefault(); setSplitColor('${k}', null)">↺</button>` : ''}
    </label>
  `).join('');

  const renderSeg = (id, presets, current, option) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = Object.entries(presets).map(([key, p]) =>
      `<button type="button" class="${key === current ? 'active' : ''}" onclick="setAppearanceOption('${option}', '${key}')">${p.name}</button>`
    ).join('');
  };
  renderSeg('appearance-radius-seg', RADIUS_PRESETS, a.radius, 'radius');
  renderSeg('appearance-textsize-seg', TEXT_SIZE_PRESETS, a.textSize, 'textSize');

  const motionEl = document.getElementById('appearance-reduce-motion');
  if (motionEl) motionEl.checked = a.reduceMotion;
}

function setAppearanceTheme(key) {
  const t = THEME_PRESETS[key];
  if (!t) return;
  triggerHaptic('light');
  if (t.dark) appState.appearance.darkTheme = key; else appState.appearance.lightTheme = key;
  appState.appearance.mode = t.dark ? 'dark' : 'light';
  applyAppearance();
  saveState();
}

function setAppearanceOption(option, value) {
  triggerHaptic('light');
  appState.appearance[option] = value;
  applyAppearance();
  saveState();
}

function setSplitColor(split, hex) {
  if (hex) appState.appearance.splitColors[split] = hex;
  else delete appState.appearance.splitColors[split];
  applyAppearance();
  saveState();
}

function resetAppearance() {
  triggerHaptic('medium');
  appState.appearance = { ...DEFAULT_APPEARANCE, splitColors: {} };
  applyAppearance();
  saveState();
  showToast('Appearance reset to defaults', 'success');
}
