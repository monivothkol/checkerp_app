<template>
	<ion-page>
		<bm-header :title="tr('PAGE_TITLE')" default-href="/ADM10000" />
		<ion-content>
			<ion-list class="scr_list" lines="full">
				<ion-item><ion-input v-model="store.form.firstName" :label="`${tr('FIRST_NAME')} *`" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="store.form.lastName" :label="`${tr('LAST_NAME')} *`" label-placement="stacked" /></ion-item>
				<ion-item><ion-input v-model="store.form.username" :label="`${tr('USERNAME')} *`" label-placement="stacked" :placeholder="tr('USERNAME_PH')" autocapitalize="off" /></ion-item>
				<ion-item><ion-input v-model="store.form.phone" :label="tr('PHONE')" label-placement="stacked" type="tel" inputmode="tel" /></ion-item>
				<ion-item><ion-input v-model="store.form.email" :label="tr('EMAIL')" label-placement="stacked" type="email" :placeholder="tr('EMAIL_PH')" /></ion-item>
				<ion-item>
					<ion-input v-model="password" :label="`${tr('PASSWORD')} *`" label-placement="stacked" type="password" autocomplete="new-password">
						<ion-input-password-toggle slot="end" />
					</ion-input>
				</ion-item>
				<ion-item>
					<ion-input v-model="confirmPassword" :label="`${tr('CONFIRM_PASSWORD')} *`" label-placement="stacked" type="password" autocomplete="new-password"
						:class="{ 'ion-invalid ion-touched': mismatch }" :error-text="tr('PASSWORD_MISMATCH')">
						<ion-input-password-toggle slot="end" />
					</ion-input>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.form.roleId" :label="`${tr('ROLE')} *`" label-placement="stacked" :placeholder="tr('SEL_ROLE')" interface="action-sheet">
						<ion-select-option v-for="r in store.roles" :key="r.roleId" :value="r.roleId">{{ r.roleName }}</ion-select-option>
					</ion-select>
				</ion-item>
				<ion-item>
					<ion-select v-model="store.form.staffId" :label="tr('STAFF')" label-placement="stacked" :placeholder="tr('SEL_STAFF')" interface="action-sheet">
						<ion-select-option :value="undefined">—</ion-select-option>
						<ion-select-option v-for="s in store.staff" :key="s.staffId" :value="s.staffId">{{ store.staffLabel(s) }}</ion-select-option>
					</ion-select>
				</ion-item>
			</ion-list>
		</ion-content>
		<ion-footer>
			<ion-toolbar>
				<div class="adm_btns">
					<ion-button fill="outline" @click="router.push('/ADM10000')">{{ tr("CANCEL") }}</ion-button>
					<ion-button :disabled="!canConfirm" @click="confirm">{{ tr("NEXT") }}</ion-button>
				</div>
			</ion-toolbar>
		</ion-footer>
	</ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useViewEnter } from "@/core/modules/use-view-enter";
import { ADM11000Store } from "@/store/POS/ADM/ADM11000Store";
import { UserCreateSecret } from "@/core/modules/user-create-secret";

/** ADM11000 — new user form (step 1). Password stays in component memory, never in the draft. */
defineOptions({ name: "ADM11000" });

const { t } = useI18n();
const tr = (k: string) => t(`ADM11000.${k}`);
const router = useRouter();
const store = ADM11000Store();
const password = ref("");
const confirmPassword = ref("");

const mismatch = computed(() => !!confirmPassword.value && confirmPassword.value !== password.value);
const canConfirm = computed(() => store.formValid && password.value.length >= 6 && password.value === confirmPassword.value);

// Ionic reuses this page. ADM12000 $reset()s the store after a create: reload the lists and drop the old password;
// plain "back" from ADM12000 keeps both.
useViewEnter(() => {
	if (store.roles.length) return;
	password.value = "";
	confirmPassword.value = "";
	store.loadRoles();
	store.loadStaff();
});

function confirm(): void {
	if (!canConfirm.value) return;
	UserCreateSecret.set(password.value);
	if (store.buildAndSaveDraft(tr("EMAIL_AUTO"))) router.push("/ADM12000");
}
</script>

<style scoped>
.adm_btns { display: flex; gap: 8px; padding: 8px 16px; }
.adm_btns ion-button { flex: 1; }
</style>
