---
name: Premium Glass & Geometry
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf6'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d3e3ff'
  on-surface: '#0b1c30'
  on-surface-variant: '#434653'
  inverse-surface: '#213146'
  inverse-on-surface: '#ebf1ff'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#2559bd'
  primary: '#00327d'
  on-primary: '#ffffff'
  primary-container: '#0047ab'
  on-primary-container: '#a5bdff'
  inverse-primary: '#b1c5ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#003a56'
  on-tertiary: '#ffffff'
  tertiary-container: '#005277'
  on-tertiary-container: '#71c6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419e'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e3ff'
  surface-glass: rgba(255, 255, 255, 0.7)
  glass-border: rgba(255, 255, 255, 0.4)
  primary-gradient: 'linear-gradient(135deg, #0047AB 0%, #6366f1 100%)'
  accent-gradient: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
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
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 48px
  container-max: 1440px
  section-gap: 80px
---

## Brand & Style

The design system evolves into a **Premium Aesthetic** narrative, moving from corporate utility to a sophisticated, high-end digital experience. The brand personality is modern, optimistic, and effortlessly high-tech, targeting professional designers and developers who value craftsmanship.

The visual style is a fusion of **Glassmorphism** and **Modern Minimalism**. It relies on translucent layers, ultra-soft shadows, and wide-aperture spacing to create a sense of breathability. By introducing subtle gradients and generous roundedness, the UI feels less like a tool and more like a curated gallery. The emotional response should be one of "effortless quality"—where the interface feels light, responsive, and physically layered.

## Colors

The palette is anchored by a deep **Royal Blue** primary, now enhanced with secondary and tertiary accents to support vibrant gradients. These gradients should be applied sparingly to primary actions and decorative accents to evoke a premium "tech" feel.

The background shifts to a very subtle cool tint to make the white glass containers "pop." Use the `surface-glass` token for card backgrounds, applying a backdrop-filter (blur) to create depth. Secondary colors like the Indigo and Sky Blue are used for progress indicators, active states, and interactive highlights, ensuring the system feels dynamic rather than static.

## Typography

This design system utilizes **Sora** for headlines to convey geometric precision and **Inter** for body text to ensure maximum utility. 

To achieve the premium look, headlines use tighter letter-spacing and increased line heights. Display sizes have been slightly enlarged to command attention on larger viewports. Labels and buttons always use a higher font weight (SemiBold or Bold) to differentiate them from static body text. When using Sora for titles, keep the casing "Sentence case" to maintain a modern, friendly tone.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with expanded boundaries. The max-width container is increased to 1440px to accommodate larger icon displays and premium whitespace.

- **Grid:** 12-column system on desktop, 8-column on tablet, and 4-column on mobile.
- **Rhythm:** An 8px base unit drives all dimensions. Use generous internal padding within cards (min 32px) to prevent the "cramped" look of legacy systems.
- **Sectioning:** Vertical gaps between major content sections are intentionally large (80px+) to allow the glassmorphic layers to feel distinct and floating within the viewport.

## Elevation & Depth

Elevation is achieved through **Glassmorphism** and **Ambient Shadows** rather than standard tonal shifts.

1.  **The Base:** The page background is a subtle, solid color.
2.  **The Glass Layer:** Primary containers (cards, modals) use `surface-glass` with a 12px backdrop-blur and a 1px `glass-border` for edge definition.
3.  **The Shadow:** Use a multi-layered, ultra-soft shadow to simulate natural light.
    - *Floating Elements:* `0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)`
    - *Interactive Hover:* Elevation should increase on hover, with the shadow becoming more diffused and the background blur slightly intensifying.

## Shapes

The design system adopts a **Pill-shaped (Round 3)** logic to create a soft, approachable, and modern aesthetic. 

Every interactive element—buttons, search bars, and tags—must use the full corner radius (pill shape). Structural containers, such as icon preview cards or content blocks, use a minimum of 2rem (32px) radius. This "super-rounded" approach breaks the traditional corporate grid and makes the UI feel more like a tactile, physical object. Avoid sharp corners entirely to maintain the premium, modern-tech visual language.

## Components

- **Buttons:** Use the `primary-gradient` for main actions with a slight inner glow. All buttons are pill-shaped. On hover, apply a subtle scale-up effect (1.02x).
- **Cards:** Glassmorphic containers with 32px rounded corners. Include a very thin white border (10% opacity) to catch "specular" highlights.
- **Input Fields:** Search bars and text inputs use a subtle inset shadow to appear recessed into the glass layer. Use pill-shaped ends and 16px horizontal padding.
- **Chips & Tags:** Use `accent-gradient` at low opacity (10-15%) for the background with high-contrast text for a "frosted" colored look.
- **Icon Display:** Icons should be centered in a square aspect-ratio container with a soft secondary gradient background when active.
- **Modals:** Center-screen with a heavy backdrop-blur (20px+) on the page behind it, emphasizing the "Premium Glass" narrative.