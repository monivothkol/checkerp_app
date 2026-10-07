<template>
	<ion-page>
		<bm-header title="Main Domain Dashboard" default-href="/main/menu" />
		<ion-content>
			<ion-note class="mnd_sub">Account &amp; subscription overview for {{ companyName }}.</ion-note>
			<ion-list class="scr_list" lines="full">
				<ion-list-header>Company</ion-list-header>
				<ion-item><ion-label><h2>{{ companyName }}</h2><p>Code: {{ companyCode }}</p></ion-label></ion-item>
			</ion-list>
			<ion-list class="scr_list" lines="full">
				<ion-list-header>Subscription</ion-list-header>
				<ion-item>
					<ion-label><p>Package / expiry — coming soon (MND20000).</p></ion-label>
					<ion-badge slot="end" color="success">ACTIVE</ion-badge>
				</ion-item>
			</ion-list>
			<ion-list class="scr_list" lines="full">
				<ion-list-header>Owner</ion-list-header>
				<ion-item>
					<ion-label><h2>{{ username }}</h2></ion-label>
					<ion-badge slot="end" color="tertiary">Main-domain account</ion-badge>
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import DataStorage from "@/core/utilities/data-storage";

/** MND20000 — main-domain account overview (company, subscription placeholder, owner); English-only like the web. */
defineOptions({ name: "MND20000" });

const companyName = ref("");
const companyCode = ref("");
const username = ref("");

onMounted(async () => {
	const raw: string | null = await DataStorage.get({ key: "userInfo" });
	if (!raw) return;
	const info = JSON.parse(raw) as { companyName?: string; companyCode?: string; userName?: string; username?: string };
	companyName.value = info.companyName || "";
	companyCode.value = info.companyCode || "";
	username.value = info.userName || info.username || "";
});
</script>

<style scoped>
.mnd_sub { display: block; padding: 8px 16px; font-size: 12px; }
ion-list-header { font-size: 14px; font-weight: 600; }
ion-label h2 { font-size: 14px; font-weight: 600; }
ion-label p { font-size: 12px; }
</style>
