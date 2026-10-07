import HttpNetworkService from "@/services/http-network-service";

/** Payload/error shape the standard trCode call reports back. */
export interface ModuleApiError {
    message?: string;
    code?: string;
}

export interface ModuleApiListener<T = Record<string, any>> {
    onSuccess: (payload: T) => void;
    onFail?: (error: ModuleApiError) => void;
}

/**
 * Generic trCode request used by the config-driven module screens
 * (ModuleListScreen and friends). Screen-specific services keep using the
 * IRequest singleton pattern; this exists so a new module needs no new
 * service class for the standard list/create/detail calls.
 *
 * The response type is a generic — pass the screen's Response model so
 * `onSuccess`'s payload is typed instead of `any`, e.g.
 * `ModuleApi.request<CUS30000Response>(...)`.
 */
export default class ModuleApi {
    public static request<T = Record<string, any>>(
        trCode: string,
        body: Record<string, any>,
        listener: ModuleApiListener<T>,
        options?: { headers?: Record<string, string>; enableLoading?: boolean }
    ) {
        HttpNetworkService.getInstance().request({
            trCode,
            reqBody: body,
            enableLoading: options?.enableLoading ?? false,
            headers: options?.headers,
            listener: {
                onSuccess: (payload: any) => listener.onSuccess((payload ?? {}) as T),
                onFail: (error: Record<string, any>) => listener.onFail?.(error)
            }
        }).catch(() => { /* handled via listener.onFail */ });
    }
}
