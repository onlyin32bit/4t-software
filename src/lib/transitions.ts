import { sineOut } from 'svelte/easing';

export function typewriter(node: Element, { delay = 0, speed = 1 }) {
	const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

	if (!valid) {
		throw new Error(`This transition only works on elements with a single text node child`);
	}

	const text: string = node.textContent ?? '';
	const duration = text.length / (speed * 0.01);

	return {
		delay,
		duration,
		tick: (t: number) => {
			const i = Math.trunc(text.length * t);
			node.textContent = text.slice(0, i);
		}
		// css: (t) => `transform: scale(1.2)`
	};
}

export function zoomIn(node: Element, { duration = 1000, delay = 0, easing = sineOut }) {
	return {
		duration,
		delay,
		css: (t: number) => {
			const eased = easing(t);
			return `transform: scale(${3 - eased * 2}) translate(-${9 - eased * 9}vh, ${20 - eased * 20}vh) rotate3d(0,-1,0,${0.4 - eased * 0.4}turn)`;
		}
	};
}
