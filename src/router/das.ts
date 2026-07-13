import { RouteRecordRaw } from "vue-router";

const dasRoute: Array<RouteRecordRaw> = [
	{
		path: "/DAS10000",
		name: "DAS10000",
		component: () => import("@/views/DAS/DAS10000.vue"),
	},
];

export default dasRoute;
