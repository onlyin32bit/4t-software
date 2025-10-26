/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'bg-1': "url('/bg-1.png')",
				// 'bg-2': "url('/bg-2.jpg')",
				'bg-2': "url('/bg-4.jpg')",
				'bg-3': "url('/bg-3.png')",
				start: "url('/start.jpg')",
				'bg-5': "url('/bg-5.webp')",
				'bg-rule': "url('/rule.png')",
				'bg-kd': "url('/kd-bg.png')"
			},
			fontFamily: {
				'header-text': ['SVN-HEAD'],
				'number-display': ['SVN-TV'],
				'game-display': ['HANZEL'],
				futuristic: ['Tektur', 'sans-serif'],
				header: ['Inter', 'sans-serif']
			},
			animation: {
				wiggle: 'wiggle 0.5s ease-in-out infinite',
				shadowPulse: 'shadow-pulsing 3s infinite'
			},
			keyframes: {
				wiggle: {
					'0%, 100%': { transform: 'rotate(-5deg)' },
					'50%': { transform: 'rotate(5deg)' }
				},
				'shadow-pulsing': {
					'0%': { boxShadow: '0 0 1.5vh 0.7vh rgba(256,0,0,0.4)' },
					'50%': { boxShadow: '0 0 1.5vh 1vh rgba(256,0,0,0.5)' },
					'100%': { boxShadow: '0 0 1.5vh 0.7vh rgba(256,0,0,0.4)' }
				}
			}
		},
		fontFamily: {
			sans: ['Segoe UI', 'system-ui'],
			mono: ['JetBrains Mono', 'Consolas']
		}
	},
	plugins: [require('daisyui')]
};
