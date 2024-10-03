/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'bg-1': "url('/src/lib/image/bg-1.png')",
				'bg-2': "url('/src/lib/image/bg-2.jpg')",
				'bg-kd': "url('/src/lib/image/kd-bg.png')"
			},
			fontFamily: {
				'number-display': ['SVN-TV']
			}
		}
	},
	plugins: [require('daisyui')]
};
