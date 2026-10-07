import { defineStore } from "pinia";
import RetrieveSaleList from "@/services/api/SIV/retrieveSaleList";
import RetrieveDeliveryContext from "@/services/api/SAL/retrieveDeliveryContext";
import RetrieveDeliveryAddresses from "@/services/api/SAL/retrieveDeliveryAddresses";
import { ModuleFlowStore } from "@/core/modules/module-screen-config";
import type { DeliveryAddress, DeliveryDriver } from "@/models/POS/SAL/SAL40000";
import type { SaleRow } from "@/models/POS/SIV/SIV10000";

/** SAL41000 delivery-create form store: pick a sale + driver, dispatch details, then hand off to SAL52000. */
/** Cancelled/voided invoices are closed records: nothing can be packed or delivered from them. */
const openSales = (list?: SaleRow[]) => (list ?? []).filter((s) => !["CANCELLED", "VOIDED"].includes(String(s.status ?? "").toUpperCase()));

export const SAL41000Store = defineStore("SAL41000Store", {
    state: () => ({
        // sale picker
        salePick: undefined as string | undefined,
        saleResults: [] as SaleRow[],
        searchingSale: false,
        saleTimer: 0 as ReturnType<typeof setTimeout> | 0,
        selectedSale: null as SaleRow | null,
        saleLocked: false, // true when deep-linked from a sale/packaging — sale can't be changed
        // drivers
        drivers: [] as DeliveryDriver[],
        driverId: undefined as string | undefined,
        // saved delivery addresses of the picked sale's customer
        addresses: [] as DeliveryAddress[],
        addressPick: undefined as string | undefined,
        deliveryLat: null as number | null,
        deliveryLng: null as number | null,
        // dispatch fields
        deliveryAddress: "",
        scheduledDate: "" as string,
        customerName: "",
        customerPhone: "",
        notes: ""
    }),
    getters: {
        canConfirm(state): boolean {
            return !!state.selectedSale;
        }
    },
    actions: {
        /** One round trip: drivers, plus (with a saleCode deep link) the sale + saved addresses. */
        loadContext(saleCode?: string) {
            RetrieveDeliveryContext.getInstance().request({
                dataBody: saleCode ? { saleCode } : {},
                listener: {
                    onSuccess: (p) => {
                        this.drivers = p.drivers ?? [];
                        if (p.sale) {
                            this.selectedSale = {
                                saleId: p.sale.saleId,
                                saleCode: p.sale.saleCode,
                                customerId: p.sale.customerId,
                                customerName: p.sale.customerName,
                                customerPhone: p.sale.customerPhone
                            } as SaleRow;
                            if (p.sale.customerName && !this.customerName) this.customerName = p.sale.customerName;
                            if (p.sale.customerPhone && !this.customerPhone) this.customerPhone = p.sale.customerPhone;
                            this.saleLocked = true; // deep-linked: lock the sale picker
                        }
                        if (p.addressList?.length) {
                            this.addresses = p.addressList;
                            const preferred = this.addresses.find((a) => a.isDefault) ?? null;
                            if (preferred && !this.deliveryAddress.trim()) this.pickAddress(preferred.addressId);
                        }
                        // No saved delivery address → fall back to the customer's main address.
                        if (!this.deliveryAddress.trim() && p.sale?.customerAddress) {
                            this.deliveryAddress = p.sale.customerAddress;
                        }
                    },
                    onFail: () => { this.drivers = []; }
                }
            });
        },
        searchSales(kw: string) {
            if (this.saleTimer) clearTimeout(this.saleTimer);
            this.searchingSale = true;
            this.saleTimer = setTimeout(() => {
                RetrieveSaleList.getInstance().request({
                    dataBody: { searchKeyword: kw, pageNo: 1, pageSize: 20 },
                    listener: {
                        onSuccess: (p) => { this.saleResults = openSales(p.saleList); this.searchingSale = false; },
                        onFail: () => { this.searchingSale = false; }
                    }
                });
            }, 300);
        },
        onPickSale(saleId: string) {
            const sale = this.saleResults.find((x) => x.saleId === saleId) ?? null;
            this.salePick = undefined;
            // A different sale means a different receiver — re-derive the fields
            // instead of keeping the previous customer's data.
            if (sale?.saleId !== this.selectedSale?.saleId) {
                this.customerName = "";
                this.customerPhone = "";
                this.deliveryAddress = "";
                this.addressPick = undefined;
                this.addresses = [];
                this.deliveryLat = null;
                this.deliveryLng = null;
            }
            this.selectedSale = sale;
            if (sale?.customerName && !this.customerName) this.customerName = sale.customerName;
            if (sale?.customerPhone && !this.customerPhone) this.customerPhone = sale.customerPhone;
            this.loadAddresses(sale?.customerId);
        },
        /** Saved addresses for the picked customer; a default address prefills the field. */
        loadAddresses(customerId?: string) {
            this.addresses = [];
            this.addressPick = undefined;
            if (!customerId) return;
            RetrieveDeliveryAddresses.getInstance().request({
                dataBody: { customerId },
                listener: {
                    onSuccess: (p) => {
                        this.addresses = p.addressList ?? [];
                        const preferred = this.addresses.find((a) => a.isDefault) ?? null;
                        if (preferred && !this.deliveryAddress.trim()) this.pickAddress(preferred.addressId);
                    },
                    onFail: () => { this.addresses = []; }
                }
            });
        },
        pickAddress(addressId: string) {
            const a = this.addresses.find((x) => x.addressId === addressId);
            if (!a) return;
            this.addressPick = addressId;
            this.deliveryAddress = a.address;
            this.deliveryLat = a.latitude != null ? Number(a.latitude) : null;
            this.deliveryLng = a.longitude != null ? Number(a.longitude) : null;
        },
        /** A just-created address (from the modal): add, select, prefill. */
        addAddress(a: DeliveryAddress) {
            if (a.isDefault) this.addresses = this.addresses.map((x) => ({ ...x, isDefault: false }));
            this.addresses = a.isDefault ? [a, ...this.addresses] : [...this.addresses, a];
            this.pickAddress(a.addressId);
        },
        /** Validate + stash the DELIVERY draft; returns true when saved (screen then navigates). */
        buildAndSaveDraft(): boolean {
            if (!this.canConfirm || !this.selectedSale) return false;
            ModuleFlowStore.saveDraft("DELIVERY", {
                payload: {
                    saleId: this.selectedSale.saleId,
                    driverId: this.driverId || undefined,
                    deliveryAddress: this.deliveryAddress.trim() || undefined,
                    deliveryLatitude: this.deliveryLat ?? undefined,
                    deliveryLongitude: this.deliveryLng ?? undefined,
                    scheduledDate: this.scheduledDate || undefined,
                    notes: this.notes.trim() || undefined,
                    customerName: this.customerName.trim() || undefined,
                    customerPhone: this.customerPhone.trim() || undefined
                },
                idempotencyKey: crypto.randomUUID(),
                display: {
                    saleCode: this.selectedSale.saleCode,
                    customerName: this.customerName.trim() || this.selectedSale.customerName,
                    customerPhone: this.customerPhone.trim() || undefined,
                    deliveryAddress: this.deliveryAddress.trim() || undefined,
                    scheduledDate: this.scheduledDate || undefined,
                    driverName: this.drivers.find((d) => d.driverId === this.driverId)?.driverName
                }
            });
            return true;
        }
    }
});
