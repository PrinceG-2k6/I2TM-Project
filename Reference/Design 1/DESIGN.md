---
name: Adaptive Signal Intelligence System
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae0'
  surface-container-high: '#fce3d9'
  surface-container-highest: '#f6ded3'
  on-surface: '#251913'
  on-surface-variant: '#584237'
  inverse-surface: '#3c2d26'
  inverse-on-surface: '#ffede6'
  outline: '#8c7164'
  outline-variant: '#e0c0b1'
  surface-tint: '#9d4300'
  primary: '#9d4300'
  on-primary: '#ffffff'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#ffb690'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006398'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a2f4'
  on-tertiary-container: '#003554'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#cde5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d32'
  on-tertiary-fixed-variant: '#004b74'
  background: '#fff8f6'
  on-background: '#251913'
  surface-variant: '#f6ded3'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  card-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The brand personality is **composed, analytical, and vigilant**. This design system balances technical sophistication with a human-centric warmth, moving away from the cold aesthetics of traditional cyber-intelligence. The target audience includes SREs, DevOps engineers, and data analysts who require high-density information without cognitive fatigue.

The visual style is a **Modern SaaS/Corporate** hybrid with **Tactile** influences. It utilizes a soft, off-white base to reduce eye strain, punctuated by high-energy accents that signal activity and urgency. Depth is achieved through subtle layering rather than aggressive shadows, creating an interface that feels like a physical, premium workspace.

## Colors
The palette is anchored by a warm cream background (`#FFF8F0`) that provides a more organic feel than pure white or clinical grey. 

- **Primary Orange:** Used exclusively for primary actions, active navigation states, and critical signal paths.
- **Dark Charcoal:** Provides high-contrast legibility for text and heavy structural elements like sidebars.
- **Operational Status:** These follow standard semantic conventions but are calibrated for maximum vibrancy against the cream backdrop to ensure immediate recognition of system health.
- **Neutral Steps:** Use the `neutral_muted` and `neutral_border` tones for card strokes and secondary backgrounds to maintain the warm temperature of the UI.

## Typography
The system uses **Outfit** for headlines to provide a modern, geometric character that feels approachable yet precise. **Inter** is utilized for body and data-heavy content due to its exceptional legibility at small sizes and its neutral, systematic feel.

- **Data Tables:** Use `body-md` or `mono-data` (Inter with tight tracking) for telemetry and logs.
- **Hierarchy:** Maintain a clear distinction by using the uppercase `label-md` for section headers and small metadata tags.
- **Weights:** Reserve 600+ weights for headlines; use 400 for standard reading and 500 for emphasized technical values.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a max-width container of 1440px for dashboard views. 

- **Sidebar:** A fixed-width (260px) left navigation bar in Charcoal (`#1F1F1F`) creates a strong vertical anchor.
- **Grid:** Use a 12-column grid for desktop with 24px gutters. Elements should snap to these columns to maintain rigorous alignment.
- **Density:** While the aesthetic is "clean," dashboard widgets should utilize a medium density, using the 4px base unit to scale margins (e.g., 8px, 16px, 24px).
- **Responsive:** On mobile, the 12-column grid collapses to a single column, and card-padding reduces to 16px to maximize screen real estate.

## Elevation & Depth
Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Canvas):** The warm cream background.
- **Level 1 (Cards):** White surfaces with a subtle 1px border (`#E5DED5`). This creates a "lifted" feel without needing heavy shadows.
- **Level 2 (Dropdowns/Modals):** These use a soft ambient shadow (10% opacity Charcoal, 12px blur, 4px Y-offset) to denote temporary interaction layers.
- **Interactions:** Hover states on interactive cards should transition the border color to the Primary Orange at 30% opacity or slightly darken the background tone.

## Shapes
The shape language is defined by **Rounded** geometry. 

- **Dashboard Cards:** Use a generous `20px` radius (scaling between 18px and 24px depending on context) to create the signature "calm" SaaS look.
- **Functional Elements:** Buttons and Input fields use a more conservative `8px` radius to maintain a professional, technical edge and ensure they don't look "toy-like."
- **Status Pills:** Use a full pill-shape (100px) for status indicators (Healthy, Warning, etc.) to differentiate them from functional buttons.

## Components
- **Buttons:** Primary buttons use the Orange accent with white text. Secondary buttons use a Charcoal outline or ghost style.
- **Cards:** The core of the dashboard. Every card must have a 1px soft border and the defined `card_radius`. Headers within cards should be separated by a light horizontal rule.
- **Inputs:** Fields use a white background with the `neutral_border` and `body-md` text. Focus states should use a 2px Orange halo.
- **Status Chips:** Small, pill-shaped markers. For "Healthy," use a light green background with dark green text; for "Critical," use the Red accent.
- **Navigation:** The left sidebar uses high-contrast icons (Charcoal background, white icons) with an Orange vertical "active" indicator strip on the far left of the active menu item.
- **Data Visualizations:** Charts should utilize the primary Orange for the main data series, with the Status colors (Green/Amber/Red) reserved for threshold indicators.