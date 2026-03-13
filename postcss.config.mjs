const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-env": {
      stage: 0,
      features: {
        "oklab-function": true,
        "oklch-function": true,
        "color-mix-function": true,
        "color-functional-notation": true,
        "relative-color-syntax": true
      },
      preserve: false
    },
    tailwindcss: {},
    '@tailwindcss/postcss': {}, // Use the new package here
    autoprefixer: {},
    'postcss-preset-env': {}, // Se você estiver usando este aqui
    "autoprefixer": {},
  },
};

export default config;