<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" :default-href="config.listRoute">
			<template v-if="config.updateTr && detail" #end>
				<ion-button @click="onEdit">{{ $t("EDIT.EDIT") }}</ion-button>
			</template>
			<template v-if="detail && config.detailTabs?.length" #bottom>
				<ion-toolbar>
					<ion-segment v-model="activeTab" scrollable>
						<ion-segment-button value="detail"><ion-label>{{ tr("TAB_DETAIL") }}</ion-label></ion-segment-button>
						<ion-segment-button v-for="tab in config.detailTabs" :key="tab.key" :value="tab.key"><ion-label>{{ tr(tab.labelKey) }}</ion-label></ion-segment-button>
					</ion-segment>
				</ion-toolbar>
			</template>
		</bm-header>

		<ion-content>
			<ion-progress-bar v-if="loading" type="indeterminate" />
			<template v-else-if="detail && activeComponent">
				<component :is="activeComponent.component" :key="activeTab" :detail="detail" v-bind="activeComponent.props || {}" />
			</template>
			<template v-else-if="detail">
				<div v-if="config.detailActions?.length" class="mds_actions">
					<ion-button v-for="a in config.detailActions" :key="a.key" size="small" @click="onDetailAction(a)">{{ tr(a.labelKey) }}</ion-button>
				</div>
				<ion-list class="scr_list" lines="full">
					<ion-item v-for="field in config.detailFields" :key="field.key">
						<ion-label>
							<p>{{ field.labelKey ? tr(field.labelKey) : field.label }}</p>
							<ion-badge v-if="typeof detail[field.key] === 'boolean'" :color="detail[field.key] ? 'success' : 'medium'">
								{{ detail[field.key] ? tr("ACTIVE") : tr("INACTIVE") }}
							</ion-badge>
							<h3 v-else class="mds_value">{{ detail[field.key] ?? "—" }}</h3>
						</ion-label>
					</ion-item>
				</ion-list>

				<ion-list class="scr_list" v-for="list in visibleLists" :key="list.key" lines="full">
					<ion-list-header>{{ tr(list.titleKey) }}</ion-list-header>
					<ion-item v-for="(row, i) in detail[list.key]" :key="i">
						<ion-label>
							<template v-for="c in list.columns" :key="c.key">
								<p v-if="c.type === 'map'">
									<a v-if="row.latitude != null" :href="`https://maps.google.com/?q=${row.latitude},${row.longitude}`" target="_blank" rel="noopener">📍 {{ tr("VIEW_ON_MAP") }}</a>
								</p>
								<p v-else>{{ tr(c.labelKey) }}: {{ row[c.key] === true ? "✓" : row[c.key] === false ? "—" : row[c.key] ?? "—" }}</p>
							</template>
						</ion-label>
					</ion-item>
				</ion-list>
			</template>
			<bm-empty-state v-else :description="`${config.detailTr}.NOT_FOUND`" />
		</ion-content>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import POP from "@/core/utilities/pop";
import ModuleApi from "@/services/api/COMMON/module-api";
import ModuleEditModal from "@/core/components/module/ModuleEditModal.vue";
import type { ModuleRowAction, ModuleScreenConfig } from "@/core/modules/module-screen-config";

/** Config-driven detail: fields, child lists, extra tabs and actions; Edit opens the edit sheet. */
defineOptions({ name: "ModuleDetailScreen" });

const props = defineProps<{ config: ModuleScreenConfig }>();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const tr = (key: string) => t(`${props.config.detailTr}.${key}`);

const loading = ref(true);
const detail = ref<Record<string, any> | null>(null);
const activeTab = ref("detail");

const code = computed(() => String(route.query[props.config.codeKey] ?? ""));
const visibleLists = computed(() => (props.config.detailLists ?? []).filter((l) => Array.isArray(detail.value?.[l.key]) && detail.value?.[l.key].length));
const activeComponent = computed(() => (props.config.detailTabs ?? []).find((tab) => tab.key === activeTab.value) ?? null);

function load(): void {
	if (!code.value) {
		router.replace(props.config.listRoute);
		return;
	}
	loading.value = true;
	ModuleApi.request(props.config.detailApi ?? props.config.detailTr, { [props.config.codeKey]: code.value }, {
		onSuccess: (payload) => { detail.value = payload; loading.value = false; },
		onFail: () => { detail.value = null; loading.value = false; }
	});
}
useViewEnter(load);

function onEdit(): void {
	if (!detail.value) return;
	POP.showPopup(ModuleEditModal, { title: `${t("EDIT.EDIT")} — ${tr("PAGE_TITLE")}`, props: { config: props.config, record: detail.value } })
		.promise.then(load).catch(() => undefined);
}
function onDetailAction(a: ModuleRowAction): void {
	if (!detail.value) return;
	POP.showPopup(a.component, { title: tr(a.labelKey), props: a.props(detail.value) }).promise.then(load).catch(() => undefined);
}
</script>

<style scoped>
.mds_actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 16px; }
.mds_value { font-size: 14px; white-space: normal; }
</style>
