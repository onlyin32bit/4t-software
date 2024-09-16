/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'bg-1': "url('/src/lib/image/4t-2.png')",
				'bg-2': "url('/src/lib/image/4t.jpg')",
				'bg-kd': "url('/src/lib/image/kd-bg.png')"
			}
		}
	},
	plugins: [require('daisyui')]
};
