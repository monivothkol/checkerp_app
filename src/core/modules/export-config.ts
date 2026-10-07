/**
 * Config-driven export. One entry per module drives the shared ExportModal
 * (field picker, sort, format). `field` must match a backend export-field key.
 */

export interface ExportField {
    field: string;              // backend export-field key
    header: string;             // label shown in the picker
    default?: boolean;          // pre-selected
}

export type ExportFormat = "excel" | "pdf";

export interface ExportConfig {
    trCode: string;             // backend export endpoint, e.g. PRD12000
    entityLabel: string;        // "Products"
    trKey: string;              // i18n screen-id for the title, e.g. "PRD12000"
    formats: ExportFormat[];
    fields: ExportField[];
    dateFilter?: boolean;       // show the All/Today/7d/3m/Custom date range picker
    // Preset the range picker for date-scoped modules. Defaults to "today",
    // which is wrong for anything logged less than daily.
    defaultDateRange?: "all" | "today" | "7d" | "3m" | "custom";
}

export const EXPORT_CONFIGS: Record<string, ExportConfig> = {
    STK: {
        trCode: "STK12000I01",
        entityLabel: "Stock",
        trKey: "STK12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "productCode", header: "Product Code", default: true },
            { field: "productName", header: "Product Name", default: true },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "variantName", header: "Variant", default: true },
            { field: "quantity", header: "Quantity", default: true },
            { field: "availableQuantity", header: "Available", default: true },
            { field: "onHoldStock", header: "On Hold", default: true },
            { field: "averageCost", header: "Avg Cost" }
        ]
    },
    PRD: {
        trCode: "PRD12000I01",
        entityLabel: "Products",
        trKey: "PRD12000",
        formats: ["excel", "pdf"],
        // No date filter on products — set dateFilter: true on modules that need it.
        fields: [
            { field: "productCode", header: "Product Code (SKU)", default: true },
            { field: "productCodeSecondary", header: "Secondary Code" },
            { field: "barcode", header: "Barcode", default: true },
            { field: "productName", header: "Product Name", default: true },
            { field: "categoryName", header: "Category", default: true },
            { field: "brandName", header: "Brand", default: true },
            { field: "unitName", header: "Unit" },
            { field: "sellingPrice", header: "Retail Price", default: true },
            { field: "costPrice", header: "Purchase Cost" },
            { field: "wholesalePrice", header: "Wholesale Price" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    CAT: {
        trCode: "CAT12000I01",
        entityLabel: "Categories",
        trKey: "CAT12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "categoryCode", header: "Category Code", default: true },
            { field: "categoryName", header: "Category Name", default: true },
            { field: "description", header: "Description", default: true },
            { field: "sortOrder", header: "Sort Order" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    BRD: {
        trCode: "BRD12000I01",
        entityLabel: "Brands",
        trKey: "BRD12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "brandCode", header: "Brand Code", default: true },
            { field: "brandName", header: "Brand Name", default: true },
            { field: "description", header: "Description", default: true },
            { field: "website", header: "Website" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    UNT: {
        trCode: "UNT12000I01",
        entityLabel: "Units",
        trKey: "UNT12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "unitCode", header: "Unit Code", default: true },
            { field: "unitName", header: "Unit Name", default: true },
            { field: "description", header: "Description", default: true },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    INV: {
        trCode: "INV12000I01",
        entityLabel: "Inventories",
        trKey: "INV12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "inventoryCode", header: "Inventory Code", default: true },
            { field: "inventoryName", header: "Inventory Name", default: true },
            { field: "inventoryType", header: "Type", default: true },
            { field: "city", header: "City", default: true },
            { field: "country", header: "Country" },
            { field: "phone", header: "Phone" },
            { field: "email", header: "Email" },
            { field: "personInCharge", header: "Person In Charge", default: true },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    CUS: {
        trCode: "CUS16000I01",
        entityLabel: "Customers",
        trKey: "CUS19000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "customerCode", header: "Customer Code", default: true },
            { field: "customerName", header: "Customer Name", default: true },
            { field: "customerType", header: "Type", default: true },
            { field: "phone", header: "Phone", default: true },
            { field: "email", header: "Email", default: true },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    SUP: {
        trCode: "SUP12000I01",
        entityLabel: "Suppliers",
        trKey: "SUP12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "supplierCode", header: "Supplier Code", default: true },
            { field: "contactName", header: "Contact Name", default: true },
            { field: "phone", header: "Phone", default: true },
            { field: "email", header: "Email", default: true },
            { field: "taxNumber", header: "Tax Number" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    DPM: {
        trCode: "DPM12000I01",
        entityLabel: "Departments",
        trKey: "DPM12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "departmentCode", header: "Department Code", default: true },
            { field: "departmentName", header: "Department Name", default: true },
            { field: "nameKhmer", header: "Khmer Name" },
            { field: "description", header: "Description" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    PSM: {
        trCode: "PSM12000I01",
        entityLabel: "Positions",
        trKey: "PSM12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "positionCode", header: "Position Code", default: true },
            { field: "positionName", header: "Position Name", default: true },
            { field: "nameKhmer", header: "Khmer Name" },
            { field: "departmentName", header: "Department", default: true },
            { field: "salaryGrade", header: "Salary Grade" },
            { field: "minSalary", header: "Min Salary" },
            { field: "maxSalary", header: "Max Salary" },
            { field: "isActive", header: "Active", default: true }
        ]
    },
    PO: {
        trCode: "PUR15000I01", entityLabel: "Purchase Orders", trKey: "PUR15000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "poCode", header: "PO No", default: true },
            { field: "supplierName", header: "Supplier", default: true },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "orderDate", header: "Order Date", default: true },
            { field: "expectedDeliveryDate", header: "Expected Delivery" },
            { field: "status", header: "Status", default: true },
            { field: "currency", header: "Currency" },
            { field: "grandTotal", header: "Grand Total", default: true },
            { field: "itemCount", header: "Items" }
        ]
    },
    PIN: {
        trCode: "PUR25000I01", entityLabel: "Purchase-Ins", trKey: "PUR25000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "adjustmentCode", header: "Purchase-In No", default: true },
            { field: "poCode", header: "PO No" },
            { field: "supplierName", header: "Supplier", default: true },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "status", header: "Status", default: true },
            { field: "receivedStatus", header: "Received", default: true },
            { field: "grandTotal", header: "Grand Total", default: true },
            { field: "paidAmount", header: "Paid" },
            { field: "adjustedAt", header: "Date", default: true },
            { field: "itemCount", header: "Items" }
        ]
    },
    STKT: {
        trCode: "STK24000I01", entityLabel: "Stock Transfers", trKey: "STK24000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "transferCode", header: "Transfer No", default: true },
            { field: "fromInventoryName", header: "From", default: true },
            { field: "toInventoryName", header: "To", default: true },
            { field: "status", header: "Status", default: true },
            { field: "notes", header: "Notes" },
            { field: "createdAt", header: "Created", default: true },
            { field: "itemCount", header: "Items" }
        ]
    },
    STKA: {
        trCode: "STK34000I01", entityLabel: "Stock Adjustments", trKey: "STK34000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "adjustmentCode", header: "Adjustment No", default: true },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "reason", header: "Reason", default: true },
            { field: "status", header: "Status", default: true },
            { field: "createdAt", header: "Created", default: true },
            { field: "itemCount", header: "Items" }
        ]
    },
    STKH: {
        trCode: "STK41000I01", entityLabel: "Stock History", trKey: "STK41000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "movementDate", header: "Date", default: true },
            { field: "movementType", header: "Type", default: true },
            { field: "referenceCode", header: "Reference", default: true },
            { field: "productCode", header: "Product Code", default: true },
            { field: "productName", header: "Product Name", default: true },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "quantityChange", header: "Qty Change", default: true }
        ]
    },
    PMM: {
        trCode: "PMM12000I01", entityLabel: "Promotions", trKey: "PMM12000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "all",
        fields: [
            { field: "promotionCode", header: "Code", default: true },
            { field: "promotionName", header: "Name", default: true },
            { field: "promotionType", header: "Type", default: true },
            { field: "applicationType", header: "Applies To" },
            { field: "discountPercentage", header: "Discount %" },
            { field: "discountPrice", header: "Discount Price" },
            { field: "buyQuantity", header: "Buy Qty" },
            { field: "freeQuantity", header: "Free Qty" },
            { field: "activeName", header: "Active", default: true },
            { field: "startDate", header: "Start", default: true },
            { field: "endDate", header: "End", default: true }
        ]
    },
    CUSG: {
        trCode: "CUS25000I01", entityLabel: "Customer Groups", trKey: "CUS25000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "groupCode", header: "Group Code", default: true },
            { field: "groupName", header: "Group Name", default: true },
            { field: "description", header: "Description", default: true },
            { field: "activeName", header: "Active", default: true },
            { field: "customerCount", header: "Customers", default: true }
        ]
    },
    LOY: {
        trCode: "CUS35000I01", entityLabel: "Loyalty Conditions", trKey: "CUS35000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "conditionName", header: "Condition", default: true },
            { field: "conditionType", header: "Type", default: true },
            { field: "conditionValue", header: "Value", default: true },
            { field: "pointReward", header: "Points", default: true },
            { field: "activeName", header: "Active", default: true }
        ]
    },
    CMS: {
        trCode: "RPT83000I01", entityLabel: "Commissions", trKey: "RPT83000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "commissionCode", header: "Code", default: true },
            { field: "startDate", header: "Start", default: true },
            { field: "endDate", header: "End", default: true },
            { field: "criteriaType", header: "Criteria", default: true },
            { field: "inputType", header: "Input Type" },
            { field: "inputValue", header: "Input Value" },
            { field: "totalCommissionAmount", header: "Total Amount", default: true },
            { field: "applyToType", header: "Apply To" },
            { field: "status", header: "Status", default: true },
            { field: "createdAt", header: "Created" },
            { field: "recipientCount", header: "Recipients" }
        ]
    },
    AST: {
        trCode: "AST11000I01", entityLabel: "Assets", trKey: "AST11000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "assetCode", header: "Code", default: true },
            { field: "assetName", header: "Name", default: true },
            { field: "assetType", header: "Type", default: true },
            { field: "assetClass", header: "Class" },
            { field: "purchaseDate", header: "Purchase Date", default: true },
            { field: "cost", header: "Cost", default: true },
            { field: "accumulatedDepreciation", header: "Accumulated Depreciation", default: true },
            { field: "netBookValue", header: "Net Book Value", default: true },
            { field: "depreciationMethod", header: "Method" },
            { field: "usefulLifeMonths", header: "Life (months)" },
            { field: "accountCode", header: "Account" },
            { field: "location", header: "Location" },
            { field: "serialNo", header: "Serial No" },
            { field: "status", header: "Status", default: true }
        ]
    },
    DBT: {
        trCode: "DBT11000I01", entityLabel: "Loans", trKey: "DBT11000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "loanCode", header: "Code", default: true },
            { field: "lenderName", header: "Lender", default: true },
            { field: "lenderType", header: "Lender Type" },
            { field: "principal", header: "Principal", default: true },
            { field: "interestRate", header: "Rate %", default: true },
            { field: "startDate", header: "Start", default: true },
            { field: "termMonths", header: "Term (months)", default: true },
            { field: "monthlyPayment", header: "Monthly Payment" },
            { field: "principalPaid", header: "Principal Paid" },
            { field: "interestPaid", header: "Interest Paid" },
            { field: "outstanding", header: "Outstanding", default: true },
            { field: "status", header: "Status", default: true }
        ]
    },
    IVAL: {
        trCode: "RPT21000I01", entityLabel: "Inventory Valuation", trKey: "RPT21000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "productCode", header: "Product Code", default: true },
            { field: "productName", header: "Product Name", default: true },
            { field: "categoryName", header: "Category" },
            { field: "brandName", header: "Brand" },
            { field: "inventoryName", header: "Inventory", default: true },
            { field: "quantity", header: "Quantity", default: true },
            { field: "costPrice", header: "Cost", default: true },
            { field: "sellingPrice", header: "Price", default: true },
            { field: "stockValueAtCost", header: "Value at Cost", default: true },
            { field: "stockValueAtSelling", header: "Value at Retail", default: true },
            { field: "potentialProfit", header: "Potential Profit", default: true }
        ]
    },
    ATD: {
        trCode: "ATD15000I01", entityLabel: "Attendance", trKey: "ATD15000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "date", header: "Date", default: true },
            { field: "staffCode", header: "Staff Code", default: true },
            { field: "staffName", header: "Staff Name", default: true },
            { field: "checkIn", header: "Check In", default: true },
            { field: "checkOut", header: "Check Out", default: true },
            { field: "breakMinutes", header: "Break (min)" },
            { field: "workedMinutes", header: "Worked (min)", default: true },
            { field: "lateMinutes", header: "Late (min)", default: true },
            { field: "overtimeMinutes", header: "OT (min)" },
            { field: "status", header: "Status", default: true },
            { field: "source", header: "Source" }
        ]
    },
    ATDS: {
        trCode: "ATD35000I01", entityLabel: "Work Schedules", trKey: "ATD35000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "scheduleCode", header: "Code", default: true },
            { field: "name", header: "Name", default: true },
            { field: "startTime", header: "Start", default: true },
            { field: "endTime", header: "End", default: true },
            { field: "breakMinutes", header: "Break (min)", default: true },
            { field: "workingDays", header: "Working Days", default: true },
            { field: "activeName", header: "Active", default: true }
        ]
    },
    LVR: {
        trCode: "LVM15000I01", entityLabel: "Leave Requests", trKey: "LVM15000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "staffCode", header: "Staff Code", default: true },
            { field: "staffName", header: "Staff Name", default: true },
            { field: "leaveTypeName", header: "Leave Type", default: true },
            { field: "startDate", header: "Start", default: true },
            { field: "endDate", header: "End", default: true },
            { field: "totalDays", header: "Days", default: true },
            { field: "status", header: "Status", default: true },
            { field: "reason", header: "Reason" }
        ]
    },
    LVT: {
        trCode: "LVM21000I01", entityLabel: "Leave Types", trKey: "LVM21000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "code", header: "Code", default: true },
            { field: "name", header: "Name", default: true },
            { field: "nameKhmer", header: "Khmer Name" },
            { field: "defaultDaysPerYear", header: "Days/Year", default: true },
            { field: "paidName", header: "Paid", default: true },
            { field: "maxConsecutiveDays", header: "Max Consecutive" },
            { field: "activeName", header: "Active", default: true }
        ]
    },
    HOL: {
        trCode: "LVM31000I01", entityLabel: "Holidays", trKey: "LVM31000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "all",
        fields: [
            { field: "name", header: "Name", default: true },
            { field: "nameKhmer", header: "Khmer Name" },
            { field: "date", header: "Date", default: true },
            { field: "recurringName", header: "Recurring", default: true },
            { field: "year", header: "Year", default: true }
        ]
    },
    USR: {
        trCode: "ADM17000I01", entityLabel: "Users", trKey: "ADM17000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "username", header: "Username", default: true },
            { field: "fullName", header: "Full Name", default: true },
            { field: "email", header: "Email", default: true },
            { field: "phone", header: "Phone" },
            { field: "roleName", header: "Role", default: true },
            { field: "staffName", header: "Staff" },
            { field: "activeName", header: "Active", default: true },
            { field: "lastLoginAt", header: "Last Login" },
            { field: "createdAt", header: "Created" }
        ]
    },
    ROLE: {
        trCode: "ADM26000I01", entityLabel: "Roles", trKey: "ADM26000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "roleCode", header: "Role Code", default: true },
            { field: "roleName", header: "Role Name", default: true },
            { field: "description", header: "Description", default: true },
            { field: "adminName", header: "Admin", default: true },
            { field: "activeName", header: "Active", default: true }
        ]
    },
    FEV: {
        trCode: "ADM81000I01", entityLabel: "Failed Events", trKey: "ADM81000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "eventType", header: "Event Type", default: true },
            { field: "errorMessage", header: "Error", default: true },
            { field: "retryCount", header: "Retries", default: true },
            { field: "status", header: "Status", default: true },
            { field: "createdAt", header: "Created", default: true },
            { field: "resolvedAt", header: "Resolved" }
        ]
    },
    SFM: {
        trCode: "SFM11000I01", entityLabel: "Staff Financials", trKey: "SFM11000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "staffCode", header: "Staff Code", default: true },
            { field: "staffName", header: "Staff Name", default: true },
            { field: "loanBalance", header: "Loan Balance", default: true },
            { field: "advanceBalance", header: "Advance Balance", default: true },
            { field: "depositBalance", header: "Deposit Balance", default: true }
        ]
    },
    PRMR: {
        trCode: "PRM12000I01", entityLabel: "Payroll Runs", trKey: "PRM12000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "all",
        fields: [
            { field: "periodMonth", header: "Period", default: true },
            { field: "departmentName", header: "Department", default: true },
            { field: "status", header: "Status", default: true },
            { field: "currency", header: "Currency" },
            { field: "totalGross", header: "Gross", default: true },
            { field: "totalDeduction", header: "Deductions", default: true },
            { field: "totalNet", header: "Net", default: true },
            { field: "employeeCount", header: "Employees", default: true },
            { field: "finalizedAt", header: "Finalized" },
            { field: "createdAt", header: "Created" }
        ]
    },
    PRMA: {
        trCode: "PRM25000I01", entityLabel: "Salary Adjustments", trKey: "PRM25000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "staffCode", header: "Staff Code", default: true },
            { field: "staffName", header: "Staff Name", default: true },
            { field: "typeName", header: "Type", default: true },
            { field: "category", header: "Category", default: true },
            { field: "amount", header: "Amount", default: true },
            { field: "effectiveMonth", header: "Effective Month", default: true },
            { field: "status", header: "Status", default: true },
            { field: "remark", header: "Remark" },
            { field: "createdAt", header: "Created" }
        ]
    },
    QUOT: {
        trCode: "SAL16000I01", entityLabel: "Quotations", trKey: "SAL16000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "quotationNo", header: "Quotation No", default: true },
            { field: "quotationDate", header: "Date", default: true },
            { field: "customerName", header: "Customer", default: true },
            { field: "totalAmount", header: "Total Amount", default: true },
            { field: "quotationStatusName", header: "Status", default: true }
        ]
    },
    SALR: {
        trCode: "SAL26000I01", entityLabel: "Sale Returns", trKey: "SAL26000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "returnCode", header: "Return No", default: true },
            { field: "saleCode", header: "Invoice No", default: true },
            { field: "customerName", header: "Customer", default: true },
            { field: "itemCount", header: "Items" },
            { field: "totalRefund", header: "Total Refund", default: true },
            { field: "status", header: "Status", default: true },
            { field: "returnedAt", header: "Returned At", default: true }
        ]
    },
    PACK: {
        trCode: "SAL36000I01", entityLabel: "Packings", trKey: "SAL36000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "packagingCode", header: "Packing No", default: true },
            { field: "saleCode", header: "Invoice No", default: true },
            { field: "referenceNumber", header: "Reference" },
            { field: "status", header: "Status", default: true },
            { field: "itemCount", header: "Items", default: true },
            { field: "packedCount", header: "Packed", default: true },
            { field: "createdAt", header: "Created", default: true }
        ]
    },
    DLV: {
        trCode: "SAL42000I01", entityLabel: "Deliveries", trKey: "SAL42000",
        formats: ["excel", "pdf"], dateFilter: true, defaultDateRange: "3m",
        fields: [
            { field: "deliveryCode", header: "Delivery No", default: true },
            { field: "saleCode", header: "Invoice No", default: true },
            { field: "driverName", header: "Driver", default: true },
            { field: "customerName", header: "Customer", default: true },
            { field: "customerPhone", header: "Phone" },
            { field: "deliveryAddress", header: "Address" },
            { field: "status", header: "Status", default: true },
            { field: "scheduledDate", header: "Scheduled", default: true },
            { field: "createdAt", header: "Created" }
        ]
    },
    // Invoice (sale) export — date-scoped like expenses. totalCost is stripped
    // server-side without INVOICE:VIEW_PURCHASE_COST; SIV14000.vue also hides it.
    SIV: {
        trCode: "SIV14000I01",
        entityLabel: "Invoices",
        trKey: "SIV14000",
        formats: ["excel", "pdf"],
        dateFilter: true,
        defaultDateRange: "3m",
        fields: [
            { field: "saleCode", header: "Invoice No", default: true },
            { field: "saleDate", header: "Date", default: true },
            { field: "salePersonName", header: "Sale Person" },
            { field: "customerName", header: "Customer", default: true },
            { field: "customerPhone", header: "Phone" },
            { field: "inventoryName", header: "Location" },
            { field: "sellType", header: "Sell Type" },
            { field: "paymentStatus", header: "Payment Status", default: true },
            { field: "subtotal", header: "Total Amount", default: true },
            { field: "discountAmount", header: "Discount" },
            { field: "totalAmount", header: "Final Amount", default: true },
            { field: "totalCost", header: "Total Cost" },
            { field: "createdByName", header: "Created By" },
            { field: "createdAt", header: "Created Time" }
        ]
    },
    // Expense records are date-scoped — the only module so far that uses the
    // date filter. Defaults to the last 3 months rather than today.
    EXPR: {
        trCode: "EXP14000I01",
        entityLabel: "Expenses",
        trKey: "EXP14000",
        formats: ["excel", "pdf"],
        dateFilter: true,
        defaultDateRange: "3m",
        fields: [
            { field: "code", header: "Expense Code", default: true },
            { field: "expenseDate", header: "Date", default: true },
            { field: "categoryName", header: "Category", default: true },
            { field: "listName", header: "Expense List", default: true },
            { field: "expenseType", header: "Type" },
            { field: "description", header: "Description", default: true },
            { field: "amount", header: "Amount", default: true },
            { field: "currency", header: "Currency", default: true },
            { field: "notes", header: "Notes" }
        ]
    },
    STM: {
        trCode: "STM12000I01",
        entityLabel: "Staff",
        trKey: "STM12000",
        formats: ["excel", "pdf"],
        fields: [
            { field: "staffCode", header: "Staff Code", default: true },
            { field: "staffName", header: "Name", default: true },
            { field: "nickname", header: "Nickname" },
            { field: "phone", header: "Phone", default: true },
            { field: "email", header: "Email" },
            { field: "departmentName", header: "Department", default: true },
            { field: "positionName", header: "Position", default: true },
            { field: "hireDate", header: "Hire Date" },
            { field: "isActive", header: "Active", default: true }
        ]
    }
};
