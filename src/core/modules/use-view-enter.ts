import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Runs `fn` when the screen is first shown and every time the user comes back to it (or its query
 * changes). Ionic keeps stacked pages alive, and onIonViewWillEnter only fires on the routed
 * component itself, so shared screen bodies (Module*Screen, tabs) use this instead.
 */
export function useViewEnter(fn: () => void): void {
	const route = useRoute();
	const path = route.path;
	let last = "";
	// One run per arrival: mount and the route settling on the same URL must not load twice.
	const run = () => {
		if (route.path !== path || route.fullPath === last) return;
		last = route.fullPath;
		fn();
	};
	onMounted(run);
	watch(() => route.fullPath, (now) => {
		if (route.path !== path) last = ""; // left the screen: the next return reloads
		else if (now !== last) run();
	});
}
