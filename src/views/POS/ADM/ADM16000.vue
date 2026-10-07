<template>
	<div>
		<ion-progress-bar v-if="loading" type="indeterminate" />
		<ion-list class="scr_list" lines="full">
			<ion-item><ion-input :value="form.username" :label="tr('USERNAME')" label-placement="stacked" disabled /></ion-item>
			<ion-item><ion-input v-model="form.firstName" :label="`${tr('FIRST_NAME')} *`" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="form.lastName" :label="`${tr('LAST_NAME')} *`" label-placement="stacked" /></ion-item>
			<ion-item><ion-input v-model="form.email" :label="tr('EMAIL')" label-placement="stacked" type="email" /></ion-item>
			<ion-item><ion-input v-model="form.phone" :label="tr('PHONE')" label-placement="stacked" type="tel" inputmode="tel" /></ion-item>
			<ion-item>
				<ion-select v-model="form.roleId" :label="`${tr('ROLE')} *`" label-placement="stacked" interface="action-sheet">
					<ion-select-option v-for="r in roles" :key="r.roleId" :value="r.roleId">{{ r.roleName }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-select v-model="form.staffId" :label="tr('STAFF')" label-placement="stacked" :placeholder="tr('STAFF_PH')" interface="action-sheet">
					<ion-select-option :value="undefined">{{ tr("STAFF_PH") }}</ion-select-option>
					<ion-select-option v-for="s in staff" :key="s.staffId" :value="s.staffId">{{ staffLabel(s) }}</ion-select-option>
				</ion-select>
			</ion-item>
			<ion-item>
				<ion-input v-model="form.password" :label="tr('NEW_PASSWORD')" label-placement="stacked" type="password" :placeholder="tr('PASSWORD_HINT')" autocomplete="new-password">
					<ion-input-password-toggle slot="end" />
				</ion-input>
			</ion-item>
			<ion-item><ion-toggle v-model="form.isActive">{{ tr("ACTIVE") }}</ion-toggle></ion-item>
		</ion-list>
		<div class="adm_btns">
			<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving || loading" @click="onSave">{{ tr("SAVE") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import RetrieveUserDetail from "@/services/api/ADM/retrieveUserDetail";
import RetrieveRoleList from "@/services/api/ADM/retrieveRoleList";
import RetrieveStaffList from "@/services/api/STM/retrieveStaffList";
import UpdateUser from "@/services/api/ADM/updateUser";
import type { RoleOption } from "@/models/POS/ADM/ADM11000";
import type { StaffLookup } from "@/models/POS/COMMON/lookups";

/** ADM16000 — edit-user sheet body (POP.showPopup): emits ok on save, cancel to dismiss. */
defineOptions({ name: "ADM16000" });

const props = defineProps<{ userId: string }>();
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ADM10000.${k}`);

const loading = ref(true);
const saving = ref(false);
const roles = ref<RoleOption[]>([]);
const staff = ref<StaffLookup[]>([]);
const form = reactive({
	username: "", firstName: "", lastName: "", email: "", phone: "",
	roleId: undefined as string | undefined, staffId: undefined as string | undefined,
	isActive: true, password: ""
});

const staffLabel = (s: StaffLookup) => s.staffName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();

onMounted(() => {
	RetrieveRoleList.getInstance().request({ dataBody: { pageNo: 1, pageSize: 100 }, listener: { onSuccess: (p) => { roles.value = p.roleList ?? []; } } });
	RetrieveStaffList.getInstance().request({ dataBody: { pageNo: 1, pageSize: 200 }, listener: { onSuccess: (p) => { staff.value = p.staffList ?? []; } } });
	RetrieveUserDetail.getInstance().request({
		dataBody: { targetUserId: props.userId },
		listener: {
			onSuccess: (p) => {
				const u = p.user ?? p;
				Object.assign(form, {
					username: u.username ?? "", firstName: u.firstName ?? "", lastName: u.lastName ?? "",
					email: u.email ?? "", phone: u.phone ?? "", roleId: u.roleId, staffId: u.staffId, isActive: u.isActive ?? true
				});
				loading.value = false;
			},
			onFail: (e) => { loading.value = false; POP.apiError(e, tr("LOAD_FAILED")); }
		}
	});
});

function onSave(): void {
	if (!form.firstName.trim() || !form.lastName.trim() || !form.roleId) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("REQUIRED_FIELDS") });
		return;
	}
	if (form.password && (form.password.length < 6 || form.password.length > 100)) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("PASSWORD_HINT") });
		return;
	}
	saving.value = true;
	UpdateUser.getInstance().request({
		dataBody: {
			targetUserId: props.userId,
			firstName: form.firstName.trim(),
			lastName: form.lastName.trim(),
			email: form.email?.trim() || undefined,
			phone: form.phone?.trim() || undefined,
			roleId: form.roleId,
			staffId: form.staffId || undefined,
			isActive: form.isActive,
			password: form.password || undefined
		},
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("SAVE_FAILED")); }
		}
	});
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 16px 0; }
.adm_btns ion-button { flex: 1; }
</style>
