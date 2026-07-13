import { RouteRecordRaw } from "vue-router";

const autRoute: RouteRecordRaw[] = [
	{
		path: "/AUT10000",
		name: "AUT10000",
		component: () => import("@/views/AUT/AUT10000.vue")
	}
];

export default autRoute;
