/** Sale-person dropdown source — SIV14000. */

import type { SalePersonLookup } from "@/models/POS/COMMON/lookups";

export type SIV14000Request = Record<string, never>;

export interface SIV14000Response {
    salePersons?: SalePersonLookup[];
}
