import { RouteRecordRaw } from "vue-router";

const salRoute: RouteRecordRaw[] = [
	{
		path: "/SAL11000",
		name: "SAL11000",
		component: () => import("@/views/SAL/SAL11000.vue")
	},
	{
		path: "/SAL12000",
		name: "SAL12000",
		component: () => import("@/views/SAL/SAL12000.vue")
	},
	{
		path: "/SAL13000",
		name: "SAL13000",
		component: () => import("@/views/SAL/SAL13000.vue")
	},
	{
		path: "/SAL14000",
		name: "SAL14000",
		component: () => import("@/views/SAL/SAL14000.vue")
	},
	{
		path: "/SAL15000",
		name: "SAL15000",
		component: () => import("@/views/SAL/SAL15000.vue")
	}
];

export default salRoute;
