import { defineStore } from "pinia";
import RetrieveDelivery from "@/services/api/SAL/retrieveDelivery";
import RetrieveDeliveryContext from "@/services/api/SAL/retrieveDeliveryContext";
import UpdateDelivery from "@/services/api/SAL/updateDelivery";
import POP from "@/core/utilities/pop";
import type { DeliveryDriver, DeliveryAddress } from "@/models/POS/SAL/SAL40000";

/** SAL47000 delivery-EDIT store: refill from the detail (SAL74000I01), edit the
 *  dispatch fields, submit the update (SAL47000I01). PENDING deliveries only.
 *  Mirrors the packaging-edit (SAL37000) pattern. */
export const SAL47000Store = defineStore("SAL47000Store", {
    state: () => ({
        deliveryId: "",
        deliveryCode: "",
        saleCode: "",
        customerId: undefined as string | undefined,
        status: "",
        driverId: undefined as string | undefined,
        drivers: [] as DeliveryDriver[],
        addresses: [] as DeliveryAddress[],
        addressPick: undefined as string | undefined,
        deliveryAddress: "",
        scheduledDate: "" as string,
        customerName: "",
        customerPhone: "",
        notes: "",
        loading: true,
        notFound: false,
        submitting: false,
        redirectTo: null as string | null
    }),
    getters: {
        editable(state): boolean {
            return state.status === "PENDING";
        }
    },
    actions: {
        /** Refill from the delivery detail (SAL74000I01), then load drivers + the
         *  customer's saved addresses via the create-context (SAL41000I01). */
        loadForEdit(deliveryId: string, failTitle: string) {
            this.deliveryId = deliveryId;
            if (!deliveryId) { this.loading = false; this.notFound = true; return; }
            this.loading = true;
            RetrieveDelivery.getInstance().request({
                dataBody: { deliveryId },
                listener: {
                    onSuccess: (p) => {
                        const h = p.delivery;
                        if (!h) { this.notFound = true; this.loading = false; return; }
                        this.deliveryCode = h.deliveryCode ?? "";
                        this.saleCode = h.saleCode ?? "";
                        this.status = String(h.status ?? "").toUpperCase();
                        this.driverId = h.driverId || undefined;
                        this.deliveryAddress = h.deliveryAddress ?? "";
                        const sd = h.scheduledDate ?? "";
                        this.scheduledDate = sd?.length === 16 ? `${sd}:00` : sd;
                        this.customerName = h.customerName ?? "";
                        this.customerPhone = h.customerPhone ?? "";
                        this.notes = h.notes ?? "";
                        this.loading = false;
                        this.loadContext();
                    },
                    onFail: (err) => { this.notFound = true; this.loading = false; POP.alert({ title: failTitle, status: "error", content: err?.message }); }
                }
            });
        },
        /** Drivers + the customer's saved addresses for the picked delivery's sale. */
        loadContext() {
            RetrieveDeliveryContext.getInstance().request({
                dataBody: this.saleCode ? { saleCode: this.saleCode } : {},
                listener: {
                    onSuccess: (p) => {
                        this.drivers = p.drivers ?? [];
                        this.addresses = p.addressList ?? [];
                        this.customerId = p.sale?.customerId;
                        // Pre-select the saved address that matches the delivery's current one.
                        const match = this.addresses.find((a) => a.address === this.deliveryAddress);
                        if (match) this.addressPick = match.addressId;
                    },
                    onFail: () => { /* drivers/addresses stay empty */ }
                }
            });
        },
        /** Pick a saved address → fill the address text. */
        pickAddress(addressId: string) {
            const a = this.addresses.find((x) => x.addressId === addressId);
            if (!a) return;
            this.addressPick = addressId;
            this.deliveryAddress = a.address;
        },
        /** A just-created address (from the modal): add, select, fill. */
        addAddress(a: DeliveryAddress) {
            this.addresses.push(a);
            this.pickAddress(a.addressId);
        },
        /** Submit the update; `failTitle` is the already-translated alert title. */
        submit(failTitle: string) {
            if (this.submitting || !this.editable) return;
            this.submitting = true;
            UpdateDelivery.getInstance().request({
                dataBody: {
                    deliveryId: this.deliveryId,
                    driverId: this.driverId || undefined,
                    deliveryAddress: this.deliveryAddress.trim() || undefined,
                    scheduledDate: this.scheduledDate || undefined,
                    customerName: this.customerName.trim() || undefined,
                    customerPhone: this.customerPhone.trim() || undefined,
                    notes: this.notes.trim() || undefined
                },
                listener: {
                    onSuccess: () => { this.submitting = false; this.redirectTo = `/SAL74000?deliveryId=${encodeURIComponent(this.deliveryId)}`; },
                    onFail: (err) => {
                        this.submitting = false;
                        POP.alert({ title: failTitle, status: "error", content: err?.message, errorCode: err?.code });
                    }
                }
            });
        }
    }
});
