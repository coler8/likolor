/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                // Material 3 Dark Palette Reference
                'md-sys-dark-surface': '#141218',
                'md-sys-dark-on-surface': '#E6E1E5',
                'md-sys-dark-surface-container': '#1D1B20',
                'md-sys-dark-surface-container-high': '#2B2930',
                'md-sys-dark-primary': '#D0BCFF',
                'md-sys-dark-on-primary': '#381E72',
                'md-sys-dark-secondary-container': '#4A4458',
                'md-sys-dark-on-secondary-container': '#E8DEF8',
                'md-sys-dark-outline': '#938F99',
                'md-sys-dark-outline-variant': '#49454F',
            },
            fontFamily: {
                sans: ['"Google Sans"', 'Roboto', 'sans-serif'],
                display: ['"Google Sans Display"', 'Roboto', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
