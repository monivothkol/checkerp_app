<template>
	<ion-app>
		<ion-router-outlet />
	</ion-app>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";

defineOptions({
	name: "App",
	description: "App Component",
});
</script>
