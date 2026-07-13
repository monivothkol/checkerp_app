import { SharedDataStore } from "@/stores/shared-data";
import DialogUtil from "@/utilities/dialog-util";
import { BizCheckMobileApp, BizCheckMobileDatabase, BizCheckMobileDevice, BizCheckMobileEvents, BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { useIonRouter } from "@ionic/vue";
import { getCurrentInstance } from "vue";
import { useRoute } from "vue-router";

export default class RouterServices {

	private router: ReturnType<typeof useIonRouter>;
	private route: ReturnType<typeof useRoute>;
	// Store full navigation info for each entry
	private static history: Array<{ path: string; options: Partial<RouterOptionalParams> }> = [];
	static isBackToRoot: boolean = true;

	/**
	 * useIonRouter / useRoute rely on inject() and only work during synchronous setup().
	 * Event handlers and some async paths have no current instance; reuse the refs captured
	 * from the first RouterServices constructed during setup (e.g. App.vue).
	 */
	private static cachedIonRouter: ReturnType<typeof useIonRouter> | null = null;
	private static cachedRoute: ReturnType<typeof useRoute> | null = null;

	constructor() {
		const inSetup = !!getCurrentInstance();
		if (inSetup) {
			this.router = useIonRouter();
			this.route = useRoute();
			RouterServices.cachedIonRouter = this.router;
			RouterServices.cachedRoute = this.route;
		} else {
			if (!RouterServices.cachedIonRouter || !RouterServices.cachedRoute) {
				throw new Error(
					"RouterServices: ion router is not ready yet. Construct RouterServices at least once during a component setup() (e.g. App.vue) before using it from event handlers."
				);
			}
			this.router = RouterServices.cachedIonRouter;
			this.route = RouterServices.cachedRoute;
		}
	}

	public push(path: string, options: Partial<RouterOptionalParams> = { allowSwipeBack: true, autoCloseModal: true }) {
		BizCheckMobileLogger.info(`option: ${JSON.stringify(options)}`);
		if (!options.allowSwipeBack) {
			BizCheckMobileLogger.info("RouterServices.push", "Navigation with allowSwipeBack set to false");
			BizCheckMobileLogger.info("RouterServices.push", `Navigating to path: ${path}`);
			this.router.navigate(path, "forward", "pop");
		} else {
			this.router.push({ path, ...options });
		}

		if ((DialogUtil.isDialogOpen || DialogUtil.isModalOpen) && options.autoCloseModal) {
			DialogUtil.closeDialog({ role: "cancel" });
			DialogUtil.closeModal({ role: "cancel" });
		}

		// Store both path and options
		RouterServices.history.push({ path, options });
	}

	public getQueryParam(param: string) {
		return this.route.query[param] ? this.route.query[param] : RouterServices.history[RouterServices.history.length - 1]?.options ? RouterServices.history[RouterServices.history.length - 1]?.options?.query?.[param] : "";
	}

	public replace(path: string, options: Partial<RouterOptionalParams> = { allowSwipeBack: true }) {
		if (!options.allowSwipeBack) {
			this.router.navigate(path, "forward", "pop");
		} else {
			this.router.replace({ path, ...options });
		}

		if (DialogUtil.isDialogOpen || DialogUtil.isModalOpen) {
			DialogUtil.closeDialog({ role: "cancel" });
			DialogUtil.closeModal({ role: "cancel" });
		}
	}

	public back() {

		// Close any open dialogs or modals
		if (DialogUtil.isDialogOpen || DialogUtil.isModalOpen) {
			DialogUtil.closeDialog({ role: "cancel" });
			DialogUtil.closeModal({ role: "cancel" });
			return;
		}

		if (RouterServices.history.length >= 1) {
			// Peek at the previous entry (the one we would go back to)
			const prevEntry = RouterServices.history[RouterServices.history.length - 1];
			// If allowSwipeBack is explicitly false, prevent back navigation
			BizCheckMobileLogger.info("RouterServices.back", "Prev entry: ", prevEntry);

			if (prevEntry.options && prevEntry.options.allowSwipeBack === false) {
				// You can show a message or handle as needed
				// For now, just return and do not navigate back
				return;
			}

			if (!RouterServices.isBackToRoot) {
				this.backToRoot();
				return;
			}

			this.router.back();
			RouterServices.history.pop();
			return;
		}

		if (RouterServices.history.length === 0) {
			RouterServices.history = [];
			if (BizCheckMobileDevice.isApp()) {
				DialogUtil.showConfirmation({
					header: "Exit App",
					message: "Are you sure you want to exit the app?",
					onConfirm: () => {
						BizCheckMobileDatabase.closeDatabase({
							onSuccess: () => {
								BizCheckMobileLogger.info("closeDatabase", "Database closed");
								BizCheckMobileApp.exit();
							},
							onError: (error) => {
								BizCheckMobileLogger.error("closeDatabase", error);
							}
						});
					}
				});
			} else {
				this.backToRoot();
			}
		}
	}

	public forward() {
		this.router.forward();
		// Optionally handle forward history if needed
	}

	public canGoBack(deep: number = 1): boolean {
		return this.router.canGoBack(deep);
	}

	public backToRoot(path: string = "/main/home", options: Partial<RouterOptionalParams> = { allowSwipeBack: true }) {
		if (path !== "/main/home" && path !== "/LOG1000000") {
			RouterServices.isBackToRoot = false;
			const backEntry = RouterServices.history[0];
			RouterServices.history = [];
			RouterServices.history.push({ path, options });
		} else {
			RouterServices.isBackToRoot = true;
			RouterServices.history = [];
		}

		SharedDataStore().setItem("NAV_RESET_KEY", `${Date.now()}-${Math.random()}`);

		BizCheckMobileLogger.info("backToRoot => ", path);
		this.router.navigate(path, "root", "replace", options as any);
		if (DialogUtil.isDialogOpen || DialogUtil.isModalOpen) {
			DialogUtil.closeDialog({ role: "cancel" });
			DialogUtil.closeModal({ role: "cancel" });
		}
	}

	// Utility: get last history entry
	public static getLastHistory() {
		return RouterServices.history[RouterServices.history.length - 1];
	}

	// Utility: get all history
	public static getHistory() {
		return [...RouterServices.history];
	}

	public registerBackHandler() {
		BizCheckMobileEvents.register({
			eventName: "onBackButton",
			callback: () => {

				this.back();
			}
		});
	}
}
interface RouterOptionalParams {
	query: Record<string, any>;
	params: Record<string, any>;
	allowSwipeBack: boolean;
	autoCloseModal: boolean;
}
