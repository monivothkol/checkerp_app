/**
 * Config-driven module screens (CAT/BRD/UNT/INV ...).
 * One config per module drives the generic List / Create / Confirm / Result /
 * Detail screens — adding a module = adding a config + 5 thin wrapper views.
 */
import CustomerCreditModal from "@/views/POS/CUS/CustomerCreditModal.vue";
import CustomerSalesTab from "@/views/POS/CUS/CustomerSalesTab.vue";
import CustomerReturnsTab from "@/views/POS/CUS/CustomerReturnsTab.vue";
import CustomerStatementTab from "@/views/POS/CUS/CustomerStatementTab.vue";

export interface ModuleField {
    key: string;
    label: string;              // English fallback
    labelKey?: string;          // i18n sub-key within the screen id, e.g. "FIELD_NAME"
    type?: "input" | "textarea" | "number" | "select" | "multiselect" | "date" | "phones" | "addresses" | "images" | "customFields" | "variants" | "switch";
    required?: boolean;
    /** Initial value on the create screen (e.g. true for a switch). */
    defaultValue?: unknown;
    placeholder?: string;
    // select / multiselect only — static options, or a list trCode to load them from.
    options?: { value: string; label: string }[];
    optionsTr?: string;         // e.g. "DPM10000"
    optionsListKey?: string;    // payload key holding the rows, e.g. "departmentList"
    optionValueKey?: string;    // row key used as the stored value, e.g. "departmentId"
    optionLabelKey?: string;    // row key shown to the user, e.g. "departmentName"
}

/** A filter in the list screen's filter bar; its value is sent as `key` in the list request. */
export interface ModuleListFilter {
    key: string;                // request body param (for dateRange: local model key only)
    labelKey: string;           // i18n sub-key within listTr, used as the placeholder
    type?: "select" | "dateRange";
    // dateRange only — request params for the two bounds (YYYY-MM-DD strings).
    fromKey?: string;
    toKey?: string;
    // Static options, or a list trCode to load them from (same shape as ModuleField selects).
    options?: { value: string | boolean; label: string; labelKey?: string }[];
    optionsTr?: string;
    optionsListKey?: string;
    optionValueKey?: string;
    optionLabelKey?: string;
}

export interface ModuleColumn {
    title: string;              // English fallback
    titleKey?: string;          // i18n sub-key within the screen id, e.g. "COL_NAME"
    key: string;
    dataIndex: string;
    width?: number;
    align?: "left" | "center" | "right";
    type?: string;              // GRD column type, e.g. "Currency" / "Date"
    render?: "tag";             // display the cell value as a pill
}

export interface ModuleScreenConfig {
    module: string;
    entityLabel: string;
    description: string;
    idKey: string;
    codeKey: string;
    nameKey: string;
    listKey: string;
    listTr: string;
    createTr: string;
    detailTr: string;
    confirmTr?: string;         // i18n ns for the confirm screen (default <module>30000)
    resultTr?: string;          // i18n ns for the result screen (default <module>40000)
    // Modules whose registry has no result screen: confirm lands on the detail
    // of the row it just created instead of a result screen.
    skipResult?: boolean;
    updateTr?: string;          // update screen/trCode; presence enables the list Edit button
    deleteTr?: string;          // delete screen/trCode; presence enables the list Delete button
    // API trCodes. The *Tr fields above are SCREEN ids and double as the i18n
    // namespace, so a module on the <SCREENID>Innn API convention cannot reuse
    // them as trCodes. These carry the real trCode; each falls back to its
    // screen id, so modules not yet converted need no config change at all.
    listApi?: string;
    createApi?: string;
    detailApi?: string;
    updateApi?: string;
    deleteApi?: string;
    // One trCode that returns the detail PLUS every dropdown list the edit form
    // needs (each under its optionsListKey), so the modal opens in a single call
    // instead of detail + one request per select. Falls back to separate calls.
    editContextTr?: string;
    listRoute: string;
    createRoute: string;
    confirmRoute: string;
    resultRoute: string;
    detailRoute: string;
    columns: ModuleColumn[];
    /** Optional dropdown filters shown next to the keyword search. */
    listFilters?: ModuleListFilter[];
    fields: ModuleField[];
    detailFields: { key: string; label: string; labelKey?: string }[];
    /** Optional list sections under the detail dl (e.g. a customer's saved addresses). */
    detailLists?: {
        key: string;                                     // array property on the detail response
        titleKey: string;                                // i18n sub-key within detailTr
        columns: { key: string; labelKey: string; type?: "map" }[];
    }[];
    /** Extra per-row actions (rendered in the action column) that open a modal built from the record. */
    rowActions?: ModuleRowAction[];
    /** Actions on the detail screen (rendered as buttons) that open a modal built from the loaded detail. */
    detailActions?: ModuleRowAction[];
    /** Extra tabs on the detail screen. The "Detail" tab is always first; each entry
     *  renders `component` in its own tab, receiving the loaded detail via a `detail` prop
     *  (plus any static `props`). Lazily mounted on activation. */
    detailTabs?: ModuleDetailTab[];
}

/** A custom detail-screen tab: a component fed the loaded detail record (+ optional static props). */
export interface ModuleDetailTab {
    key: string;
    labelKey: string;                                        // i18n sub-key within detailTr
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: Record<string, any>;
}

/** A custom per-row action: opens `component` (a modal) with props derived from the record. */
export interface ModuleRowAction {
    key: string;
    labelKey: string;                                        // i18n sub-key within the list screen (listTr)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: (record: Record<string, any>) => Record<string, any>;
}

function routes(prefix: string) {
    return {
        listRoute: `/${prefix}10000`,
        createRoute: `/${prefix}20000`,
        confirmRoute: `/${prefix}30000`,
        resultRoute: `/${prefix}40000`,
        detailRoute: `/${prefix}50000`,
        listTr: `${prefix}10000`,
        createTr: `${prefix}20000`,
        detailTr: `${prefix}50000`
    };
}

/**
 * Screen-registry numbering: thousands digit = sub-feature, hundreds = screen
 * (list 0, create 1, confirm 2, result 3, detail 4). E.g. CUS sub 2 (Customer
 * Group) -> CUS20000/21000/22000/23000/24000. Legacy modules still use routes().
 */
function subRoutes(prefix: string, sub: number) {
    const base = (screen: number) => `${prefix}${sub}${screen}000`;
    return {
        listRoute: `/${base(0)}`,
        createRoute: `/${base(1)}`,
        confirmRoute: `/${base(2)}`,
        resultRoute: `/${base(3)}`,
        detailRoute: `/${base(4)}`,
        listTr: base(0),
        createTr: base(1),
        confirmTr: base(2),
        resultTr: base(3),
        detailTr: base(4)
    };
}

/** Field types laid out full width on full-page forms. */
export const WIDE_FIELD_TYPES = new Set(["textarea", "images", "customFields", "variants", "addresses", "phones"]);

/**
 * Marks required fields the way UT.validate reads them (b-* component attribute inputType = "M").
 * Call after the form's inputs are rendered; refs inside v-for arrive as arrays.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function markRequiredFields(vm: { $refs: Record<string, any> }, fields: ModuleField[]): void {
    for (const field of fields) {
        const ref = vm.$refs[field.key];
        const input = Array.isArray(ref) ? ref[0] : ref;
        if (field.required && typeof input?.setAttribute === "function") {
            input.setAttribute("inputType", "M");
            input.setRequired?.(true);
        }
    }
}

/** a-col breakpoints for full-page forms: 3 per row large, 2 medium, 1 small; wide types span the row. */
export function formColProps(field: ModuleField): Record<string, number> {
    return WIDE_FIELD_TYPES.has(field.type ?? "") ? { span: 24 } : { xs: 24, md: 12, lg: 8 };
}
/** Field types whose form value is a list. */
/**
 * The body a create/edit form sends: the variants editor keeps its draft under one
 * form key, but the API takes `attributeList`/`variantList` at the top level.
 */
export function submitBody(form: Record<string, unknown>): Record<string, unknown> {
    const { variants, ...rest } = form;
    return variants ? { ...rest, ...(variants as Record<string, unknown>) } : rest;
}

export const LIST_FIELD_TYPES = new Set(["addresses", "multiselect", "customFields"]);
/** Field types that need a picklist (static options or optionsTr). */
export const OPTION_FIELD_TYPES = new Set(["select", "multiselect", "customFields"]);

export const MODULE_CONFIGS: Record<string, ModuleScreenConfig> = {
    // PRD is a bespoke screen set; this entry only powers the generic edit
    // modal + delete confirm on PRD10000 (routes stay the bespoke views).
    PRD: {
        module: "PRD",
        entityLabel: "Product",
        description: "Products",
        idKey: "productId",
        codeKey: "productCode",
        nameKey: "productName",
        listKey: "productList",
        ...routes("PRD"),
        updateTr: "PRD50000",
        deleteTr: "PRD10000",
        listApi: "PRD10000I01",
        createApi: "PRD20000I01",
        detailApi: "PRD50000I01",
        updateApi: "PRD50000I02",
        deleteApi: "PRD10000I02",
        columns: [],
        fields: [
            { key: "productName", label: "Product Name", required: true },
            { key: "productCodeSecondary", label: "Secondary Code" },
            { key: "barcode", label: "Barcode" },
            { key: "productSize", label: "Size" },
            { key: "sellingPrice", label: "Selling Price", type: "number", required: true },
            { key: "costPrice", label: "Cost Price", type: "number" },
            { key: "wholesalePrice", label: "Wholesale Price", type: "number" },
            { key: "minSellingPrice", label: "Min Selling Price", type: "number" },
            { key: "categoryId", label: "Category", type: "select", optionsTr: "CAT10000I01",
              optionsListKey: "categoryList", optionValueKey: "categoryId", optionLabelKey: "categoryName" },
            { key: "brandId", label: "Brand", type: "select", optionsTr: "BRD10000I01",
              optionsListKey: "brandList", optionValueKey: "brandId", optionLabelKey: "brandName" },
            { key: "unitId", label: "Unit", type: "select", optionsTr: "UNT10000I01",
              optionsListKey: "unitList", optionValueKey: "unitId", optionLabelKey: "unitName" },
            { key: "taxId", label: "Tax", type: "select", optionsTr: "TAX10000I01",
              optionsListKey: "taxList", optionValueKey: "taxId", optionLabelKey: "taxName" },
            { key: "reorderPoint", label: "Reorder Point", type: "number" },
            { key: "reorderQuantity", label: "Reorder Quantity", type: "number" },
            { key: "isTrackInventory", label: "Track Inventory", type: "switch", defaultValue: true },
            { key: "slug", label: "Slug (storefront URL)" },
            { key: "attachmentFile", label: "Attachment URL" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "images", label: "Images", type: "images" },
            { key: "customFields", label: "Custom Fields", type: "customFields", optionsTr: "PRD13000I01",
              optionsListKey: "fieldList", optionValueKey: "fieldId", optionLabelKey: "label" },
            { key: "variants", label: "Variants", type: "variants" }
        ],
        detailFields: []
    },
    CAT: {
        module: "CAT",
        entityLabel: "Category",
        description: "To view category detail, create and organize your product categories.",
        idKey: "categoryId",
        codeKey: "categoryCode",
        nameKey: "categoryName",
        listKey: "categoryList",
        ...routes("CAT"),
        updateTr: "CAT50000",
        deleteTr: "CAT10000",
        listApi: "CAT10000I01",
        createApi: "CAT20000I01",
        detailApi: "CAT50000I01",
        updateApi: "CAT50000I02",
        deleteApi: "CAT10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "categoryCode", dataIndex: "categoryCode", width: 140 },
            { title: "Category Name", titleKey: "COL_NAME", key: "categoryName", dataIndex: "categoryName" },
            { title: "Sort Order", titleKey: "COL_SORT_ORDER", key: "sortOrder", dataIndex: "sortOrder", width: 110 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "categoryName", labelKey: "FIELD_NAME", label: "Category Name", required: true, placeholder: "e.g. Drinks" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" },
            { key: "sortOrder", labelKey: "FIELD_SORT_ORDER", label: "Sort Order", type: "number" }
        ],
        detailFields: [
            { key: "categoryCode", label: "Code" },
            { key: "categoryName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "sortOrder", labelKey: "FIELD_SORT_ORDER", label: "Sort Order" },
            { key: "isActive", label: "Active" }
        ]
    },
    BRD: {
        module: "BRD",
        entityLabel: "Brand",
        description: "To view brand detail, create and manage the brands you sell.",
        idKey: "brandId",
        codeKey: "brandCode",
        nameKey: "brandName",
        listKey: "brandList",
        ...routes("BRD"),
        updateTr: "BRD50000",
        deleteTr: "BRD10000",
        listApi: "BRD10000I01",
        createApi: "BRD20000I01",
        detailApi: "BRD50000I01",
        updateApi: "BRD50000I02",
        deleteApi: "BRD10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "brandCode", dataIndex: "brandCode", width: 140 },
            { title: "Brand Name", titleKey: "COL_NAME", key: "brandName", dataIndex: "brandName" },
            { title: "Website", titleKey: "COL_WEBSITE", key: "website", dataIndex: "website", width: 220 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "brandName", labelKey: "FIELD_NAME", label: "Brand Name", required: true, placeholder: "e.g. Angkor" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" },
            { key: "logoUrl", labelKey: "FIELD_LOGO_URL", label: "Logo URL" },
            { key: "website", labelKey: "FIELD_WEBSITE", label: "Website", placeholder: "https://" }
        ],
        detailFields: [
            { key: "brandCode", label: "Code" },
            { key: "brandName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "logoUrl", labelKey: "FIELD_LOGO_URL", label: "Logo URL" },
            { key: "website", labelKey: "FIELD_WEBSITE", label: "Website" },
            { key: "isActive", label: "Active" }
        ]
    },
    UNT: {
        module: "UNT",
        entityLabel: "Product Unit",
        description: "Units of measure used by your products (Piece, Box, Kilogram ...).",
        idKey: "unitId",
        codeKey: "unitCode",
        nameKey: "unitName",
        listKey: "unitList",
        ...routes("UNT"),
        updateTr: "UNT50000",
        deleteTr: "UNT10000",
        listApi: "UNT10000I01",
        createApi: "UNT20000I01",
        detailApi: "UNT50000I01",
        updateApi: "UNT50000I02",
        deleteApi: "UNT10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "unitCode", dataIndex: "unitCode", width: 140 },
            { title: "Unit Name", titleKey: "COL_NAME", key: "unitName", dataIndex: "unitName" },
            { title: "Description", titleKey: "COL_DESCRIPTION", key: "description", dataIndex: "description" },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "unitName", labelKey: "FIELD_NAME", label: "Unit Name", required: true, placeholder: "e.g. Bottle" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" }
        ],
        detailFields: [
            { key: "unitCode", label: "Code" },
            { key: "unitName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "isActive", label: "Active" }
        ]
    },
    INV: {
        module: "INV",
        entityLabel: "Inventory",
        description: "Warehouses and stock locations for this company.",
        idKey: "inventoryId",
        codeKey: "inventoryCode",
        nameKey: "inventoryName",
        listKey: "inventoryList",
        ...routes("INV"),
        updateTr: "INV50000",
        deleteTr: "INV10000",
        listApi: "INV10000I01",
        createApi: "INV20000I01",
        detailApi: "INV50000I01",
        updateApi: "INV50000I02",
        deleteApi: "INV10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "inventoryCode", dataIndex: "inventoryCode", width: 140 },
            { title: "Inventory Name", titleKey: "COL_NAME", key: "inventoryName", dataIndex: "inventoryName" },
            { title: "Type", titleKey: "COL_TYPE", key: "inventoryType", dataIndex: "inventoryType", width: 140 },
            { title: "City", titleKey: "COL_CITY", key: "city", dataIndex: "city", width: 150 },
            { title: "Default", titleKey: "COL_DEFAULT", key: "isDefault", dataIndex: "isDefault", width: 100 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "inventoryName", labelKey: "FIELD_NAME", label: "Inventory Name", required: true, placeholder: "e.g. Main Warehouse" },
            { key: "inventoryType", labelKey: "FIELD_TYPE", label: "Type", placeholder: "e.g. WAREHOUSE" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address", type: "textarea" },
            { key: "city", labelKey: "FIELD_CITY", label: "City" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "personInCharge", labelKey: "FIELD_PERSON_IN_CHARGE", label: "Person In Charge" }
        ],
        detailFields: [
            { key: "inventoryCode", label: "Code" },
            { key: "inventoryName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "inventoryType", labelKey: "FIELD_TYPE", label: "Type" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address" },
            { key: "city", labelKey: "FIELD_CITY", label: "City" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "personInCharge", labelKey: "FIELD_PERSON_IN_CHARGE", label: "Person In Charge" },
            { key: "isDefault", label: "Default" },
            { key: "isActive", label: "Active" }
        ]
    },
    CUS: {
        module: "CUS",
        entityLabel: "Customer",
        description: "View, create and manage your customers.",
        idKey: "customerId",
        codeKey: "customerCode",
        nameKey: "customerName",
        listKey: "customerList",
        ...subRoutes("CUS", 1),
        updateTr: "CUS14000",
        deleteTr: "CUS10000",
        listApi: "CUS10000I01",
        createApi: "CUS11000I01",
        detailApi: "CUS14000I01",
        updateApi: "CUS14000I02",
        deleteApi: "CUS10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "customerCode", dataIndex: "customerCode", width: 140 },
            { title: "Customer Name", titleKey: "COL_NAME", key: "customerName", dataIndex: "customerName" },
            { title: "Type", titleKey: "COL_TYPE", key: "customerType", dataIndex: "customerType", width: 130, render: "tag" },
            { title: "Phone", titleKey: "COL_PHONE", key: "phone", dataIndex: "phone", width: 150 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 160 }
        ],
        listFilters: [
            { key: "customerType", labelKey: "COL_TYPE", options: [
                { value: "MEMBERSHIP", label: "Membership" },
                { value: "WALK_IN", label: "Walk-in" },
                { value: "ONLINE_ORDER", label: "Online Order" },
                { value: "INDIVIDUAL", label: "Individual" },
                { value: "BUSINESS", label: "Business" }
            ] },
            { key: "isActive", labelKey: "STATUS", options: [
                { value: true, label: "Active", labelKey: "ACTIVE" },
                { value: false, label: "Inactive", labelKey: "INACTIVE" }
            ] },
            { key: "customerGroupId", labelKey: "FILTER_GROUP",
              optionsTr: "CUS20000I01", optionsListKey: "groupList",
              optionValueKey: "groupId", optionLabelKey: "groupName" },
            { key: "customerSellType", labelKey: "FILTER_SELL_TYPE", options: [
                { value: "retail", label: "Retail" },
                { value: "wholesale", label: "Wholesale" }
            ] },
            { key: "created", labelKey: "FILTER_CREATED", type: "dateRange",
              fromKey: "fromDate", toKey: "toDate" }
        ],
        detailLists: [
            {
                key: "deliveryAddresses",
                titleKey: "SEC_ADDRESSES",
                columns: [
                    { key: "label", labelKey: "COL_ADDR_LABEL" },
                    { key: "address", labelKey: "COL_ADDR_ADDRESS" },
                    { key: "isDefault", labelKey: "COL_ADDR_DEFAULT" },
                    { key: "map", labelKey: "COL_ADDR_MAP", type: "map" }
                ]
            }
        ],
        detailActions: [
            {
                key: "credit",
                labelKey: "CREDIT",
                component: CustomerCreditModal,
                props: (r) => ({ customerId: r.customerId, customerName: r.customerName })
            }
        ],
        detailTabs: [
            { key: "sale", labelKey: "TAB_SALE", component: CustomerSalesTab },
            { key: "unpaid", labelKey: "TAB_UNPAID", component: CustomerSalesTab, props: { unpaidOnly: true } },
            { key: "return", labelKey: "TAB_RETURN", component: CustomerReturnsTab },
            { key: "statement", labelKey: "TAB_STATEMENT", component: CustomerStatementTab }
        ],
        fields: [
            { key: "customerName", labelKey: "FIELD_NAME", label: "Customer Name", required: true, placeholder: "e.g. John Doe" },
            { key: "customerType", labelKey: "FIELD_TYPE", label: "Type", placeholder: "INDIVIDUAL / BUSINESS" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone", type: "phones" },
            { key: "customerGroupId", labelKey: "FIELD_GROUP", label: "Customer Group", type: "select",
              optionsTr: "CUS20000I01", optionsListKey: "groupList",
              optionValueKey: "groupId", optionLabelKey: "groupName" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address", type: "textarea" },
            { key: "deliveryAddresses", labelKey: "FIELD_DELIVERY_ADDRESSES", label: "Delivery Addresses", type: "addresses" }
        ],
        detailFields: [
            { key: "customerCode", labelKey: "CODE", label: "Code" },
            { key: "customerName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "nameKhmer", labelKey: "FIELD_KHMER_NAME", label: "Khmer Name" },
            { key: "customerType", labelKey: "FIELD_TYPE", label: "Type" },
            { key: "customerSellType", labelKey: "FIELD_SELL_TYPE", label: "Sell Type" },
            { key: "customerGroupName", labelKey: "FIELD_GROUP", label: "Customer Group" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address" },
            { key: "membershipNumber", labelKey: "FIELD_MEMBERSHIP_NO", label: "Membership No." },
            { key: "membershipTier", labelKey: "FIELD_TIER", label: "Tier" },
            { key: "membershipPoints", labelKey: "FIELD_POINTS", label: "Points" },
            { key: "totalPurchases", labelKey: "FIELD_TOTAL_PURCHASES", label: "Total Purchases" },
            { key: "creditPolicyName", labelKey: "FIELD_CREDIT_POLICY", label: "Credit Policy" },
            { key: "creditLimitOverride", labelKey: "FIELD_CREDIT_LIMIT", label: "Credit Limit Override" },
            { key: "creditTermOverride", labelKey: "FIELD_CREDIT_TERM", label: "Credit Term Override" },
            { key: "maxOverdueOverride", labelKey: "FIELD_MAX_OVERDUE", label: "Max Overdue Override" },
            { key: "isActive", labelKey: "STATUS", label: "Active" },
            { key: "createdAt", labelKey: "FIELD_CREATED", label: "Created" },
            { key: "createdByName", labelKey: "FIELD_CREATED_BY", label: "Created By" },
            { key: "updatedAt", labelKey: "FIELD_UPDATED", label: "Updated" },
            { key: "updatedByName", labelKey: "FIELD_UPDATED_BY", label: "Updated By" }
        ]
    },
    CUSG: {
        module: "CUSG",
        entityLabel: "Customer Group",
        description: "Group customers for pricing, credit and reporting.",
        idKey: "groupId",
        codeKey: "groupCode",
        nameKey: "groupName",
        listKey: "groupList",
        ...subRoutes("CUS", 2),
        updateTr: "CUS24000",
        deleteTr: "CUS20000",
        listApi: "CUS20000I01",
        createApi: "CUS21000I01",
        detailApi: "CUS24000I01",
        updateApi: "CUS24000I02",
        deleteApi: "CUS20000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "groupCode", dataIndex: "groupCode", width: 140 },
            { title: "Group Name", titleKey: "COL_NAME", key: "groupName", dataIndex: "groupName" },
            { title: "Customers", titleKey: "COL_CUSTOMERS", key: "customerCount", dataIndex: "customerCount", width: 110, align: "right" },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "groupName", labelKey: "FIELD_NAME", label: "Group Name", required: true, placeholder: "e.g. VIP" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" }
        ],
        detailFields: [
            { key: "groupCode", label: "Code" },
            { key: "groupName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "customerCount", labelKey: "FIELD_CUSTOMERS", label: "Customers" },
            { key: "isActive", label: "Active" }
        ]
    },
    SUP: {
        module: "SUP",
        entityLabel: "Supplier",
        description: "View, create and manage your suppliers.",
        idKey: "supplierId",
        codeKey: "supplierCode",
        nameKey: "contactName",
        listKey: "supplierList",
        ...routes("SUP"),
        updateTr: "SUP50000",
        deleteTr: "SUP10000",
        listApi: "SUP10000I01",
        createApi: "SUP20000I01",
        detailApi: "SUP50000I01",
        updateApi: "SUP50000I02",
        deleteApi: "SUP10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "supplierCode", dataIndex: "supplierCode", width: 140 },
            { title: "Contact Name", titleKey: "COL_NAME", key: "contactName", dataIndex: "contactName" },
            { title: "Phone", titleKey: "COL_PHONE", key: "phone", dataIndex: "phone", width: 150 },
            { title: "Email", titleKey: "COL_EMAIL", key: "email", dataIndex: "email", width: 200 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "contactName", labelKey: "FIELD_NAME", label: "Contact Name", required: true, placeholder: "e.g. Angkor Supply Co." },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "taxNumber", labelKey: "FIELD_TAX", label: "Tax Number" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address", type: "textarea" },
            { key: "remark", labelKey: "FIELD_REMARK", label: "Remark", type: "textarea" }
        ],
        detailFields: [
            { key: "supplierCode", label: "Code" },
            { key: "contactName", labelKey: "FIELD_NAME", label: "Contact Name" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "taxNumber", labelKey: "FIELD_TAX", label: "Tax Number" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address" },
            { key: "remark", labelKey: "FIELD_REMARK", label: "Remark" },
            { key: "isActive", label: "Active" }
        ]
    },
    DPM: {
        module: "DPM",
        entityLabel: "Department",
        description: "View, create and organize your departments.",
        idKey: "departmentId",
        codeKey: "departmentCode",
        nameKey: "departmentName",
        listKey: "departmentList",
        ...routes("DPM"),
        updateTr: "DPM50000",
        deleteTr: "DPM10000",
        listApi: "DPM10000I01",
        createApi: "DPM20000I01",
        detailApi: "DPM50000I01",
        updateApi: "DPM50000I02",
        deleteApi: "DPM10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "departmentCode", dataIndex: "departmentCode", width: 140 },
            { title: "Department Name", titleKey: "COL_NAME", key: "departmentName", dataIndex: "departmentName" },
            { title: "Khmer Name", titleKey: "COL_NAME_KHMER", key: "nameKhmer", dataIndex: "nameKhmer", width: 180 },
            { title: "Staff", titleKey: "COL_STAFF_COUNT", key: "staffCount", dataIndex: "staffCount", width: 90, align: "right" },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "departmentName", labelKey: "FIELD_NAME", label: "Department Name", required: true, placeholder: "e.g. Sales" },
            { key: "nameKhmer", labelKey: "FIELD_NAME_KHMER", label: "Khmer Name", placeholder: "e.g. ផ្នែកលក់" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" }
        ],
        detailFields: [
            { key: "departmentCode", label: "Code" },
            { key: "departmentName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "nameKhmer", labelKey: "FIELD_NAME_KHMER", label: "Khmer Name" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "parentDepartmentName", labelKey: "FIELD_PARENT", label: "Parent Department" },
            { key: "managerName", labelKey: "FIELD_MANAGER", label: "Manager" },
            { key: "staffCount", labelKey: "FIELD_STAFF_COUNT", label: "Active Staff" },
            { key: "isActive", label: "Active" }
        ]
    },
    TAX: {
        module: "TAX",
        entityLabel: "Tax",
        description: "Tax rates applied to sales and purchases. Prices are tax-exclusive unless Sales Setting says otherwise.",
        idKey: "taxId",
        codeKey: "taxCode",
        nameKey: "taxName",
        listKey: "taxList",
        ...routes("TAX"),
        updateTr: "TAX50000",
        deleteTr: "TAX10000",
        listApi: "TAX10000I01",
        createApi: "TAX20000I01",
        detailApi: "TAX50000I01",
        updateApi: "TAX50000I02",
        deleteApi: "TAX10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "taxCode", dataIndex: "taxCode", width: 120 },
            { title: "Tax Name", titleKey: "COL_NAME", key: "taxName", dataIndex: "taxName" },
            { title: "Rate (%)", titleKey: "COL_RATE", key: "rate", dataIndex: "rate", width: 110, align: "right" },
            { title: "Applies To", titleKey: "COL_APPLIES_TO", key: "appliesTo", dataIndex: "appliesTo", width: 120, render: "tag" },
            { title: "Default", titleKey: "COL_DEFAULT", key: "isDefault", dataIndex: "isDefault", width: 90 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "taxCode", labelKey: "FIELD_CODE", label: "Tax Code", required: true, placeholder: "e.g. VAT10" },
            { key: "taxName", labelKey: "FIELD_NAME", label: "Tax Name", required: true, placeholder: "e.g. VAT 10%" },
            { key: "rate", labelKey: "FIELD_RATE", label: "Rate (%)", type: "number", required: true },
            { key: "appliesTo", labelKey: "FIELD_APPLIES_TO", label: "Applies To", type: "select", defaultValue: "BOTH",
              options: [{ value: "BOTH", label: "Sales & Purchases" }, { value: "SALES", label: "Sales only" }, { value: "PURCHASE", label: "Purchases only" }] },
            { key: "isDefault", labelKey: "FIELD_DEFAULT", label: "Use as default", type: "switch", defaultValue: false }
        ],
        detailFields: [
            { key: "taxCode", labelKey: "FIELD_CODE", label: "Code" },
            { key: "taxName", labelKey: "FIELD_NAME", label: "Tax Name" },
            { key: "rate", labelKey: "FIELD_RATE", label: "Rate (%)" },
            { key: "appliesTo", labelKey: "FIELD_APPLIES_TO", label: "Applies To" },
            { key: "isDefault", labelKey: "FIELD_DEFAULT", label: "Default" },
            { key: "isActive", label: "Active" }
        ]
    },
    PSM: {
        module: "PSM",
        entityLabel: "Position",
        description: "View, create and manage job positions.",
        idKey: "positionId",
        codeKey: "positionCode",
        nameKey: "positionName",
        listKey: "positionList",
        ...routes("PSM"),
        updateTr: "PSM50000",
        deleteTr: "PSM10000",
        listApi: "PSM10000I01",
        createApi: "PSM20000I01",
        detailApi: "PSM50000I01",
        updateApi: "PSM50000I02",
        deleteApi: "PSM10000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "positionCode", dataIndex: "positionCode", width: 140 },
            { title: "Position Name", titleKey: "COL_NAME", key: "positionName", dataIndex: "positionName" },
            { title: "Department", titleKey: "COL_DEPARTMENT", key: "departmentName", dataIndex: "departmentName", width: 180 },
            { title: "Salary Grade", titleKey: "COL_GRADE", key: "salaryGrade", dataIndex: "salaryGrade", width: 120 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "positionName", labelKey: "FIELD_NAME", label: "Position Name", required: true, placeholder: "e.g. Cashier" },
            { key: "nameKhmer", labelKey: "FIELD_NAME_KHMER", label: "Khmer Name", placeholder: "e.g. អ្នកគិតលុយ" },
            {
                key: "departmentId", labelKey: "FIELD_DEPARTMENT", label: "Department", type: "select",
                optionsTr: "DPM10000I01", optionsListKey: "departmentList",
                optionValueKey: "departmentId", optionLabelKey: "departmentName"
            },
            { key: "salaryGrade", labelKey: "FIELD_GRADE", label: "Salary Grade", placeholder: "e.g. G3" },
            { key: "minSalary", labelKey: "FIELD_MIN_SALARY", label: "Min Salary", type: "number" },
            { key: "maxSalary", labelKey: "FIELD_MAX_SALARY", label: "Max Salary", type: "number" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description", type: "textarea" }
        ],
        detailFields: [
            { key: "positionCode", label: "Code" },
            { key: "positionName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "nameKhmer", labelKey: "FIELD_NAME_KHMER", label: "Khmer Name" },
            { key: "departmentName", labelKey: "FIELD_DEPARTMENT", label: "Department" },
            { key: "salaryGrade", labelKey: "FIELD_GRADE", label: "Salary Grade" },
            { key: "minSalary", labelKey: "FIELD_MIN_SALARY", label: "Min Salary" },
            { key: "maxSalary", labelKey: "FIELD_MAX_SALARY", label: "Max Salary" },
            { key: "description", labelKey: "FIELD_DESCRIPTION", label: "Description" },
            { key: "isActive", label: "Active" }
        ]
    },
    STM: {
        module: "STM",
        entityLabel: "Staff",
        description: "View, create and manage your staff members.",
        idKey: "staffId",
        codeKey: "staffCode",
        nameKey: "staffName",
        listKey: "staffList",
        ...routes("STM"),
        updateTr: "STM50000",
        deleteTr: "STM10000",
        listApi: "STM10000I01",
        createApi: "STM20000I01",
        detailApi: "STM50000I01",
        updateApi: "STM50000I02",
        deleteApi: "STM10000I02",
        editContextTr: "STM50000I03",
        columns: [
            { title: "Code", titleKey: "CODE", key: "staffCode", dataIndex: "staffCode", width: 130 },
            { title: "Name", titleKey: "COL_NAME", key: "staffName", dataIndex: "staffName" },
            { title: "Nickname", titleKey: "COL_NICKNAME", key: "nickname", dataIndex: "nickname", width: 130 },
            { title: "Phone", titleKey: "COL_PHONE", key: "phone", dataIndex: "phone", width: 140 },
            { title: "Department", titleKey: "COL_DEPARTMENT", key: "departmentName", dataIndex: "departmentName", width: 160 },
            { title: "Position", titleKey: "COL_POSITION", key: "positionName", dataIndex: "positionName", width: 160 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "firstName", labelKey: "FIELD_FIRST_NAME", label: "First Name", required: true, placeholder: "e.g. Dara" },
            { key: "lastName", labelKey: "FIELD_LAST_NAME", label: "Last Name", placeholder: "e.g. Kim" },
            { key: "firstNameKhmer", labelKey: "FIELD_FIRST_NAME_KHMER", label: "First Name (Khmer)" },
            { key: "lastNameKhmer", labelKey: "FIELD_LAST_NAME_KHMER", label: "Last Name (Khmer)" },
            { key: "nickname", labelKey: "FIELD_NICKNAME", label: "Nickname" },
            {
                key: "gender", labelKey: "FIELD_GENDER", label: "Gender", type: "select",
                options: [
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" }
                ]
            },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            {
                key: "departmentId", labelKey: "FIELD_DEPARTMENT", label: "Department", type: "select",
                optionsTr: "DPM10000I01", optionsListKey: "departmentList",
                optionValueKey: "departmentId", optionLabelKey: "departmentName"
            },
            {
                key: "positionId", labelKey: "FIELD_POSITION", label: "Position", type: "select",
                optionsTr: "PSM10000I01", optionsListKey: "positionList",
                optionValueKey: "positionId", optionLabelKey: "positionName"
            },
            { key: "salary", labelKey: "FIELD_SALARY", label: "Salary", type: "number" },
            { key: "hireDate", labelKey: "FIELD_HIRE_DATE", label: "Hire Date", type: "date" },
            { key: "dateOfBirth", labelKey: "FIELD_DOB", label: "Date of Birth", type: "date" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address", type: "textarea" },
            { key: "remark", labelKey: "FIELD_REMARK", label: "Remark", type: "textarea" },
            {
                key: "assignedInventoryIds", labelKey: "FIELD_ASSIGNED_INVENTORIES", label: "Assigned Inventories",
                type: "multiselect", optionsTr: "INV10000I01", optionsListKey: "inventoryList",
                optionValueKey: "inventoryId", optionLabelKey: "inventoryName"
            }
        ],
        detailFields: [
            { key: "staffCode", label: "Code" },
            { key: "staffName", labelKey: "FIELD_NAME", label: "Name" },
            { key: "nameKhmer", labelKey: "FIELD_NAME_KHMER", label: "Khmer Name" },
            { key: "nickname", labelKey: "FIELD_NICKNAME", label: "Nickname" },
            { key: "gender", labelKey: "FIELD_GENDER", label: "Gender" },
            { key: "phone", labelKey: "FIELD_PHONE", label: "Phone" },
            { key: "email", labelKey: "FIELD_EMAIL", label: "Email" },
            { key: "departmentName", labelKey: "FIELD_DEPARTMENT", label: "Department" },
            { key: "positionName", labelKey: "FIELD_POSITION", label: "Position" },
            { key: "salary", labelKey: "FIELD_SALARY", label: "Salary" },
            { key: "hireDate", labelKey: "FIELD_HIRE_DATE", label: "Hire Date" },
            { key: "dateOfBirth", labelKey: "FIELD_DOB", label: "Date of Birth" },
            { key: "contractType", labelKey: "FIELD_CONTRACT", label: "Contract Type" },
            { key: "address", labelKey: "FIELD_ADDRESS", label: "Address" },
            { key: "remark", labelKey: "FIELD_REMARK", label: "Remark" },
            { key: "assignedInventoryNames", labelKey: "FIELD_ASSIGNED_INVENTORIES", label: "Assigned Inventories" },
            { key: "isActive", label: "Active" }
        ]
    },
    // Expense master data. Per the screen registry EXP numbers by sub-feature:
    // 1xxxx = expense records, 2xxxx = expense choice/list, 3xxxx = category.
    // Category has no result screen — its detail sits at EXP33000, so it sets
    // skipResult and the confirm screen lands on the detail instead.
    EXPC: {
        module: "EXPC",
        entityLabel: "Expense Category",
        description: "Top-level expense categories — the first of the three expense levels.",
        idKey: "categoryId",
        codeKey: "code",
        nameKey: "name",
        listKey: "categoryList",
        listRoute: "/EXP30000",
        createRoute: "/EXP31000",
        confirmRoute: "/EXP32000",
        resultRoute: "/EXP33000",
        detailRoute: "/EXP33000",
        listTr: "EXP30000",
        createTr: "EXP31000",
        confirmTr: "EXP32000",
        resultTr: "EXP33000",
        detailTr: "EXP33000",
        skipResult: true,
        updateTr: "EXP33000",
        deleteTr: "EXP30000",
        // <SCREENID>Innn API codes; the screen ids above stay the i18n namespaces.
        listApi: "EXP30000I01",
        createApi: "EXP31000I01",
        detailApi: "EXP33000I01",
        updateApi: "EXP33000I02",
        deleteApi: "EXP30000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "code", dataIndex: "code", width: 140 },
            { title: "Category Name", titleKey: "COL_NAME", key: "name", dataIndex: "name" },
            { title: "Account Code", titleKey: "COL_ACCOUNT", key: "defaultAccountCode", dataIndex: "defaultAccountCode", width: 150 },
            { title: "Lists", titleKey: "COL_LISTS", key: "listCount", dataIndex: "listCount", width: 90, align: "right" },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "name", labelKey: "FIELD_NAME", label: "Category Name", required: true, placeholder: "e.g. Utilities" },
            { key: "defaultAccountCode", labelKey: "FIELD_ACCOUNT", label: "Default Account Code", placeholder: "e.g. 6100" }
        ],
        detailFields: [
            { key: "code", label: "Code" },
            { key: "name", labelKey: "FIELD_NAME", label: "Name" },
            { key: "defaultAccountCode", labelKey: "FIELD_ACCOUNT", label: "Default Account Code" },
            { key: "listCount", labelKey: "FIELD_LISTS", label: "Expense Lists" },
            { key: "isActive", label: "Active" }
        ]
    },
    EXPL: {
        module: "EXPL",
        entityLabel: "Expense List",
        description: "Expense sub-types under a category — what an expense record is booked against.",
        idKey: "listId",
        codeKey: "code",
        nameKey: "name",
        listKey: "expenseListList",
        ...subRoutes("EXP", 2),
        updateTr: "EXP24000",
        deleteTr: "EXP20000",
        listApi: "EXP20000I01",
        createApi: "EXP21000I01",
        detailApi: "EXP24000I01",
        updateApi: "EXP24000I02",
        deleteApi: "EXP20000I02",
        columns: [
            { title: "Code", titleKey: "CODE", key: "code", dataIndex: "code", width: 140 },
            { title: "List Name", titleKey: "COL_NAME", key: "name", dataIndex: "name" },
            { title: "Category", titleKey: "COL_CATEGORY", key: "categoryName", dataIndex: "categoryName", width: 200 },
            { title: "Active", titleKey: "STATUS", key: "isActive", dataIndex: "isActive", width: 90 },
            { title: "Action", titleKey: "ACTION", key: "action", dataIndex: "action", width: 90 }
        ],
        fields: [
            { key: "name", labelKey: "FIELD_NAME", label: "List Name", required: true, placeholder: "e.g. Electricity" },
            {
                key: "categoryId", labelKey: "FIELD_CATEGORY", label: "Category", type: "select", required: true,
                optionsTr: "EXP11000I02", optionsListKey: "categoryList",
                optionValueKey: "categoryId", optionLabelKey: "name"
            }
        ],
        detailFields: [
            { key: "code", label: "Code" },
            { key: "name", labelKey: "FIELD_NAME", label: "Name" },
            { key: "categoryName", labelKey: "FIELD_CATEGORY", label: "Category" },
            { key: "isActive", label: "Active" }
        ]
    }
};

const DRAFT_PREFIX = "module-draft:";
const RESULT_PREFIX = "module-result:";

/** Draft passed Create → Confirm; result passed Confirm → Result. */
export const ModuleFlowStore = {
    saveDraft(module: string, draft: Record<string, unknown>) {
        sessionStorage.setItem(DRAFT_PREFIX + module, JSON.stringify(draft));
    },
    loadDraft(module: string): Record<string, any> | null {
        const raw = sessionStorage.getItem(DRAFT_PREFIX + module);
        return raw ? JSON.parse(raw) : null;
    },
    clearDraft(module: string) {
        sessionStorage.removeItem(DRAFT_PREFIX + module);
    },
    saveResult(module: string, result: Record<string, unknown>) {
        sessionStorage.setItem(RESULT_PREFIX + module, JSON.stringify(result));
    },
    loadResult(module: string): Record<string, any> | null {
        const raw = sessionStorage.getItem(RESULT_PREFIX + module);
        return raw ? JSON.parse(raw) : null;
    }
};
