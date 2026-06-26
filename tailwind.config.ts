import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        horta: ['"Horta"', "sans-serif"],
      },
      colors: {
        liga: {
          DEFAULT: "#E8722A",
          dark: "#C95E1F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
