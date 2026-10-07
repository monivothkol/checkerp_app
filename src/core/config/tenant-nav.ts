/**
 * Tenant context for the app. There is no browser subdomain on a phone: the user names the
 * company (its subdomain) on the login screen and it is kept as the `app_subdomain` property.
 * Same exports as checkerp_web's tenant-nav so the shared stores import it unchanged.
 */
import { BizCheckMobileProperties } from "@/shared/bizcheckmobile";
import HttpNetworkService from "@/services/http-network-service";
import { ensureAuthenticated as ensureSession } from "@/services/session-service";
import DataStorage from "@/core/utilities/data-storage";
import IndexedDBCache from "@/core/modules/indexeddb-cache";

/** The app lands on its home tab, which renders DAS10000. */
export const SUBDOMAIN_DASHBOARD = "/main/home";
export const MAIN_DASHBOARD = SUBDOMAIN_DASHBOARD;

export interface TenantContext {
	isMainDomain: boolean;
	subdomain: string;
	mainDomainUrl: string;
}

export interface SubdomainInfo {
	isValid: boolean;
	companyId?: string;
	companyCode?: string;
	companyName?: string;
	companyLogoUrl?: string;
}

const SUBDOMAIN_KEY = "app_subdomain";

export function getTenantContext(): TenantContext {
	return { isMainDomain: false, subdomain: BizCheckMobileProperties.get(SUBDOMAIN_KEY) || "", mainDomainUrl: "" };
}

export function setSubdomain(subdomain: string): void {
	BizCheckMobileProperties.set(SUBDOMAIN_KEY, subdomain.trim().toLowerCase());
}

/** CMM01000I01; a transient failure counts as valid so a flaky network never blocks login. */
export async function validateSubdomain(subdomain: string): Promise<SubdomainInfo> {
	try {
		return (await HttpNetworkService.getInstance().request({ trCode: "CMM01000I01", reqBody: { subdomain } })) as SubdomainInfo;
	} catch {
		return { isValid: true };
	}
}

export function ensureAuthenticated(): Promise<boolean> {
	return ensureSession();
}

export async function clearSession(): Promise<void> {
	DataStorage.clear();
	await IndexedDBCache.clear();
}
