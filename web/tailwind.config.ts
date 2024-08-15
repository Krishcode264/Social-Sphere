import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      mb: "370px",
      ...defaultTheme.screens,
    },
    extend: {
      objectFit: {
        cover: "cover",
        contain: "contain",
        fill: "fill",
        none: "none",
        "scale-down": "scale-down",
      },
    },
  },
  variants: {
    objectFit: ["responsive"],
  },
  plugins: [],
};
export default config;
