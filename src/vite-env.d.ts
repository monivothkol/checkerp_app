/// <reference types="vite/client" />
interface ImportMetaEnv {
	readonly VITE_ENVIRONMENT: string;
	readonly VITE_SERVER_URL: string;
	readonly VITE_SERVER_PROTOCOL: string;
	readonly VITE_SERVER_DOMAIN: string;
	readonly VITE_SERVER_CONTEXT: string;
	readonly VITE_SERVER_CONTENT: string;
	readonly VITE_ENABLE_MOCK_REQUEST: string;
	readonly VITE_API_MOCK_URL: string;
	readonly VITE_BAKONG_ACCOUNT_ID: string;
	readonly VITE_AUTH_SERVER_URL: string;
	readonly VITE_AUTH_2_SERVER_URL: string;
	readonly VITE_DEFAULT_SUBDOMAIN?: string;
	readonly VITE_BAKONG_ACQUIRING_BANK: string;
	readonly VITE_BAKONG_QR_DOWNLOAD_EXPIRED_DATE: number;
	readonly VITE_USE_STATIC_PROXY: string;
	readonly VITE_DISABLE_DYNAMIC_PROXY: string;
	readonly VITE_COMPANY_NAME: string;
	readonly VITE_PRINT_CURL: string;
	readonly VITE_SERVER_SUB_DOMAIN: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention, no-unused-vars
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
