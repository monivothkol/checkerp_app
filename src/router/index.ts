import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { ensureAuthenticated } from "@/services/session-service";
import autRoute from "./aut";
import dasRoute from "./das";
import mainRoute from "./main";
import salRoute from "./sal";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		redirect: "/AUT10000",
	},
	{
		// Legacy alias -> the tab shell's home tab
		path: "/home",
		redirect: "/main/home",
	},
	...autRoute,
	...dasRoute,
	...mainRoute,
	...salRoute,
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

/** Routes reachable without a session (login / auth screens). */
const PUBLIC_PATHS = new Set(["/AUT10000"]);

/**
 * Session-aware boot guard. Without this, every launch/reload lands on the
 * login screen even when a valid (or refreshable) token is in storage.
 *
 *  - Logged-in user hitting the login page  -> send to /main/home.
 *  - Logged-out user hitting a protected page -> send to /AUT10000.
 *  - Expired access token but valid refresh   -> silently rotated (AUT12000)
 *    inside ensureAuthenticated(), so the session survives.
 */
router.beforeEach(async (to) => {
	const authenticated = await ensureAuthenticated();
	const isPublic = PUBLIC_PATHS.has(to.path);

	if (isPublic) {
		return authenticated ? { path: "/main/home", replace: true } : true;
	}
	if (!authenticated) {
		return { path: "/AUT10000", replace: true };
	}
	return true;
});

export default router;
