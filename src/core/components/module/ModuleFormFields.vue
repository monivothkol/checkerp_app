<template>
	<ion-list class="scr_list mff" lines="full">
		<template v-for="field in fields" :key="field.key">
			<ion-item v-if="field.type === 'switch'">
				<ion-toggle v-model="form[field.key]">{{ label(field) }}</ion-toggle>
			</ion-item>

			<ion-item v-else-if="field.type === 'textarea'">
				<ion-textarea v-model="form[field.key]" :label="label(field)" label-placement="stacked" :placeholder="field.placeholder" auto-grow :rows="3" />
			</ion-item>

			<ion-item v-else-if="field.type === 'number'">
				<ion-input v-model.number="form[field.key]" :label="label(field)" label-placement="stacked" type="number" inputmode="decimal" :placeholder="field.placeholder" />
			</ion-item>

			<ion-item v-else-if="field.type === 'date'">
				<ion-input v-model="form[field.key]" :label="label(field)" label-placement="stacked" type="date" />
			</ion-item>

			<ion-item v-else-if="field.type === 'select' || field.type === 'multiselect'">
				<ion-select
					v-model="form[field.key]"
					:label="label(field)"
					label-placement="stacked"
					interface="action-sheet"
					:multiple="field.type === 'multiselect'"
					:interface-options="{ header: label(field) }">
					<ion-select-option v-for="o in optionLists[field.key] ?? []" :key="o.code" :value="o.code">{{ o.value }}</ion-select-option>
				</ion-select>
			</ion-item>

			<!-- phones: one input per number; stored as the v1 JSON-array string -->
			<template v-else-if="field.type === 'phones'">
				<ion-list-header>{{ label(field) }}</ion-list-header>
				<ion-item v-for="(p, i) in phoneRows(field.key)" :key="`p${i}`">
					<ion-input :value="p" type="tel" inputmode="tel" :placeholder="field.placeholder" @ion-input="setPhone(field.key, i, String($event.detail.value ?? ''))" />
					<ion-button v-if="phoneRows(field.key).length > 1" slot="end" fill="clear" color="danger" @click="removePhone(field.key, i)">−</ion-button>
				</ion-item>
				<ion-item button :detail="false" @click="addPhone(field.key)"><ion-label color="primary">+ {{ $t("EDIT.ADD_PHONE") }}</ion-label></ion-item>
			</template>

			<!-- addresses: label + text + default; coordinates set on the web are kept as-is -->
			<template v-else-if="field.type === 'addresses'">
				<ion-list-header>{{ label(field) }}</ion-list-header>
				<div v-for="(a, i) in listOf(field.key)" :key="`a${i}`" class="mff_box">
					<ion-item><ion-input :value="a.label" :placeholder="$t('EDIT.ADDR_LABEL_PH')" @ion-input="setRow(field.key, i, 'label', $event.detail.value)" /></ion-item>
					<ion-item><ion-textarea :value="a.address" auto-grow :placeholder="$t('EDIT.ADDR_PH')" @ion-input="setRow(field.key, i, 'address', $event.detail.value)" /></ion-item>
					<ion-item>
						<ion-toggle :checked="!!a.isDefault" @ion-change="setDefault(field.key, i)">{{ $t("EDIT.ADDR_DEFAULT") }}</ion-toggle>
						<ion-button slot="end" fill="clear" color="danger" @click="removeRow(field.key, i)">−</ion-button>
					</ion-item>
				</div>
				<ion-item button :detail="false" @click="addAddress(field.key)"><ion-label color="primary">+ {{ $t("EDIT.ADD_ADDRESS") }}</ion-label></ion-item>
			</template>

			<!-- customFields: one value per defined field -->
			<template v-else-if="field.type === 'customFields'">
				<ion-list-header>{{ label(field) }}</ion-list-header>
				<ion-item v-for="o in optionLists[field.key] ?? []" :key="o.code">
					<ion-input :label="o.value" label-placement="stacked" :value="customValue(field.key, o.code)" :placeholder="$t('EDIT.CUSTOM_VALUE')" @ion-input="setCustom(field.key, o.code, String($event.detail.value ?? ''))" />
				</ion-item>
				<ion-item v-if="!(optionLists[field.key] ?? []).length"><ion-note>{{ $t("EDIT.NO_CUSTOM_FIELDS") }}</ion-note></ion-item>
			</template>

			<!-- images: PRD20000I02 upload; first image is primary -->
			<template v-else-if="field.type === 'images'">
				<ion-list-header>{{ label(field) }}</ion-list-header>
				<div class="mff_imgs">
					<div v-for="(url, i) in listOf(field.key)" :key="`i${i}`" class="mff_img">
						<img :src="String(url)" alt="">
						<button type="button" class="mff_img_x" @click="removeRow(field.key, i)">×</button>
					</div>
					<label class="mff_img mff_img_add">
						<span>{{ uploading ? "…" : "+" }}</span>
						<input type="file" accept="image/*" hidden :disabled="uploading" @change="onPickImage(field.key, $event)">
					</label>
				</div>
			</template>

			<!-- variants: create starts empty, edit loads the record's saved set -->
			<template v-else-if="field.type === 'variants'">
				<ion-list-header>{{ label(field) }}</ion-list-header>
				<ProductVariantsTab :product-id="recordId" @update:value="form[field.key] = $event" @ready="emit('variants-ready', $event)" />
			</template>

			<ion-item v-else>
				<ion-input v-model="form[field.key]" :label="label(field)" label-placement="stacked" :placeholder="field.placeholder" />
			</ion-item>
		</template>
		<slot />
	</ion-list>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import { mergePhones, parsePhones } from "@/core/utilities/phones";
import UploadProductImage from "@/services/api/PRD/uploadProductImage";
import ProductVariantsTab from "@/views/POS/PRD/ProductVariantsTab.vue";
import type { ModuleField } from "@/core/modules/module-screen-config";
import type { OptionLists } from "@/core/modules/module-form";

/** Renders MODULE_CONFIGS fields as Ionic inputs, mutating `form` in place (create + edit). */
defineOptions({ name: "ModuleFormFields" });

type Row = Record<string, unknown>;

/** variants-ready: the variants editor has (or hasn't) loaded the saved set; the form blocks saving until true. */
const emit = defineEmits<{ "variants-ready": [boolean] }>();
const props = defineProps<{
	fields: ModuleField[];
	form: Record<string, any>;
	optionLists: OptionLists;
	/** i18n namespace of the field labels (the module's create screen id). */
	labelNs: string;
	/** Edit only: id of the record being edited (variants load its saved set). */
	recordId?: string;
}>();

const { t } = useI18n();
const uploading = ref(false);

const label = (f: ModuleField) => (f.labelKey ? t(`${props.labelNs}.${f.labelKey}`) : f.label) + (f.required ? " *" : "");
const listOf = (key: string): Row[] => (Array.isArray(props.form[key]) ? props.form[key] : []);

function phoneRows(key: string): string[] {
	const rows = parsePhones(props.form[key]);
	return rows.length ? rows : [""];
}
function setPhone(key: string, i: number, v: string): void {
	const rows = phoneRows(key);
	rows[i] = v;
	props.form[key] = mergePhones(rows);
}
// An empty trailing row can't be stored in the merged string, so keep it as a placeholder space.
function addPhone(key: string): void {
	props.form[key] = JSON.stringify([...parsePhones(props.form[key]), " "]);
}
function removePhone(key: string, i: number): void {
	props.form[key] = mergePhones(phoneRows(key).filter((_, idx) => idx !== i));
}

function setRow(key: string, i: number, prop: string, v: unknown): void {
	props.form[key] = listOf(key).map((r, idx) => (idx === i ? { ...r, [prop]: v ?? "" } : r));
}
function setDefault(key: string, i: number): void {
	props.form[key] = listOf(key).map((r, idx) => ({ ...r, isDefault: idx === i }));
}
function addAddress(key: string): void {
	props.form[key] = [...listOf(key), { address: "", isDefault: listOf(key).length === 0 }];
}
function removeRow(key: string, i: number): void {
	const removed = listOf(key)[i];
	let next = listOf(key).filter((_, idx) => idx !== i);
	if (removed && (removed as Row).isDefault && next.length && typeof next[0] === "object") next = next.map((r, idx) => ({ ...r, isDefault: idx === 0 }));
	props.form[key] = next;
}

function customValue(key: string, fieldId: string): string {
	return String((listOf(key) as { fieldId?: string; value?: string }[]).find((r) => r.fieldId === fieldId)?.value ?? "");
}
function setCustom(key: string, fieldId: string, value: string): void {
	const others = (listOf(key) as { fieldId: string; value: string }[]).filter((r) => r.fieldId !== fieldId);
	props.form[key] = [...others, { fieldId, value }];
}

function onPickImage(key: string, ev: Event): void {
	const input = ev.target as HTMLInputElement;
	const file = input.files?.[0];
	input.value = "";
	if (!file) return;
	const reader = new FileReader();
	reader.onload = () => {
		uploading.value = true;
		UploadProductImage.getInstance().request({
			dataBody: { imageBase64: String(reader.result).split(",")[1] ?? "", contentType: file.type },
			listener: {
				onSuccess: (r) => {
					uploading.value = false;
					if (r.url) props.form[key] = [...listOf(key), r.url];
				},
				onFail: (e) => {
					uploading.value = false;
					POP.apiError(e);
				}
			}
		});
	};
	reader.readAsDataURL(file);
}
</script>

<style lang="scss" scoped>
.mff_box { border-bottom: 1px solid var(--ion-color-light-shade, #ddd); }
.mff_imgs { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 16px; }
.mff_img { position: relative; width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 1px solid #ddd;
	img { width: 100%; height: 100%; object-fit: cover; }
}
.mff_img_x { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; border: 0; background: rgba(0, 0, 0, .6); color: #fff; font-size: 12px; line-height: 20px; }
.mff_img_add { display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ion-color-primary); }
</style>
