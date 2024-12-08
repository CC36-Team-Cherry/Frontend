/** @type {import('tailwindcss').Config} */

export const content = [
  './index.html',
  './src/**/*.{vue,js,ts,jsx,tsx}',
];
export const theme = {
  extend: {},
};
export const plugins = [
  function ({ addUtilities }) {
    addUtilities({
      '.no-spinner': {
        '&::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
        '&::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: '0',
        },
        '-moz-appearance': 'textfield',
      },
    });
  },
];

// module.exports = {
//   content: [
//     './index.html',
//     './src/**/*.{vue,js,ts,jsx,tsx}',
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };


