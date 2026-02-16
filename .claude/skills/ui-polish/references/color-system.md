# Color System Reference

## Why AI Colors Fail

AI models default to bright, saturated palettes because they're "safe" and recognizable. The result is interfaces that look like children's software. Professional software uses muted, intentional color with saturation reserved for data and status.

## Building a Professional Palette

### Step 1: Choose a Base Hue

Pick ONE hue that represents the brand. Common professional choices:

- Deep green (finance, growth, health)
- Slate blue (enterprise, trust, productivity)
- Warm gray (neutral, sophisticated, content-focused)
- Deep teal (modern SaaS, developer tools)
- Indigo (creative tools, premium feel)

Avoid: bright blue, bright purple, bright orange as base colors.

### Step 2: Build the Neutral Scale

Derive your neutral gray from the base hue. A green-based app uses warm grays with a slight green undertone. A blue-based app uses cool grays.

Example CSS custom properties for a deep green base:

```css
--bg-primary: #0a0f0d; /* Deepest background */
--bg-secondary: #111916; /* Card/panel background */
--bg-tertiary: #1a2420; /* Elevated surfaces */
--bg-hover: #223029; /* Hover states */
--border-primary: #2a3830; /* Default borders */
--border-secondary: #354a40; /* Emphasized borders */
--text-primary: #e8ede9; /* Primary text */
--text-secondary: #8a9b91; /* Secondary text */
--text-tertiary: #5a6b62; /* Muted text */
```

### Step 3: Define Accent Colors

Use ONE accent color for interactive elements (links, buttons, active states). Derive it from the base hue but increase saturation and brightness.

```css
--accent-primary: #34d399; /* Primary actions */
--accent-hover: #6ee7b7; /* Hover state */
--accent-muted: #065f46; /* Subtle accent backgrounds */
```

### Step 4: Status Colors

These are universal and should be desaturated to fit the palette:

```css
--status-success: #34d399;
--status-warning: #fbbf24;
--status-error: #f87171;
--status-info: #60a5fa;
```

### Step 5: Data Visualization Colors

This is the ONLY place bright, varied colors belong. Use a carefully selected set of 4-6 colors that are distinguishable and harmonious:

```css
--chart-1: #34d399; /* Primary data color */
--chart-2: #60a5fa; /* Secondary */
--chart-3: #fbbf24; /* Tertiary */
--chart-4: #f87171; /* Quaternary */
--chart-5: #a78bfa; /* Quinary */
```

## Color Application Rules

1. **Backgrounds**: Always neutral. Never colored. Never gradient
2. **Text**: High contrast against background. Two levels max (primary + secondary)
3. **Borders**: Subtle. Derived from the neutral scale. Never colored
4. **Icons**: Monochrome or muted. Match text-secondary color. Never bright
5. **Buttons**: Primary action gets accent color. All others are ghost/outline
6. **Charts & data**: The only place for multiple vivid colors
7. **Status indicators**: Small, contextual. Dot or chip with desaturated color
8. **Hover states**: Slight background shift. Never color change

## Light Theme Adaptation

For light themes, invert the neutral scale but keep accents similar:

```css
--bg-primary: #ffffff;
--bg-secondary: #f8faf9;
--bg-tertiary: #f0f4f2;
--bg-hover: #e8ede9;
--border-primary: #d1d9d5;
--border-secondary: #b8c4bd;
--text-primary: #111916;
--text-secondary: #5a6b62;
--text-tertiary: #8a9b91;
```

## Anti-Patterns to Avoid

- Rainbow sidebar icons
- Bright colored card backgrounds
- Gradient buttons (unless extremely subtle and intentional)
- Different colors for each section of the app
- Using color as the only differentiator (always pair with shape/position/label)
- Pure black (#000000) backgrounds. Use deep near-blacks with a color undertone
- Pure white (#ffffff) text on dark backgrounds. Use off-whites like #e8ede9
