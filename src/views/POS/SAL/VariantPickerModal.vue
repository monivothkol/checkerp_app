<template>
	<div>
		<ion-searchbar v-model="keyword" :placeholder="tr('SEARCH')" />
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<bm-empty-state v-else-if="!filtered.length" :description="'POS10000.VARIANT_NONE'" />
		<ion-list v-else class="scr_list">
			<ion-item v-for="v in filtered" :key="v.variantId" button :detail="false" @click="emit('ok', v)">
				<ion-label>
					<h3>{{ v.variantName || v.variantCode }}</h3>
					<p :class="{ vp_out: Number(v.stockQuantity ?? 0) <= 0 }">{{ tr("STOCK") }} {{ Number(v.stockQuantity ?? 0) }}</p>
				</ion-label>
				<ion-note slot="end">$ {{ UT.currency(v.sellingPrice ?? 0, "USD") }}</ion-note>
			</ion-item>
		</ion-list>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import UT from "@/core/utilities/ut";
import ModuleApi from "@/services/api/COMMON/module-api";
import type { SellableVariant } from "@/models/POS/SAL/SellableVariant";

/** Pick which variant of a product is being sold/bought (POS cart, invoice, purchase, promotion lines). */
defineOptions({ name: "VariantPickerModal" });

const props = defineProps<{ productId: string; inventoryId?: string }>();
const emit = defineEmits<{ ok: [SellableVariant]; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`POS10000.VARIANT_${key}`);

const loading = ref(true);
const keyword = ref("");
const variants = ref<SellableVariant[]>([]);
const filtered = computed(() => {
	const kw = keyword.value.trim().toLowerCase();
	if (!kw) return variants.value;
	return variants.value.filter((v) => `${v.variantName ?? ""} ${v.variantCode ?? ""} ${v.barcode ?? ""}`.toLowerCase().includes(kw));
});

onMounted(() => {
	ModuleApi.request<{ variantList: SellableVariant[] }>("POS10000I03", { productId: props.productId, inventoryId: props.inventoryId }, {
		onSuccess: (p) => { variants.value = p.variantList ?? []; loading.value = false; },
		onFail: () => { variants.value = []; loading.value = false; }
	});
});
</script>

<style scoped>
.vp_out { color: var(--ion-color-danger); }
</style>
