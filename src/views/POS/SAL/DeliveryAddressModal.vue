<template>
    <div>
        <ion-list class="scr_list" lines="full">
            <ion-item><ion-input v-model="label" :label="tr('LABEL')" label-placement="stacked" :placeholder="tr('LABEL_PH')" clear-input /></ion-item>
            <ion-item><ion-textarea v-model="address" :label="`${tr('ADDRESS')} *`" label-placement="stacked" :placeholder="tr('ADDRESS_PH')" auto-grow :rows="2" /></ion-item>
            <!-- No map picker in the app (no Maps key / loader); GPS still pins the coordinates. -->
            <ion-item lines="none">
                <ion-label class="ion-text-wrap">
                    <p>{{ tr("NO_MAPS") }}</p>
                    <p v-if="lat != null">📍 {{ lat.toFixed(6) }}, {{ Number(lng).toFixed(6) }}</p>
                </ion-label>
                <ion-button slot="end" size="small" fill="outline" @click="locateMe">{{ tr("USE_MY_LOCATION") }}</ion-button>
            </ion-item>
            <ion-item><ion-toggle v-model="isDefault">{{ tr("SET_DEFAULT") }}</ion-toggle></ion-item>
        </ion-list>

        <div class="addr_btns">
            <ion-button fill="outline" :disabled="saving" @click="emit('cancel')">{{ tr("CANCEL") }}</ion-button>
            <ion-button :disabled="saving || !address.trim()" @click="save">{{ tr("SAVE") }}</ion-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import POP from "@/core/utilities/pop";
import CreateDeliveryAddress from "@/services/api/SAL/createDeliveryAddress";
import type { DeliveryAddress } from "@/models/POS/SAL/SAL40000";

/** Add a customer delivery address (label, text, optional GPS pin, default flag). */
defineOptions({ name: "DeliveryAddressModal" });

const props = defineProps<{ customerId: string }>();
const emit = defineEmits<{ ok: [DeliveryAddress]; cancel: [] }>();
const { t } = useI18n();
const tr = (key: string) => t(`SAL44000.${key}`);

const label = ref("");
const address = ref("");
const lat = ref<number | null>(null);
const lng = ref<number | null>(null);
const isDefault = ref(false);
const saving = ref(false);

function locateMe(): void {
    navigator.geolocation?.getCurrentPosition((pos) => {
        lat.value = pos.coords.latitude;
        lng.value = pos.coords.longitude;
    });
}

function save(): void {
    if (!address.value.trim() || saving.value) return;
    saving.value = true;
    CreateDeliveryAddress.getInstance().request({
        dataBody: {
            customerId: props.customerId,
            label: label.value.trim() || undefined,
            address: address.value.trim(),
            latitude: lat.value ?? undefined,
            longitude: lng.value ?? undefined,
            isDefault: isDefault.value
        },
        listener: {
            onSuccess: (p) => { saving.value = false; emit("ok", p as DeliveryAddress); },
            onFail: (e) => { saving.value = false; POP.apiError(e, tr("FAILED")); }
        }
    });
}
</script>

<style scoped>
.addr_btns { display: flex; gap: 8px; padding: 16px 0; }
.addr_btns ion-button { flex: 1; }
</style>
