# Dashboard & Data Page Patterns

## KPI Cards

The #1 AI mistake: KPI cards that are just a big number and a label, repeated across multiple pages.

### Professional KPI Pattern

Each KPI card should contain:

- The metric value (largest text)
- A delta/change indicator (up/down with percentage)
- A micro-chart (sparkline or small area chart showing trend)
- Compact date range context

Example structure:

```
┌─────────────────────────┐
│ Total Clicks            │
│ 12,847      ▲ 12.3%     │
│ ▁▂▃▂▄▅▆▅▇█             │
│ vs last 30 days         │
└─────────────────────────┘
```

### KPI Layout Rules

- Show 3-5 KPIs maximum per view
- Each KPI appears in exactly ONE place in the entire app
- Use a single row layout, not a grid
- Sparklines add massive value with minimal space

## Data Tables & Card Lists

### Card Design

AI makes cards too busy by showing every action and tag. Apply progressive disclosure:

- Primary info: Title/name, key metric (visible always)
- Secondary info: Date, status icon, category icon (visible but compact)
- Tertiary info: Full action set (hidden in triple-dot menu)

### Table Enrichment

AI tables are usually bare. Add information density:

- Inline status dots (small colored circles, not full chips)
- Secondary text below primary cell content (smaller, muted)
- Icon indicators for boolean states (instead of text "Yes"/"No")
- Compact relative dates ("2h ago" not "February 16, 2026 at 2:30 PM")

## Chart Selection Guide

Stop using bar charts for everything. Choose based on data type:

| Data Story               | Best Chart Type                    |
| ------------------------ | ---------------------------------- |
| Trend over time          | Area chart or line chart           |
| Proportions of whole     | Donut chart (not pie)              |
| Geographic distribution  | Choropleth map with shaded regions |
| Comparison of categories | Horizontal bar chart               |
| Distribution/spread      | Histogram or box plot              |
| Correlation              | Scatter plot                       |
| Part-to-whole over time  | Stacked area chart                 |
| Single metric progress   | Progress bar or gauge              |

### Chart Styling Rules

- Remove unnecessary gridlines (keep horizontal only, very faint)
- Remove chart borders
- Use the data visualization color palette from color-system.md
- Add tooltips on hover with formatted data
- Include a clear, concise title
- Labels directly on the chart beat separate legends

## Analytics Pages

### Structure

```
┌──────────────────────────────────────┐
│ Date range picker    [Export] [Filter]│
├──────────────────────────────────────┤
│ KPI │ KPI │ KPI │ KPI               │
├──────────────────────────────────────┤
│                                      │
│    Primary chart (area/line)         │
│    with toggle for split view        │
│                                      │
├────────────────────┬─────────────────┤
│                    │                 │
│  Map or secondary  │  Data table     │
│  visualization     │  with details   │
│                    │                 │
└────────────────────┴─────────────────┘
```

### Key Features to Include

- Toggle to split data by individual items (links, products, etc.)
- Date range comparison (this period vs previous)
- Export functionality
- Filter by category/tag/status

## Sidebar Navigation

### AI Sidebar Anti-Patterns

- Too many top-level links
- Stats/counts displayed in the sidebar
- Gradient avatar circles
- Settings, billing, usage all as separate sidebar items

### Professional Sidebar Pattern

- Compact left-aligned navigation
- Group related items (collapse settings/billing/usage into one section)
- Use an account card at the bottom with a popover for account actions
- Icon + label, with option to collapse to icon-only
- Active state: subtle background highlight, not bold color change
- Tighten vertical spacing between items
