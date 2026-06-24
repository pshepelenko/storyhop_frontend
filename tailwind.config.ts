import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "sh-background": "var(--sh-background)",
        "sh-surface": "var(--sh-surface)",
        "sh-foreground": "var(--sh-foreground)",
        "sh-muted": "var(--sh-muted)",
        "sh-border": "var(--sh-border)",
        "sh-mint": "var(--sh-mint)",
        "sh-mint-dark": "var(--sh-mint-dark)",
        "sh-coral": "var(--sh-coral)",
        "sh-sky": "var(--sh-sky)",
        "sh-amber": "var(--sh-amber)",
        "sh-lavender": "var(--sh-lavender)",
        "sh-green": "var(--sh-green)",
        "sh-green-soft": "var(--sh-green-soft)",
        "sh-forest": "var(--sh-forest)",
        "sh-forest-soft": "var(--sh-forest-soft)",
        "sh-forest-dark": "var(--sh-forest-dark)",
      },
      maxWidth: {
        "sh-home": "var(--sh-max-width-home)",
      },
      borderRadius: {
        sh: 'var(--sh-radius)',
        'sh-lg': 'var(--sh-radius-lg)',
        'sh-sm': 'var(--sh-radius-sm)',
      },
    },
  },
  plugins: [],
} satisfies Config;
