import { createRouter, createWebHistory } from "@ionic/vue-router";
import type { RouteRecordRaw } from "vue-router";
import { ensureAuthenticated } from "@/services/session-service";
import mainRoute from "./main";

/**
 * Screens are routed by id, as on checkerp_web: views/**\/SAL11000.vue -> /SAL11000.
 * Adding a screen = adding its view file; no router edit.
 */
const views = import.meta.glob("@/views/**/*.vue");
const SCREEN_FILE = /\/([A-Z]{3}\d{5})\.vue$/;

const screenFiles = Object.entries(views)
	.map(([file, loader]) => ({ file, id: SCREEN_FILE.exec(file)?.[1], loader }))
	.filter((s): s is { file: string; id: string; loader: () => Promise<unknown> } => !!s.id);

// A screen id must map to exactly one view; vue-router would silently keep only one of them.
const seen = new Map<string, string>();
for (const { id, file } of screenFiles) {
	if (seen.has(id)) throw new Error(`Duplicate screen id ${id}: ${seen.get(id)} and ${file}`);
	seen.set(id, file);
}

const screenRoutes: RouteRecordRaw[] = screenFiles
	.map(({ id, loader }) => ({ path: `/${id}`, name: id, component: loader as RouteRecordRaw["component"] }) as RouteRecordRaw);

const routes: RouteRecordRaw[] = [
	{ path: "/", redirect: "/AUT10000" },
	{ path: "/home", redirect: "/main/home" },
	...mainRoute,
	...screenRoutes
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
});

/** Routes reachable without a session (login). */
const PUBLIC_PATHS = new Set(["/AUT10000"]);

/**
 * Session-aware guard: a logged-in user never sees the login page; a logged-out one never sees
 * anything else. An expired access token is rotated (AUT10000I02) inside ensureAuthenticated().
 */
router.beforeEach(async (to) => {
	const authenticated = await ensureAuthenticated();
	if (PUBLIC_PATHS.has(to.path)) {
		return authenticated ? { path: "/main/home", replace: true } : true;
	}
	return authenticated ? true : { path: "/AUT10000", replace: true };
});

export default router;
