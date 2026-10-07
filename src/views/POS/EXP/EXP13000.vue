<template>
	<ion-page>
		<ion-content class="ion-padding">
			<div v-if="store.saved" class="e13">
				<ion-icon :icon="checkmarkCircle" color="success" class="e13_mark" />
				<h1>{{ tr("CREATED") }}</h1>
				<p class="e13_code">{{ store.saved.code }}</p>
				<p>{{ summary }}</p>
				<ion-button expand="block" @click="onDetail">{{ tr("VIEW_DETAIL") }}</ion-button>
				<ion-button expand="block" fill="outline" @click="router.push('/EXP11000')">{{ tr("CREATE_ANOTHER") }}</ion-button>
				<ion-button expand="block" fill="clear" @click="router.push('/EXP10000')">{{ tr("BACK_TO_LIST") }}</ion-button>
			</div>
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { checkmarkCircle } from "ionicons/icons";
import UT from "@/core/utilities/ut";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { EXP11000Store } from "@/store/POS/EXP/EXP11000Store";

/** Result of an expense create; the returned code is proof the row committed. */
defineOptions({ name: "EXP13000" });

const { t } = useI18n();
const router = useRouter();
const tr = (key: string) => t(`EXP13000.${key}`);
const store = EXP11000Store();

const summary = computed(() => {
	const ccy = store.currency || "USD";
	const amount = (ccy === "KHR" ? "៛ " : "$ ") + UT.currency(store.amount ?? 0, ccy);
	return [store.listName, amount].filter(Boolean).join(" · ");
});

// Deep link / refresh with nothing saved: nothing to show.
useViewEnter(() => {
	if (!store.saved) router.replace("/EXP10000");
});

function onDetail(): void {
	router.push(`/EXP15000?expenseId=${encodeURIComponent(store.saved?.expenseId ?? "")}`);
}
</script>

<style scoped>
.e13 { text-align: center; padding-top: 48px; }
.e13_mark { font-size: 64px; }
.e13 h1 { font-size: 16px; font-weight: 700; }
.e13_code { font-size: 14px; font-weight: 600; }
.e13 ion-button { margin-top: 8px; }
</style>
