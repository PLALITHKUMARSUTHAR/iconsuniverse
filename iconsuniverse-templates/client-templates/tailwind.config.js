import tokens from '../tokens.json' assert { type: 'json' };

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        landing: tokens.landing.colors,
        subpage: tokens.subpage.colors,
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Sora', 'Inter', 'sans-serif'],
        bodyAlt: ['Inter', 'sans-serif'], // used on subpage theme for body copy
      },
      borderRadius: {
        sm: tokens.landing.rounded.sm,
        DEFAULT: tokens.landing.rounded.DEFAULT,
        md: tokens.landing.rounded.md,
        lg: tokens.landing.rounded.lg,
        xl: tokens.landing.rounded.xl,
        full: tokens.landing.rounded.full,
      },
      spacing: {
        'gutter-landing': tokens.landing.spacing.gutter,
        'gutter-subpage': tokens.subpage.spacing.gutter,
        'section-lg': tokens.landing.spacing['section-gap-lg'],
        'section-md': tokens.landing.spacing['section-gap-md'],
        'section-subpage': tokens.subpage.spacing['section-gap'],
      },
      maxWidth: {
        container: tokens.landing.spacing['container-max'],
      },
      backgroundImage: {
        'energy-gradient': tokens.landing.colors['energy-gradient'],
        'tech-gradient': tokens.landing.colors['tech-gradient'],
        'primary-gradient': tokens.subpage.colors['primary-gradient'],
        'accent-gradient': tokens.subpage.colors['accent-gradient'],
      },
    },
  },
  plugins: [],
};
