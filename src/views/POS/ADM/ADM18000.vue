<template>
	<div>
		<p class="adm_sub">{{ t("ADM10000.RESET_FOR", { name: username }) }}</p>
		<ion-list class="scr_list" lines="full">
			<ion-item>
				<ion-input v-model="password" :label="`${tr('NEW_PASSWORD')} *`" label-placement="stacked" type="password" :placeholder="tr('PASSWORD_RULE')" autocomplete="new-password">
					<ion-input-password-toggle slot="end" />
				</ion-input>
			</ion-item>
			<ion-item>
				<ion-input v-model="confirm" :label="`${tr('CONFIRM_PASSWORD')} *`" label-placement="stacked" type="password" autocomplete="new-password" enterkeyhint="done" @keyup.enter="onSave">
					<ion-input-password-toggle slot="end" />
				</ion-input>
			</ion-item>
		</ion-list>
		<div class="adm_btns">
			<ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
			<ion-button :disabled="saving" @click="onSave">{{ tr("RESET_PW") }}</ion-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import ResetUserPassword from "@/services/api/ADM/resetUserPassword";

/** ADM18000 — admin password reset sheet body (POP.showPopup): emits ok / cancel. */
defineOptions({ name: "ADM18000" });

const props = withDefaults(defineProps<{ userId: string; username?: string }>(), { username: "" });
const emit = defineEmits<{ ok: []; cancel: [] }>();
const { t } = useI18n();
const tr = (k: string) => t(`ADM10000.${k}`);
const saving = ref(false);
const password = ref("");
const confirm = ref("");

function onSave(): void {
	if (password.value.length < 6 || password.value.length > 100) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("PASSWORD_RULE") });
		return;
	}
	if (password.value !== confirm.value) {
		POP.alert({ status: "error", title: tr("VALIDATION"), content: tr("PASSWORD_MISMATCH") });
		return;
	}
	saving.value = true;
	ResetUserPassword.getInstance().request({
		dataBody: { targetUserId: props.userId, password: password.value },
		listener: {
			onSuccess: () => { saving.value = false; emit("ok"); },
			onFail: (e) => { saving.value = false; POP.apiError(e, tr("RESET_FAILED")); }
		}
	});
}
</script>

<style scoped>
.adm_sub { font-size: 14px; color: var(--ion-color-medium); margin: 0 0 8px; }
.adm_btns { display: flex; gap: 8px; padding: 16px 0; }
.adm_btns ion-button { flex: 1; }
</style>
