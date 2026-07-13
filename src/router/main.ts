import { RouteRecordRaw } from "vue-router";

/**
 * Main bottom-tab shell. Mirrors the DBCS `/main/` parent: the shell
 * (MainTabsPage) owns the ion-tabs + ion-tab-bar; each tab is a child route
 * rendered inside the shell's nested router-outlet.
 */
const mainRoute: Array<RouteRecordRaw> = [
	{
		path: "/main/",
		component: () => import("@/views/MAIN/MainTabsPage.vue"),
		children: [
			{
				path: "",
				redirect: "/main/home"
			},
			{
				path: "home",
				name: "MAIN_HOME",
				component: () => import("@/views/DAS/DAS10000.vue")
			},
			{
				path: "invoice",
				name: "MAIN_INVOICE",
				component: () => import("@/views/INV/INV10000.vue")
			},
			{
				path: "product",
				name: "MAIN_PRODUCT",
				component: () => import("@/views/PRD/PRD10000.vue")
			},
			{
				path: "pos",
				name: "MAIN_POS",
				component: () => import("@/views/POS/POS10000.vue")
			},
			{
				path: "menu",
				name: "MAIN_MENU",
				component: () => import("@/views/MNU/MNU10000.vue")
			}
		]
	}
];

export default mainRoute;
