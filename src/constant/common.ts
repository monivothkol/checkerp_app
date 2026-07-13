export const CURRENCY_CODE = {
	USD: "USD",
	KHR: "KHR"
};

export const CURRENCY_CODE_SYMBOL = {
	USD: "$",
	KHR: "៛"
};

export const LANGUAGE_CODE = [
	{ label: "English", value: "01" },
	{ label: "ភាសាខ្មែរ", value: "02" }
];

export const LANGUAGE_CODE_MAP = {
	"01": "En",
	"02": "Km"
};
export const LOCALE_CODE_MAP = {
	"01": "en-US",
	"02": "km-KH"
};

export const TEAM_ROLE_TYPE_CODE = [
	{ label: "Collector", value: "01" },
	{ label: "Call Center", value: "02" },
	{ label: "Team Leader", value: "99" }
];

export const QUARTER_TYPE = [
	{ label: "Quarter 1", value: "Q1" },
	{ label: "Quarter 2", value: "Q2" },
	{ label: "Quarter 3", value: "Q3" },
	{ label: "Quarter 4", value: "Q4" }
];
export const SEMESTER_TYPE = [
	{ label: "Semester 1", value: "S1" },
	{ label: "Semester 2", value: "S2" }
];

export const MONTH_TYPE = [
	{ label: "JAN", value: "01" },
	{ label: "FEB", value: "02" },
	{ label: "MAR", value: "03" },
	{ label: "APR", value: "04" },
	{ label: "MAY", value: "05" },
	{ label: "JUN", value: "06" },
	{ label: "JUL", value: "07" },
	{ label: "AUG", value: "08" },
	{ label: "SEP", value: "09" },
	{ label: "OCT", value: "10" },
	{ label: "NOV", value: "11" },
	{ label: "DEC", value: "12" }
];

export const COLLATERAL_CATEGORY = [
	{ value: "101", label: "Land" },
	{ value: "102", label: "House (Flat, Villa, building)" },
	{ value: "103", label: "Condominiums/Apartment" },
	{ value: "104", label: "Commercial Building" },
	{ value: "105", label: "Factory" },
	{ value: "106", label: "Farm" },
	{ value: "107", label: "Market" },
	{ value: "108", label: "Hotel/Motel/Guest house" },
	{ value: "109", label: "Educational institution(School)" },
	{ value: "110", label: "Gas Station" },
	{ value: "111", label: "Port" },
	{ value: "199", label: "Other commercial properties" },
	{ value: "201", label: "Fixed Deposit" },
	{ value: "202", label: "Installment Deposit" },
	{ value: "203", label: "Current/Saving Account (Freeze amount)" },
	{ value: "209", label: "Other Accounts" },
	{ value: "291", label: "Deposit (Other Banks/Institutes)" },
	{ value: "292", label: "Stocks and bonds" },
	{ value: "299", label: "Other Bank" },
	{ value: "301", label: "Car ID" },
	{ value: "302", label: "Motor ID" },
	{ value: "303", label: "Tax Paper" },
	{ value: "501", label: "Loan Assignment of rights" },
	{ value: "502", label: "Certified by the Notary Public" },
	{ value: "503", label: "Guarantee from Third Party" },
	{ value: "504", label: "Passport/ID Card" },
	{ value: "505", label: "Invoice (New product under processing)" },
	{ value: "506", label: "Original Bill (Export)" },
	{ value: "507", label: "Standby Letter of Credit" }
];

export const LOAN_PURPOSE = [
	{ label: "To apply for a business license", value: "1110" },
	{ label: "To open a joint venture business", value: "1210" },
	{ label: "To open one more branch", value: "1220" },
	{ label: "To run a new business", value: "1310" },
	{ label: "To reserve working capital for their business", value: "1410" },
	{ label: "To reserve working capital for farming/ plaintation business", value: "1420" },
	{ label: "To buy pigs/cows/chickens/ducks for sale", value: "2110" },
	{ label: "To buy a car/mini truck/van for transportation service", value: "2210" },
	{ label: "To buy a car/mini truck/van for rent", value: "2220" },
	{ label: "To buy a car/mini truck/van for business use", value: "2230" },
	{ label: "To buy a car/motorbike for personal use", value: "2240" },
	{ label: "To buy a car/mini truck/van for sale", value: "2250" },
	{ label: "To buy equipment/machinery for their business use", value: "2310" },
	{ label: "To buy furniture for personal use", value: "2410" },
	{ label: "To buy a house /flat/building for new business", value: "2510" }
];

export const LOAN_TERM = [
	{ label: "1 Year", value: "1" },
	{ label: "2 Years", value: "2" },
	{ label: "3 Years", value: "3" },
	{ label: "4 Years", value: "4" },
	{ label: "5 Years", value: "5" },
	{ label: "6 Years", value: "6" }
];

export const LOAN_TERMS = [
	{ label: "Period", value: "1" },
	{ label: "Maturity Date", value: "2" },
	{ label: "Lc Period", value: "3" }
];

export const LOAN_TERM_MONTH = [
	{ label: "6 Month", value: 6 },
	{ label: "12 Months", value: 12 },
	{ label: "18 Months", value: 18 },
	{ label: "24 Months", value: 24 },
	{ label: "36 Months", value: 36 },
	{ label: "48 Months", value: 48 },
	{ label: "60 Months", value: 60 },
	{ label: "72 Months", value: 72 },
	{ label: "84 Months", value: 84 },
	{ label: "96 Months", value: 96 },
	{ label: "108 Months", value: 108 },
	{ label: "120 Months", value: 120 }
];

export const LOAN_PRODUCT = [
	{ label: "General Loan > 1 Year", value: "1" },
	{ label: "General Loan > 2 Years", value: "2" },
	{ label: "General Loan > 3 Years", value: "3" },
	{ label: "General Loan > 4 Years", value: "4" },
	{ label: "General Loan > 5 Years", value: "5" },
	{ label: "General Loan > 6 Years", value: "6" }
];

export const LOAN_REPAYMENT_METHOD = [
	{ label: "Monthly", value: "1" },
	{ label: "Quarterly", value: "2" },
	{ label: "Yearly", value: "3" }
];

export const LOAN_APPLICATION_TYPE = [
	{ label: "New Application", value: "10" },
	{ label: "Loan Extension", value: "20" },
	{ label: "Condition Change", value: "30" }
];

export const EMPLOYMENT_STATUS = [
	{ label: "Current", value: "C" },
	{ label: "Previous", value: "P" }
];

export const EMPLOYMENT_TYPE = [
	{ label: "Owner", value: "1" },
	{ label: "Employee", value: "2" }
];

export const OCCUPATION_TYPE = [
	{ label: "Salary", value: "01" },
	{ label: "Owner", value: "02" }
];

export const INCOME_SOURCE = [
	{ label: "Industry", value: "1" },
	{ label: "Business", value: "2" },
	{ label: "Salary", value: "3" },
	{ label: "Investment", value: "4" },
	{ label: "Other", value: "5" }
];

export const REASON_OF_DELINQUENCY = [
	{ label: "Reason 1", value: "1" },
	{ label: "Reason 2", value: "2" },
	{ label: "Reason 3", value: "3" }
];

export const PAYMENT_REPORT_METHOD = [
	{ label: "Bill Payment", value: "1" },
	{ label: "Cash Payment", value: "2" },
	{ label: "Other", value: "3" }
];

export const SPEAK_TO = [
	{ label: "Parent", value: "1" },
	{ label: "Spouse", value: "2" },
	{ label: "Child", value: "3" }
];

export const CONSULTATION_TYPE = [
	{ label: "Walk-in", value: "01" },
	{ label: "Referral", value: "02" },
	{ label: "Field Visit", value: "03" }
];

export const CONSULTATION_PRIORITY_CODE = [
	{ label: "High", value: "03" },
	{ label: "Medium", value: "02" },
	{ label: "Low", value: "01" }
];

export const CONSULTATION_CUSTOMER_INTEREST = [
	{ label: "Interested", value: "Y" },
	{ label: "Not Interested", value: "N" }
];

export const CONSULTATION_STATUS = [
	{ label: "Registered", value: "01" },
	{ label: "Completed", value: "09" }
];

export const CUSTOMER_TITLE = [
	{ label: "Mr.", value: "01" },
	{ label: "Mrs.", value: "02" },
	{ label: "Ms.", value: "03" },
	{ label: "Dr.", value: "04" },
	{ label: "Prof.", value: "05" },
	{ label: "Other", value: "00" }
];

export const MARITAL_STATUS = [
	{ label: "Single", value: "01" },
	{ label: "Married", value: "02" },
	{ label: "Divorced", value: "03" },
	{ label: "Widowed", value: "04" },
	{ label: "N/A", value: "00" }
];

export const GENDER = [
	{ label: "Male", value: "M" },
	{ label: "Female", value: "F" },
	{ label: "Other", value: "O" }
];

export const ID_TYPE = [
	{ label: "National ID", value: "01" },
	{ label: "Passport", value: "02" },
	{ label: "Family's book", value: "03" },
	{ label: "Drivers License", value: "04" },
	{ label: "Birth Certificate", value: "05" }
];

export const ISSUE_BY = [
	{ label: "Head of commune", value: "11" },
	{ label: "Head of district", value: "12" },
	{ label: "Head of Police district", value: "13" },
	{ label: "Head of Police commune", value: "14" },
	{ label: "Police commissioner", value: "15" },
	{ label: "Province Governor", value: "16" },
	{ label: "Ministry of Interior", value: "17" },
	{ label: "Republic of Korea", value: "21" },
	{ label: "Republic of China", value: "22" },
	{ label: "Republic of Japan", value: "23" },
	{ label: "United States of America", value: "24" },
	{ label: "United Kingdom", value: "25" },
	{ label: "Etc", value: "99" }
];

export const FAMILY_SIZE = [
	{ label: "Small", value: "01" },
	{ label: "Medium", value: "02" },
	{ label: "Large", value: "03" }
];

export const EDUCATION = [
	{ label: "Know Read", value: "01" },
	{ label: "Primary School", value: "02" },
	{ label: "Secondary School", value: "03" },
	{ label: "High School", value: "04" },
	{ label: "College", value: "05" },
	{ label: "Bachelor Degree", value: "06" },
	{ label: "Master Degree", value: "07" }
];

export const CONSULTATION_PURPOSE = [
	{ label: "Request Loan", value: "01" },
	{ label: "Deposit", value: "02" },
	{ label: "Withdrawal", value: "03" },
	{ label: "Other", value: "04" }
];
export const NEXT_SOLVING_PLAN_CODE = [
	{ label: "1st demanding Letter", value: "01" },
	{ label: "2nd demanding Letter", value: "02" },
	{ label: "Loan Restructure", value: "03" },
	{ label: "Invite to Office", value: "04" },
	{ label: "Sell Collateral", value: "05" },
	{ label: "Change Borrower", value: "06" },
	{ label: "Lawyer letter", value: "07" },
	{ label: "Solve with authority", value: "08" },
	{ label: "Solve with relatives", value: "09" },
	{ label: "Solve with guarantors", value: "10" }
];

export const OVERDUE_FOLLOW_UP_STATUS = [
	{ label: "Pending", value: "01", class: "today" },
	{ label: "Complete", value: "02", class: "visit" }
];

//Loan to be follow up
export const FOLLOW_UP_PURPOSE = [
	{ label: "Overdue Reminder", value: "01" },
	{ label: "Payment Confirmation", value: "02" },
	{ label: "Reschedule Request", value: "03" },
	{ label: "Consultation", value: "04" }
];

export const LOAN_TO_BE_FOLLOW_UP_STATUS = [
	{ label: "Upcoming", value: "01", class: "upcoming" },
	{ label: "On Follow-Up", value: "02", class: "today" },
	{ label: "Late Follow-Up", value: "03", class: "late" }
];

export const FOLLOW_UP_METHOD = [
	{ label: "Phone Call", value: "01", class: "" },
	{ label: "Visit", value: "02", class: "" },
	{ label: "Message", value: "03", class: "" },
	{ label: "etc", value: "09", class: "" }
];

export const USAGE_AMOUNT_RESULT = [
	{ label: "Correct Use", value: "01" },
	{ label: "Incorrect Use", value: "02" }
];

export const INCOME_STATUS = [
	{ label: "Lower", value: "01" },
	{ label: "Same", value: "02" },
	{ label: "Increase", value: "03" }
];

export const COLLATERAL_STATUS = [
	{ label: "Registered", value: "01" },
	{ label: "Release", value: "02" },
	{ label: "Deleted", value: "03" }
];

export const FOLLOW_UP_STATUS = [
	{ label: "Keep Follow-Up", value: "01" },
	{ label: "Completed", value: "02" },
	{ label: "Escalated", value: "03" }
];

//Contact History
export const CONTACT_URGENCY_LEVEL = [
	{ label: "Very Urgent", value: "H", class: "error" }, //High
	{ label: "Urgent", value: "M", class: "warning" }, //Meduim
	{ label: "Normal", value: "L", class: "primary" } //Low
];

export const CONTACT_CHANNEL_TYPE = [
	{ label: "Phone Call", value: "01" },
	{ label: "Email", value: "02" },
	{ label: "Social", value: "03" }
];

export const CONTACT_RESULT_TYPE = [
	{ label: "Contacted Successfully", value: "01" }, //Success
	{ label: "Can not contact", value: "02" } //Failed
];

//Payment Plan Report
export const PAYMENT_PLAN_FOLLOW_UP_RESULT = [
	{ label: "Pending", value: "10", class: "warning" },
	{ label: "Completed", value: "20", class: "primary" },
	{ label: "Closed", value: "30", class: "reject" }
];

export const PAYMENT_PLAN_METHOD = [
	{ label: "Cash", value: "01" },
	{ label: "Transfer", value: "02" },
	{ label: "Payroll Deduction", value: "03" },
	{ label: "Other", value: "09" }
];

export const PERSON_MET_CODE = [
	{ label: "Owner", value: "01" },
	{ label: "Parent", value: "02" },
	{ label: "Spouse", value: "03" },
	{ label: "Child", value: "04" },
	{ label: "Co-Borrower", value: "05" },
	{ label: "Other", value: "09" }
];

//Loan overdue
export const CONTACT_METHOD = [
	{ label: "Phone Call", value: "01" },
	{ label: "Visit", value: "02" },
	{ label: "Message", value: "03" },
	{ label: "etc", value: "09" }
];

export const SUPPORT_BY = [
	{ label: "Branch", value: "01" },
	{ label: "Head Office", value: "02" }
];

export const ACTION_CODE = [
	{ label: "1st demanding Letter", value: "01" },
	{ label: "2nd demanding Letter", value: "02" },
	{ label: "Loan Restructure", value: "03" },
	{ label: "Invite to Office", value: "04" },
	{ label: "Sell Collateral", value: "05" },
	{ label: "Change Borrower", value: "06" },
	{ label: "Lawyer letter", value: "07" },
	{ label: "Solve with authority", value: "08" },
	{ label: "Solve with relatives", value: "09" },
	{ label: "Solve with guarantors", value: "10" }
];

export const RESULT_CODE = [
	{ label: "Partial Payment", value: "01" },
	{ label: "Full payment", value: "02" },
	{ label: "Promised to Pay", value: "03" },
	{ label: "Reached Negotiation", value: "04" },
	{ label: "Unresolved", value: "05" }
];

export const NEGOTIATION_CODE = [
	{ label: "Loan Restructure", value: "01" },
	{ label: "Sell Collateral", value: "02" },
	{ label: "Change Borrower", value: "03" }
];

export const PROMISE_CODE = [
	{ label: "Collection Amount", value: "01" },
	{ label: "Promised to Pay on Date", value: "02" }
];

export const ARREARS_RESULT_CODE = [
	{ label: "Pending", value: "01" },
	{ label: "Complete", value: "02" }
];
export const ARREARS_REASON_CODE = [
	{ label: "Family’s Issue", value: "01" },
	{ label: "Financial Issue", value: "02" },
	{ label: "Others", value: "03" }
];

export const NEXT_CONTACT_DATE_CODE = [
	{ label: "1st demanding Letter", value: "01" },
	{ label: "2nd demanding Letter", value: "02" },
	{ label: "Loan Restructure", value: "03" },
	{ label: "Invite to Office", value: "04" },
	{ label: "Sell Collateral", value: "05" },
	{ label: "Change Borrower", value: "06" },
	{ label: "Lawyer letter", value: "07" },
	{ label: "Solve with authority", value: "08" },
	{ label: "Solve with relatives", value: "09" },
	{ label: "Solve with guarantors", value: "10" }
];

export const FAMILY_ISSUE_CODE = [
	{ label: "Sickness", value: "10" },
	{ label: "Accident", value: "11" },
	{ label: "Death", value: "12" },
	{ label: "Divorce", value: "13" }
];

export const FINANCIAL_ISSUE_CODE = [
	{ label: "Unemployed", value: "20" },
	{ label: "Bankruptcy", value: "21" },
	{ label: "Over Indebtedness", value: "22" }
];

//Loan Reschedule
export const LOAN_RESCHEDULE_TYPE = [
	{ label: "Maturity Date", value: "01" },
	{ label: "Interest Rate", value: "02" },
	{ label: "Grace Period Year", value: "03" },
	{ label: "Loan Repayment Peroid", value: "04" },
	{ label: "Loan Negotiation Amount", value: "05" },
	{ label: "Collateral Link", value: "06" },
	{ label: "Repayment Date", value: "07" },
	{ label: "Other", value: "99" }
];

export const REQUEST_PURPOSE = [
	{ label: "Reshecdule", value: "01" },
	{ label: "Restructue", value: "02" }
];

export const LOAN_APPLICATION_PRODUCT_TYPE = [
	{ label: "Business Loan", value: "10" },
	{ label: "Education Loan", value: "20" },
	{ label: "Personal Loan", value: "30" },
	{ label: "House Rental", value: "40" },
	{ label: "Car Loan", value: "05" },
	{ label: "Land Loan", value: "06" },
	{ label: "Building Loan", value: "07" },
	{ label: "Equipment Loan", value: "08" },
	{ label: "Other", value: "09" }
];

export const WORK_PROGRESS_STATUS = [
	{ label: "Requested", value: "01" },
	{ label: "Processing", value: "02" },
	{ label: "Rejected", value: "03" },
	{ label: "Completed", value: "04" },
	{ label: "Canceled", value: "05" }
];

//Bank Cheque
export const BANK_CHEQUE_TRANSACTION_TYPE = [
	{ label: "Deposit", value: "01" },
	{ label: "Withdrawal", value: "02" },
	{ label: "Transfer", value: "03" },
	{ label: "Other", value: "04" }
];

export const CUSTOMER_TYPE = [
	{ label: "Corporate", value: "CO" },
	{ label: "Individual", value: "IC" }
];

export const RESIDENT_TYPE = [
	{ label: "Resident", value: "01" },
	{ label: "Non-Resident", value: "02" }
];

export const BUSINESS_ADDRESS_TYPE = [
	{ label: "Residential", value: "01" },
	{ label: "Work", value: "02" },
	{ label: "Correspondence", value: "03" }
];

export const HOUSE_OWN_TYPE = [
	{ label: "Owned", value: "1000" },
	{ label: "Family Owned", value: "1400" },
	{ label: "Spouse Owned", value: "1700" },
	{ label: "Company Owned", value: "5100" },
	{ label: "Rental", value: "5300" },
	{ label: "Other", value: "5900" }
];

export const HOUSE_TYPE = [
	{ label: "Apartment", value: "0001" },
	{ label: "Flat", value: "0002" },
	{ label: "Condo", value: "0003" },
	{ label: "Villa", value: "0004" },
	{ label: "Other", value: "0005" }
];

export const ENTITY_TYPE = [
	{ label: "Business Entity", value: "01" },
	{ label: "Association NGO & NPO", value: "02" },
	{ label: "Foreign Business Entity", value: "03" },
	{ label: "Foreign Association NGO & NPO", value: "04" },
	{ label: "Government", value: "05" }
];

export const RELATION_TYPE = [
	{ label: "Director", value: "01" },
	{ label: "Shareholder", value: "02" }
];
export const CORPORATE_RELATION_TYPE = [
	{ label: "Certificate of Incorporation", value: "21" },
	{ label: "Patent Tax Certificate", value: "22" },
	{ label: "Authorization", value: "23" },
	{ label: "Non-personal Other", value: "29" }
];

export const INDUSTRY_CATEGORY = [
	{ label: "Commercial Banks", value: "A01000" },
	{ label: "Specialized Banks", value: "A02000" },
	{ label: "Finance", value: "B02000" },
	{ label: "Insurance", value: "B03000" }
];

export const POSITION = [
	{ label: "Manager", value: "01" },
	{ label: "Director", value: "02" }
];
export const NEXT_ACTION_OPTIONS = [
	{ label: "Consultation Again", value: "01" },
	{ label: "Follow Up", value: "02" },
	{ label: "Other", value: "03" }
];

export const JOB_TITLE_CODE = [
	{ value: "L001", label: "CEO" },
	{ value: "L002", label: "Director" },
	{ value: "L003", label: "Chief" },
	{ value: "L004", label: "Head" },
	{ value: "L005", label: "Regional Manager" },
	{ value: "L006", label: "Team Member" },
	{ value: "L007", label: "Chief Teller" },
	{ value: "L008", label: "Teller" },
	{ value: "L009", label: "Branch Manager" },
	{ value: "L010", label: "Team Leader" },
	{ value: "L011", label: "Credit Officer" },
	{ value: "L012", label: "Credit Assistant" },
	{ value: "L013", label: "Credit Assessment" },
	{ value: "L014", label: "Loan Recovery" },
	{ value: "L015", label: "Driver" },
	{ value: "L016", label: "Cleaner" },
	{ value: "L017", label: "Security" },
	{ value: "L018", label: "Senior Credit Officer" },
	{ value: "L019", label: "Sales Manager" }
];

export const USER_POSITION = [
	{ value: "P001", label: "CEO" },
	{ value: "P002", label: "Director" },
	{ value: "P003", label: "Chief" },
	{ value: "P004", label: "Manager" },
	{ value: "P005", label: "Deputy Manager" },
	{ value: "P006", label: "Unit Manager" },
	{ value: "P007", label: "Supervisor" },
	{ value: "P008", label: "Senior Assistant" },
	{ value: "P009", label: "Junior Assistant" },
	{ value: "P010", label: "Assistant" },
	{ value: "P011", label: "Worker" },
	{ value: "P012", label: "Internship" }
];

export const LOAN_APPLICATION_STATUS = [
	{ label: "All", value: "000" },
	{ label: "Pre Application", value: "100" },
	{ label: "Application", value: "200" },
	{ label: "Application Return", value: "280" },
	{ label: "Application Cancel", value: "290" },
	{ label: "Approval Request", value: "310" },
	{ label: "Approval", value: "320" },
	{ label: "Reject", value: "390" },
	{ label: "Credit Request", value: "410" },
	{ label: "Credit Approval", value: "420" },
	{ label: "Credit Reject", value: "490" },
	{ label: "Limit Register", value: "810" },
	{ label: "Disburs/Contract", value: "820" },
	{ label: "Condition Changed", value: "830" },
	{ label: "Canceled/Deleted", value: "900" }
];

export const LOAN_PRODUCT_TYPE = [
	{ label: "New", value: "10" },
	{ label: "Rollover", value: "20" },
	{ label: "Condition Change", value: "30" }
];

export const LOAN_PRODUCT_CODE = [
	{ label: "Business Loan - Medium", value: "5500" },
	{ label: "Business Loan - Small", value: "5501" },
	{ label: "Business Loan - Large", value: "5502" },
	{ label: "Motor Loan", value: "5503" },
	{ label: "Staff Housing Loan", value: "5504" },
	{ label: "Housing Loan", value: "5505" },
	{ label: "Car Loan", value: "5506" },
	{ label: "Rose Dream", value: "5507" },
	{ label: "Related Parties Loan", value: "5508" },
	{ label: "Business Loan - Small - KHR", value: "6501" }
];

export const LOAN_APPROVAL_APPLICATION_STATUS = [
	{ label: "Register", value: "" },
	{ label: "In Progress", value: "1" },
	{ label: "Approved", value: "2" },
	{ label: "Rejected", value: "3" }
];

//Open Account
export const OPEN_ACCOUNT_PRODUCT = {
	INDIVIDUAL_SAVING_ACCOUNT_USD: "DP01USD000001",
	INDIVIDUAL_SAVING_ACCOUNT_KHR: "DP01KHR000002",
	INDIVIDUAL_CURRENT_ACCOUNT_USD: "DP02USD000003",
	INDIVIDUAL_CURRENT_ACCOUNT_KHR: "DP02KHR000004",

	CORPORATE_SAVING_ACCOUNT_USD: "",
	CORPORATE_SAVING_ACCOUNT_KHR: "",
	CORPORATE_CURRENT_ACCOUNT_USD: "",
	CORPORATE_CURRENT_ACCOUNT_KHR: ""
};

export const DEPOSIT_SUBJECT_CODE = {
	SAVING_ACCOUNT: "120",
	CURRENT_ACCOUNT: "110"
};

export const DEPOSIT_ROLLOVER_DIVIDE = [
	{ label: "No Rollover", value: "00" },
	{ label: "Rollover Principal and Interest", value: "01" },
	{ label: "Rollover Principal Only", value: "02" }
];

export const IDENTIFY_TYPE = [
	{ label: "National ID", value: "01" },
	{ label: "Passport", value: "02" },
	{ label: "Family's book", value: "03" },
	{ label: "Drivers License", value: "04" },
	{ label: "Birth Certificate", value: "05" },
	{ label: "Government Issue ID", value: "06" },
	{ label: "Voter Reg. Card", value: "07" },
	{ label: "Tax Number", value: "08" },
	{ label: "Resident Book", value: "09" },
	{ label: "Other", value: "99" }
];

export const INTEREST_OPTIONS = [
	{ label: "Maturity Payment", value: "M" },
	{ label: "Interest Payment (Monthly)", value: "P" },
];
//Loan Collection
export const PAYMENT_PLAN_PAYMENT_CONFIRM_CODE = [
	{ label: "Confirmed Fully Pay", value: "10" },
	{ label: "Confirmed Partially Pay", value: "20" },
	{ label: "Tentative", value: "30" },
	{ label: "Not Confirm or Decline", value: "40" }
];

export const COLLECTION_ACTION_CODE = [
	{ label: "Reminded to Pay", value: "10" },
	{ label: "Follow-Up Scheduled", value: "20" },
	{ label: "Escalated to Supervisors", value: "30" }
];
export const APPROVAL_REQUEST_TYPE = [
	{ label: "Loan Approval", value: "02" },
	{ label: "General Approval", value: "01" }
];

export const APPROVAL_TYPE = [
	{ label: "My Request", value: "01" },
	{ label: "My Approval", value: "02" }
];

export const LOAN_APPLICATION_KIND = [
	{ label: "General", value: "1" },
	{ label: "Partial Disbursement", value: "3" }
];

export const PRINCIPAL_REPAYMENT_METHOD = [
	{ label: "Bullet", value: "10" },
	{ label: "Decline", value: "20" },
	{ label: "Annuity", value: "30" },
	{ label: "Negotiable Principle", value: "40" }
];

export const UTILIZATION_CODE = [
	{ label: "No special Note", value: "1010" },
	{ label: "CGCC guarantee programs", value: "1020" },
	{ label: "SME co-financing scheme", value: "1030" },
	{ label: "CFCC guarantee and SME co-financing scheme", value: "2010" }
];

export const DEPOSIT_SUBJECT_CODE_LABEL = [
	{ label: "Saving Account", value: "120" },
	{ label: "Current Account", value: "110" },
	{ label: "Fixed Deposit", value: "130" },
	{ label: "Installment Deposit", value: "140" },
	{ label: "Other", value: "999" }
];

//news & event, FAQ
export const PARRENT_CATEGORY_CODE = {
	NEWS_AND_EVENTS: "001",
	FAQ: "002",
	PRODUCT: "003",
	PROMOTION: "004",
	TERMS_CONDITION: "005"
};

export const CATEGORY_DEPTH = {
	TOP_LEVEL: 1,
	SUB_LEVEL: 2
};

export const NOTIFICATION_CATEGORY = [
	{ label: "All", value: "0000" },
	{ label: "Approval", value: "1000" },
	{ label: "Reminder", value: "2000" },
	{ label: "Announcements", value: "3000" }
];

export const EVALUATE_STATUS_CODE = [
	{ label: "Approved", value: "20" },
	{ label: "Final Approved", value: "30" },
	{ label: "Cancel", value: "40" },
	{ label: "Return", value: "80" },
	{ label: "Reject", value: "90" }
];

export const APPROVAL_STATUS_CODE = [
	{ label: "Requested", value: "01" },
	{ label: "Approving", value: "02" },
	{ label: "Approved", value: "03" },
	{ label: "Reject", value: "04" },
	{ label: "Return", value: "05" },
	{ label: "Resubmitted", value: "06" },
	{ label: "Cancel", value: "07" }
];
export const FETCH_LIST = {
	PAGE_NUMBER: 1,
	PAGE_SIZE: 15
};

export const CUSTOMER_HISTORY_LOG = [
	{ value: "0000", label: "All" },
	{ value: "0001", label: "ID Type" },
	{ value: "0002", label: "Customer Type" },
	{ value: "0003", label: "ID No" },
	{ value: "0004", label: "ID Expiry Date" },
	{ value: "0005", label: "Last Name" },
	{ value: "0006", label: "Middle Name" },
	{ value: "0007", label: "First Name" },
	{ value: "0008", label: "Date of Birth" },
	{ value: "0009", label: "CIF Type" },
	{ value: "0010", label: "CIF Purpose" },
	{ value: "0011", label: "Additional ID Type" },
	{ value: "0012", label: "Additional ID No" },
	{ value: "0013", label: "Khmer Last Name" },
	{ value: "0014", label: "Khmer First Name" },
	{ value: "0015", label: "Resident or Operating Country" },
	{ value: "0016", label: "Nationality" },
	{ value: "0017", label: "Birth Country" },
	{ value: "0018", label: "Gender" },
	{ value: "0019", label: "Phone Number 1" },
	{ value: "0020", label: "Phone Number 2" },
	{ value: "0021", label: "Resident Type" },
	{ value: "0022", label: "E-Mail" },
	{ value: "0023", label: "Personal Address" },
	{ value: "0024", label: "VillageGroupStreet" },
	{ value: "0025", label: "Employee Type" },
	{ value: "0026", label: "Occupation" },
	{ value: "0027", label: "Work Department" },
	{ value: "0028", label: "Recommended Customer" },
	{ value: "0029", label: "Job Level" },
	{ value: "0030", label: "Referral Staff No" },
	{ value: "0031", label: "Real Birth Date" },
	{ value: "0032", label: "Fax Number" },
	{ value: "0033", label: "Real Customer YN" },
	{ value: "0034", label: "Death YN" },
	{ value: "0035", label: "House Own Type" },
	{ value: "0036", label: "House Type" },
	{ value: "0037", label: "Preferred Calling Title" },
	{ value: "0038", label: "Customer Grade" },
	{ value: "0039", label: "Company Customer No" },
	{ value: "0040", label: "Dedicate Staff No" },
	{ value: "0041", label: "CBC Personal Province" },
	{ value: "0042", label: "CBC Personal District" },
	{ value: "0043", label: "CBC Personal Commune" },
	{ value: "0044", label: "CBC Personal Village" },
	{ value: "0045", label: "CBC Company Province" },
	{ value: "0046", label: "CBC Company District" },
	{ value: "0047", label: "CBC Company Commune" },
	{ value: "0048", label: "CBC Company Village" },
	{ value: "0049", label: "Change ID issue date" },
	{ value: "0050", label: "Register new document" },
	{ value: "0051", label: "Change company Khmer name" },
	{ value: "0052", label: "Change document No" },
	{ value: "0053", label: "Delete customer document" },
	{ value: "0054", label: "Change document title" },
	{ value: "0055", label: "Change document type" },
	{ value: "0056", label: "Change TIN No" },
	{ value: "0057", label: "Change representive customer" },
	{ value: "0100", label: "Entity Type" },
	{ value: "0101", label: "Incorporation Date" },
	{ value: "0102", label: "Nationality Country" },
	{ value: "0103", label: "Operating Country" },
	{ value: "0104", label: "Contact Phone1" },
	{ value: "0105", label: "Contract Phone2" },
	{ value: "0106", label: "Corporate Size" },
	{ value: "0107", label: "Representative Assign Date" },
	{ value: "0108", label: "Financial Institution YN" },
	{ value: "0109", label: "Representative Customer No" },
	{ value: "0110", label: "No of Employees" },
	{ value: "0111", label: "Industry Category" },
	{ value: "0112", label: "Annual Revenue Amount" },
	{ value: "0113", label: "Business Stie Own Type" },
	{ value: "0114", label: "Organization Type" },
	{ value: "0115", label: "Listed Company YN" },
	{ value: "0116", label: "Listed Date" },
	{ value: "0117", label: "Shareholder Information" },
	{ value: "0118", label: "Business Terminate Type" },
	{ value: "0119", label: "Customer Name" },
	{ value: "0120", label: "Customer Image" },
	{ value: "0121", label: "Change customer ID image" },
	{ value: "0500", label: "Company Customer Name" },
	{ value: "0501", label: "Job Title" },
	{ value: "0502", label: "Company Hire Date" },
	{ value: "0503", label: "Company Name" },
	{ value: "0504", label: "Office Phone" },
	{ value: "0505", label: "Referral Staff Name" },
	{ value: "0506", label: "Dedicate Branch Code" },
	{ value: "0507", label: "Dedicate Branch Name" },
	{ value: "0508", label: "Dedicate Staff Name" },
	{ value: "0509", label: "Created Branch Code" },
	{ value: "0510", label: "Created Branch Name" },
	{ value: "0511", label: "Created Teller ID" },
	{ value: "0512", label: "Created Teller Name" },
	{ value: "0513", label: "International Phone Country Code 1" },
	{ value: "0514", label: "International Phone Country Code 2" },
	{ value: "0515", label: "Job Level Name" },
	{ value: "0516", label: "Modify Branch Code" },
	{ value: "0517", label: "Modify Branch Name" },
	{ value: "0518", label: "Modify Teller ID" },
	{ value: "0519", label: "Modify Teller Name" },
	{ value: "0520", label: "Marital Status" },
	{ value: "0521", label: "Nationality Country Name" },
	{ value: "0522", label: "Occupation Name" },
	{ value: "0523", label: "Brith Country Name" },
	{ value: "0524", label: "Address 1" },
	{ value: "0525", label: "Address 2" },
	{ value: "0526", label: "Primary Language" },
	{ value: "0527", label: "Recommend Customer Name" },
	{ value: "0528", label: "Representative Customer Name" },
	{ value: "0529", label: "Resident or Operating Country Name" },
	{ value: "0530", label: "Secondary Language" },
	{ value: "0531", label: "Industry Category Name" },
	{ value: "0532", label: "Work Department Name" },
	{ value: "0533", label: "VillageGroupStreet2" },
	{ value: "0534", label: "Address Code 2" },
	{ value: "0601", label: "Change CBC Home No" },
	{ value: "0602", label: "Change CBC Street No" },
	{ value: "0603", label: "Change CBC Company Home No" },
	{ value: "0604", label: "Change CBC Company Street No" },
	{ value: "0605", label: "Change Other Income" },
	{ value: "0607", label: "Change Monthly Income" },
	{ value: "0608", label: "Change Main Source Income Code" },
	{ value: "0609", label: "Change Monthly Income Amount CCY" },
	{ value: "0610", label: "Change Occupation Address Type Code" },
	{ value: "0611", label: "Change CBC Occupation Status Code" },
	{ value: "0612", label: "Change Total Income" },
	{ value: "0613", label: "Change Customer Status" },
	{ value: "9999", label: "Other" }
];

export const EMPLOYMENT_STATUS_LABEL = [
	{ label: "Current", value: "C" },
	{ label: "Previous", value: "P" }
];

export const PRODUCT_CLAIM_CODE = [
	{ label: "Health ", value: "0100" },
	{ label: "Life Insurance", value: "0101" },
	{ label: "Accident Insurance", value: "0102" }
];

export const BAC_CLAIM_WORK_PROGRESS_STATUS = [
	{ label: "Requested", value: "01" },
	{ label: "Processing", value: "02" },
	{ label: "Rejected", value: "03" },
	{ label: "Completed", value: "04" },
	{ label: "Canceled (Customer ask to cancel)", value: "05" }
];

export const BRANCH_CODE = [
	{ label: "BKK Branch", value: "KHB00001" },
	{ label: "Server disvision 1", value: "KHB00002" },
	{ label: "Chroy Chongva", value: "KHB00003" },
	{ label: "Account Department", value: "KHD00002" },
	{ label: "BKK Branch011", value: "KHB00011" },
	{ label: "BKK01", value: "KHB00016" },
	{ label: "BKK Branch", value: "KHB00008" },
	{ label: "Server disvision 3", value: "KHB00010" },
	{ label: "Server Division", value: "KHB00015" },
	{ label: "BKK Branch", value: "KHB00004" },
	{ label: "TK Branch", value: "KHB00006" },
	{ label: "Chroy Chongva", value: "KHB00007" },
	{ label: "Server disvision 3", value: "KHB00009" },
	{ label: "Treasury Department", value: "KHD00001" }
];

export const LOAN_STATUS_CODE = [
	{ value: "10", label: "Register" },
	{ value: "20", label: "Active" },
	{ value: "30", label: "Closed" },
	{ value: "40", label: "Write Off" },
	{ value: "90", label: "Cancelled" }
];

export const PARTIAL_STATUS_CODE = [
	{ value: "1", label: "Register" },
	{ value: "2", label: "Active" },
	{ value: "3", label: "Cancel" }
];

export const ASSET_QUALITY_CLASSIFICATION_CODE = [
	{ value: "10", label: "Standard" },
	{ value: "20", label: "Special Mention" },
	{ value: "30", label: "Sub Standard" },
	{ value: "40", label: "Doubtful" },
	{ value: "50", label: "Loss" },
];

export const LOAN_FOLLOW_UP_RESULT = [
	{ value: "01", label: "Contacted" },
	{ value: "02", label: "No Response" },
	{ value: "03", label: "Promise to Pay" }
];

export const NO_DATA = "N/A";
