import { actionSheetController, alertController, modalController, toastController } from "@ionic/vue";
import { markRaw, type Component } from "vue";
import i18n from "@/locale/i18n";
import PopupShell from "@/core/components/PopupShell.vue";
import DialogUtil from "@/utilities/dialog-util";

/**
 * The one way screens show sheets, alerts, toasts and the loading overlay: same surface as
 * checkerp_web's POP so the shared stores run unchanged. Built on Ionic controllers; the
 * loading overlay is DialogUtil's guarded one (also used by HttpNetworkService through here).
 */
export interface PopupResult<T = unknown> {
	button: string;
	data?: T;
}

type Status = "success" | "error";
type NoticeType = "success" | "info" | "warning" | "error";

const t = (key: string) => i18n.global.t(`POP.${key}`);

export default class POP {
	static isLoading = false;

	/**
	 * Show a content-only body in a sheet. The body emits `ok` (resolves) or `cancel` (rejects),
	 * exactly like the web's modal contract. Never hand-roll an ion-modal in a screen.
	 */
	public static showPopup<T = unknown>(component: Component, options: Partial<{ props: Record<string, unknown>; title: string; closable: boolean; cssClass: string }> = {}) {
		let settled = false;
		let modalReady: Promise<HTMLIonModalElement | null> = Promise.resolve(null);
		const promise = new Promise<PopupResult<T>>((resolve, reject) => {
			const done = (button: "ok" | "cancel", data?: unknown) => {
				if (settled) return;
				settled = true;
				void modalReady.then((m) => m?.dismiss());
				(button === "ok" ? resolve : reject)({ button, data: data as T });
			};
			modalReady = modalController.create({
				component: PopupShell,
				componentProps: {
					title: options.title ?? "",
					closable: options.closable ?? true,
					body: markRaw(component),
					bodyProps: options.props ?? {},
					onDone: done
				},
				cssClass: ["pop_sheet", options.cssClass ?? ""].join(" ").trim(),
				breakpoints: [0, 0.6, 0.95],
				initialBreakpoint: 0.95
			}).then(async (m) => {
				void m.onDidDismiss().then(() => done("cancel"));
				await m.present();
				return m;
			}).catch((error) => {
				done("cancel", error);
				return null;
			});
		});
		return { promise, close: () => void modalReady.then((m) => m?.dismiss()) };
	}

	/** Error alerts are skipped until this time: a "Connection Issue" alert already explains the failure. */
	private static quietErrorsUntil = 0;

	/**
	 * `connection: true` marks the network layer's "Connection Issue" alert (same rule as the web): for a few
	 * seconds after it, the same failure reaching a store's onFail does not raise a duplicate error alert.
	 */
	public static alert(options: { errorCode?: string; content?: string; title?: string; status?: Status; contentDetail?: string; okBtn?: { btnText?: string; onClick?: (result: unknown) => void }; connection?: boolean }) {
		if (options.connection) {
			POP.quietErrorsUntil = Date.now() + 5000;
		} else if ((options.status === "error" || options.errorCode) && Date.now() < POP.quietErrorsUntil) {
			return;
		}
		const lines = [options.content ?? "", options.contentDetail ?? "", options.errorCode ? `(${options.errorCode})` : ""];
		void alertController.create({
			header: options.title ?? (options.status === "error" ? t("ERROR") : t("ALERT")),
			message: lines.filter(Boolean).join("\n").replace(/<br\s*\/?>/gi, "\n"),
			cssClass: ["pop_alert", options.status ? `pop_${options.status}` : ""].join(" ").trim(),
			buttons: [{ text: options.okBtn?.btnText ?? t("OK"), handler: () => options.okBtn?.onClick?.(true) }]
		}).then((a) => a.present());
	}

	/** Transport failures (offline, timeout, HTTP 5xx) were already alerted once by the network layer. */
	public static isTransportError(e?: { code?: string } | null): boolean {
		const c = e?.code;
		return c === "TIMEOUT" || c === "NETWORK_ERROR" || !!c?.startsWith("HTTP_");
	}

	/** Business-error alert for a failed request; silent for transport errors (see isTransportError). */
	public static apiError(e: { code?: string; message?: string; detailMessage?: string } | null | undefined, title?: string) {
		if (POP.isTransportError(e)) return;
		POP.alert({ status: "error", title, content: e?.message || e?.code, contentDetail: e?.detailMessage, errorCode: e?.code });
	}

	/**
	 * Free-text prompt (web POP.input contract): resolves { button: "ok", data: text }, rejects on cancel.
	 * With isRequired, OK stays disabled-in-effect: an empty answer keeps the prompt open.
	 */
	public static input(options: { title?: string; subtitle?: string; isRequired?: boolean }): Promise<{ button: string; data: string }> {
		return new Promise((resolve, reject) => {
			void alertController.create({
				header: options.title ?? "",
				message: options.subtitle,
				cssClass: "pop_alert",
				inputs: [{ name: "text", type: "textarea" }],
				buttons: [
					{ text: t("CANCEL"), role: "cancel", handler: () => reject({ button: "cancel" }) },
					{
						text: t("OK"),
						handler: (v: { text?: string }) => {
							const text = String(v?.text ?? "").trim();
							if (options.isRequired && !text) return false;
							resolve({ button: "ok", data: text });
							return true;
						}
					}
				]
			}).then((a) => a.present());
		});
	}

	/** Option menu (action sheet): resolves the chosen option's value, or undefined when dismissed. */
	public static choose<T>(options: { title?: string; options: { text: string; value: T; role?: "destructive" }[] }): Promise<T | undefined> {
		return new Promise((resolve) => {
			void actionSheetController.create({
				header: options.title,
				buttons: [
					...options.options.map((o) => ({ text: o.text, role: o.role, handler: () => resolve(o.value) })),
					{ text: t("CANCEL"), role: "cancel", handler: () => resolve(undefined) }
				]
			}).then((sheet) => {
				void sheet.onDidDismiss().then(() => resolve(undefined));
				return sheet.present();
			});
		});
	}

	public static confirm(options: { content: string; contentDetail?: string; title?: string; okBtn?: { btnText?: string; onClick?: (result: unknown) => void }; cancelBtn?: { btnText?: string; onClick?: () => void } }) {
		void alertController.create({
			header: options.title ?? "",
			message: [options.content, options.contentDetail].filter(Boolean).join("\n"),
			cssClass: "pop_alert",
			buttons: [
				{ text: options.cancelBtn?.btnText ?? t("NO"), role: "cancel", handler: () => options.cancelBtn?.onClick?.() },
				{ text: options.okBtn?.btnText ?? t("YES"), handler: () => options.okBtn?.onClick?.(true) }
			]
		}).then((a) => a.present());
	}

	public static openNotification(options: { type: NoticeType; content: string; title?: string }) {
		const color = { error: "danger", success: "success", warning: "warning", info: "medium" }[options.type];
		void toastController.create({ header: options.title, message: options.content, duration: 2500, position: "top", color })
			.then((toast) => toast.present());
	}

	/** Single overlay (DialogUtil guards against stacking). */
	public static loading() {
		if (this.isLoading) return;
		this.isLoading = true;
		DialogUtil.showLoading();
	}

	public static closeLoading(options: Partial<{ onClose: () => void }> = {}) {
		if (!this.isLoading) return;
		this.isLoading = false;
		DialogUtil.closeLoading();
		options.onClose?.();
	}
}
