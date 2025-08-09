import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // Dynamic based on theme
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // UTP Corporate Colors - Colores oficiales y variantes
        utp: {
          // Azul corporativo UTP con variantes
          blue: "#0055A4", // Azul corporativo principal
          "blue-50": "#EBF4FF",
          "blue-100": "#DBEAFE", 
          "blue-200": "#BFDBFE",
          "blue-300": "#93C5FD",
          "blue-400": "#60A5FA",
          "blue-500": "#3B82F6",
          "blue-600": "#0055A4", // Principal
          "blue-700": "#003D7A",
          "blue-800": "#1E40AF",
          "blue-900": "#1E3A8A",
          "blue-dark": "#003D7A",
          "blue-light": "#3B82F6",
          
          // Rojo UTP con variantes (basado en logo oficial)
          red: "#D52B1E", // Rojo corporativo oficial UTP
          "red-50": "#FEF2F1",
          "red-100": "#FEE2E0",
          "red-200": "#FCC8C2",
          "red-300": "#FAA59A",
          "red-400": "#F67A6B",
          "red-500": "#EF4D3C",
          "red-600": "#D52B1E", // Principal (del logo)
          "red-700": "#B92318",
          "red-800": "#981E15",
          "red-900": "#7F1A12",
          "red-dark": "#B92318",
          "red-light": "#EF4D3C",
          
          // Grises corporativos
          gray: {
            50: "#F9FAFB",
            100: "#F3F4F6", 
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280", // Principal
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          },
          
          // Colores de estado
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
