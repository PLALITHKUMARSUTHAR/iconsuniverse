---
name: Vibrant Glass & Energy
colors:
  surface: '#faf8ff'
  surface-dim: '#dad9e0'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3fa'
  surface-container: '#eeedf4'
  surface-container-high: '#e8e7ee'
  surface-container-highest: '#e2e2e9'
  on-surface: '#1a1b20'
  on-surface-variant: '#434651'
  inverse-surface: '#2f3036'
  inverse-on-surface: '#f1f0f7'
  outline: '#747782'
  outline-variant: '#c4c6d3'
  surface-tint: '#395ca7'
  primary: '#001e52'
  on-primary: '#ffffff'
  primary-container: '#00327d'
  on-primary-container: '#7d9eee'
  inverse-primary: '#b1c5ff'
  secondary: '#b32822'
  on-secondary: '#ffffff'
  secondary-container: '#fd5d50'
  on-secondary-container: '#600004'
  tertiary: '#411100'
  on-tertiary: '#ffffff'
  tertiary-container: '#651f00'
  on-tertiary-container: '#eb845c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#1d438e'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#910a0e'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#7b2f0d'
  background: '#faf8ff'
  on-background: '#1a1b20'
  surface-variant: '#e2e2e9'
  vibrant-coral: '#FF5F52'
  sunny-yellow: '#FFD54F'
  electric-teal: '#00F5D4'
  surface-glass: rgba(255, 255, 255, 0.6)
  glass-border: rgba(255, 255, 255, 0.4)
  energy-gradient: 'linear-gradient(135deg, #FF5F52 0%, #FFD54F 100%)'
  tech-gradient: 'linear-gradient(135deg, #00327D 0%, #00F5D4 100%)'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 32px
  section-gap-lg: 120px
  section-gap-md: 80px
  padding-card: 40px
---

## Brand & Style

The design system shifts from a restrained corporate aesthetic to an **Energetic & Playful Premium** experience. It targets a modern audience that seeks a balance between professional capability and creative inspiration. The brand personality is outgoing, optimistic, and high-contrast, yet retains an air of craftsmanship through sophisticated glass effects.

The design style is a hybrid of **Glassmorphism** and **High-Contrast Modernism**. It leverages the translucency of glass to provide depth and premium quality, but injects "energy" through a vibrant, high-saturation accent palette. The goal is to evoke a sense of digital "joy" while maintaining the clarity of a high-end productivity tool. Whitespace is used aggressively to create a breathable, "airy" environment that prevents the bold colors from becoming overwhelming.

## Colors

The palette is anchored by a **Deep Navy** base which provides professional grounding and high-contrast readability. To introduce playfulness, three "Energy Accents" are introduced: **Vibrant Coral**, **Sunny Yellow**, and **Electric Teal**. 

- **Primary (Navy):** Used for core navigation, typography, and foundational containers.
- **Secondary (Coral):** The hero accent color for primary actions and high-visibility status indicators.
- **Surface:** The background is intentionally kept at a very bright, nearly-white blue (#F8F9FF) to allow glass containers to feel light and airy.
- **Gradients:** Use the `energy-gradient` for marketing moments and the `tech-gradient` for interactive highlights. All gradients should be applied with high saturation to maintain the "energetic" feel.

## Typography

This system uses **Sora** exclusively to maintain a cohesive, geometric, and modern identity. By removing the secondary typeface, the system gains a more distinct and "branded" personality. 

To achieve the "playful" directive, we utilize extreme weight variations. Headlines use **ExtraBold (800)** and **Bold (700)** to command attention with a heavy, punchy feel. Body text remains at **Regular (400)** for legibility, while labels and micro-copy use **ExtraBold (800)** at small sizes to create a "sticker" or "badge" effect. Headlines should utilize tighter tracking (letter-spacing) to feel more like a singular graphic unit rather than just text.

## Layout & Spacing

The layout is a **Fluid Grid** that prioritizes extreme whitespace to maintain an "airy" feel. 

- **Grid:** A standard 12-column grid on desktop, but with wider 32px gutters to separate glass containers.
- **Rhythm:** Spacing follows an 8px scale. To enhance the "fun" and "less serious" vibe, vertical section gaps have been increased to 120px, forcing the user to focus on one content piece at a time.
- **Internal Padding:** Large containers like cards and modals should never feel crowded. Use a minimum of 40px padding for desktop cards to allow the background glass blur to feel impactful.

## Elevation & Depth

Hierarchy is established through **Active Glass Layers** and **Vibrant Shadows**.

1.  **Glass Containers:** Use `surface-glass` with a heavy 24px backdrop-blur. The `glass-border` should be a bright, semi-transparent white to create a "specular highlight" on the edges.
2.  **Shadows:** Instead of neutral grays, shadows are slightly tinted with the Primary Navy or Vibrant Coral depending on the element.
    - *Floating Glass:* `0 24px 48px rgba(0, 50, 125, 0.08)` — subtle but deep.
    - *Energy Elements:* Elements using Coral or Teal should have a matching "glow" shadow (e.g., `0 12px 24px rgba(255, 95, 82, 0.3)`).
3.  **Depth Layers:** Use no more than three layers of depth: Background, Surface Container, and Overlay (Modals/Popovers).

## Shapes

The design system uses a **Pill-shaped (3)** geometry to maximize friendliness and energy. 

All interactive elements (buttons, inputs, chips) must use the `rounded-full` token. Large structural containers, such as dashboard cards and content sections, use `rounded-3xl` (3rem) to create a soft, "squishy" appearance that breaks away from traditional rigid digital grids. Sharp corners are strictly prohibited.

## Components

- **Buttons:** All buttons are pill-shaped. Primary buttons use the `energy-gradient` with a subtle scale-up effect (1.05x) and a vibrant colored shadow on hover.
- **Input Fields:** Use a pill-shaped stroke with a 2px width. When focused, the stroke should transition to the `electric-teal` with a soft outer glow.
- **Cards:** Use the glassmorphic style with 48px (3rem) corner radius. Cards should feel like floating panes of frosted glass.
- **Chips & Tags:** Use `label-sm` (ExtraBold) typography. Backgrounds should be high-saturation accents (Coral, Teal, Yellow) at 15% opacity with 100% opacity text.
- **Checkboxes & Radios:** These should be oversized and use the `energy-gradient` when selected to feel more tactile and playful.
- **Progress Bars:** Use thick, pill-shaped tracks with the `electric-teal` for the filler to represent "active energy."
- **Navigation:** Top-level navigation items should use a subtle pill-shaped glass highlight on hover rather than a simple color change.