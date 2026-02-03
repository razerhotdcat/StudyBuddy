/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 우리가 쓸 힙한 색상들 강제로 박아넣기
        'brand-lime': '#ccff00',
        'brand-black': '#111111',
      },
    },
  },
  plugins: [],
}
