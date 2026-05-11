import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        gesso: '#F5F5F7',
        ink: '#1D1D1F',
        midnight: '#001D3D',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,29,61,0.10)',
        lift: '0 1px 2px rgba(0,0,0,0.05), 0 24px 56px -20px rgba(0,29,61,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
