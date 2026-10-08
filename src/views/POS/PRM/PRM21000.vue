<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/PRM20000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item>
					<ion-label><p>{{ tr("STAFF") }} *</p><h3>{{ store.staffOptions.find((o) => o.id === store.staffId)?.name || tr("STAFF_PH") }}</h3></ion-label>
				</ion-item>
				<SearchPickField :options="staffMatches" :placeholder="tr('STAFF_PH')" @search="(v) => (staffKw = v)" @pick="(v) => { store.staffId = v; staffKw = ''; }" />
				<ion-item>
					<ion-select v-model="store.typeId" :label="`${tr('TYPE')} *`" label-placement="stacked" :placeholder="tr('TYPE_PH')" interface="action-sheet" @ion-change="store.onPickType">
						<ion-select-option v-for="o in store.typeOptions" :key="o.id" :value="o.id">{{ o.name }} — {{ tr("CAT_" + o.category) }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<NumberInput v-model="store.amount" :label="`${tr('AMOUNT')} ($) *`" label-placement="stacked" min="0" step="0.01" />
				</ion-item>
				<ion-item>
					<ion-input v-model="store.effectiveMonth" :label="`${tr('MONTH')} *`" label-placement="stacked" type="month" />
				</ion-item>
				<ion-item>
					<ion-textarea v-model="store.remark" :label="tr('REMARK')" label-placement="stacked" :placeholder="tr('REMARK_PH')" :rows="3" auto-grow />
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="prm_btns">
					<ion-button fill="outline" @click="router.push('/PRM20000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!store.canConfirm" @click="confirm">{{ tr("NEXT") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import NumberInput from "@/core/components/NumberInput.vue";
import SearchPickField from "@/views/POS/SAL/SearchPickField.vue";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { PRM21000Store } from "@/store/POS/PRM/PRM21000Store";

/** New payroll adjustment, step 1 (form → draft → PRM22000). */
defineOptions({ name: "PRM21000" });

const { t } = useI18n();
const router = useRouter();
const tr = (k: string) => t(`PRM21000.${k}`);
const store = PRM21000Store();

useViewEnter(() => { store.loadStaff(); store.loadTypes(); });

// Searchable staff picker (web: a-select show-search).
const staffKw = ref("");
const staffMatches = computed(() => {
	const q = staffKw.value.trim().toLowerCase();
	return q ? store.staffOptions.filter((o) => o.name.toLowerCase().includes(q)).map((o) => ({ value: o.id, label: o.name })) : [];
});

function confirm(): void {
	if (store.buildAndSaveDraft()) router.push("/PRM22000");
}
</script>

<style scoped>
.prm_btns { display: flex; gap: 8px; padding: 0 8px; }
.prm_btns ion-button { flex: 1; }
</style>
