/**
 * In-memory holder for the password during the ADM11000 -> ADM12000 create
 * flow. Deliberately NOT in ModuleFlowStore/sessionStorage — a page refresh
 * drops it and the confirm screen sends the user back to the form.
 */
let secret = "";

export const UserCreateSecret = {
    set(value: string): void {
        secret = value;
    },
    take(): string {
        return secret;
    },
    clear(): void {
        secret = "";
    }
};
