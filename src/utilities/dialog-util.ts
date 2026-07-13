/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { BizCheckMobileLogger } from "@/shared/bizcheckmobile";
import { alertController, createAnimation, loadingController, modalController, toastController } from "@ionic/vue";

export default class DialogUtil {

	private static dialogList: HTMLIonModalElement[] = [];
	private static toastList: HTMLIonToastElement[] = [];
	private static loadingList: HTMLIonLoadingElement[] = [];
	private static modalList: HTMLIonModalElement[] = [];
	private static alertList: HTMLIonAlertElement[] = [];
	static isDialogOpen = false;
	static isModalOpen = false;
	static isToastOpen = false;
	static isLoadingOpen: boolean;

	// Implement dialog utility methods here
	static showDialog(component: any, options: Partial<{ props?: Record<string, any>, onDidDismiss: (result: any) => void }> = {}): void {
		modalController.create({
			component: component,
			cssClass: "",
			backdropDismiss: true,
			showBackdrop: true,
			initialBreakpoint: 1,
			breakpoints: [0, 1],
			componentProps: options.props,
			canDismiss: async (data?: any, role?: string) => {
				return role !== "gesture";
			}
		}).then((dialog) => {
			this.dialogList.push(dialog);
			document.body.style.overflow = "hidden";
			this.isDialogOpen = true;
			dialog.present();
			dialog.onWillDismiss().then((result: any) => {
				document.body.style.overflow = "";
				if (options.onDidDismiss) {
					options.onDidDismiss(result);
				}
				this.isDialogOpen = false;
			});
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});
	}

	static closeDialog(options: Partial<{ role: string, data: Record<string, any> }> = { data: {}, role: "" }): void {
		const dialog = this.dialogList.pop();
		dialog?.dismiss(options.data, options.role).then(() => {
			this.isDialogOpen = false;
		});
	}

	static closeAllDialogs(): void {
		this.dialogList.forEach(dialog => dialog.dismiss().then(() => {
			this.isDialogOpen = false;
		}));
		this.dialogList = [];
	}

	static showModal(component: any, options: Partial<{ props?: Record<string, any>, onDidDismiss: (result: any) => void }> = {}): void {
		modalController.create({
			component: component,
			cssClass: "modal_full",
			backdropDismiss: true,
			showBackdrop: true,
			componentProps: options.props,
			enterAnimation: this.enterAnimate,
			leaveAnimation: this.leaveAnimate,
			canDismiss: async (data?: any, role?: string) => {
				return role !== "gesture";
			}
		}).then((modal: any) => {
			this.modalList.push(modal);
			modal.present();
			this.isModalOpen = true;
			modal.onWillDismiss().then((result: any) => {
				if (options.onDidDismiss) {
					options.onDidDismiss(result);
				}
				this.isModalOpen = false;
			});
		});
	}

	private static enterAnimate = (baseEl: HTMLElement) => {
		const root = baseEl.shadowRoot;
		if (!root) return createAnimation();

		const backdropEl = root.querySelector("ion-backdrop");
		const wrapperEl =
			root.querySelector(".modal-wrapper") ||
			root.querySelector(".ion-overlay-wrapper");

		const backdropAnimation = createAnimation();
		if (backdropEl) {
			backdropAnimation
				.addElement(backdropEl)
				.fromTo("opacity", "0.01", "var(--backdrop-opacity)");
		}

		const wrapperAnimation = createAnimation();
		if (wrapperEl) {
			wrapperAnimation
				.addElement(wrapperEl)
				.keyframes([
					{ offset: 0, opacity: "0", transform: "scale(0.9)" },
					{ offset: 1, opacity: "1", transform: "scale(1)" },
				]);
		}

		return createAnimation()
			.addElement(baseEl)
			.easing("ease-out")
			.duration(400)
			.addAnimation([backdropAnimation, wrapperAnimation]);
	};


	private static leaveAnimate = (baseEl: HTMLElement) => {
		return DialogUtil.enterAnimate(baseEl).direction("reverse");
	};


	static closeModal(options: Partial<{ role: string, data: Record<string, any>, callback?: () => void }> = { data: {}, role: "", callback: () => { } }): void {
		const modal = this.modalList.pop();
		modal?.dismiss(options.data, options.role).then(() => {
			this.isModalOpen = false;
			if (options.callback) {
				options.callback();
			}
		});
	}

	static closeAllModals(): void {
		this.modalList.forEach(modal => modal.dismiss().then(() => {
			this.isModalOpen = false;
		}));
		this.modalList = [];
	}

	static showToast(options: Partial<{ message: string, duration?: number, onShowToast?: () => void }> = {}): void {
		const { message, duration, onShowToast } = options;
		toastController.create({
			message: message,
			duration: (duration && duration > 0) ? duration : 300,
			position: "bottom",
			cssClass: "custom-toast"
		}).then((toast) => {
			this.toastList.push(toast);
			toast.present();
			this.isToastOpen = true;
			if (onShowToast) {
				onShowToast();
			}
		});
	}

	static closeToast(): void {
		const toast = this.toastList.pop();
		toast?.dismiss().then(() => {
			this.isToastOpen = false;
		});
	}

	static closeAllToasts(): void {
		this.toastList.forEach(toast => toast.dismiss().then(() => {
			this.isToastOpen = false;
		}));
		this.toastList = [];
	}

	static showLoading(options: Partial<{ message: string, onLoading?: () => void }> = {}): void {
		const loading = async () => {
			const { message, onLoading } = options;

			if (this.isLoadingOpen) {
				return;
			}

			this.isLoadingOpen = true;

			const loading = await loadingController.create({
				message: message
			});

			this.loadingList.push(loading);
			await loading.present();

			if (onLoading) {
				onLoading();
			}
		};

		loading();
	}

	static closeLoading(): void {
		const loading: any = this.loadingList.pop();
		if (!loading) {
			this.isLoadingOpen = false;
			return;
		}
		loading.dismiss().then(() => {
			this.isLoadingOpen = false;
		}).catch(() => {
			this.isLoadingOpen = false;
		});
	}

	static closeAllLoadings(): void {
		this.loadingList.forEach(loading => loading.dismiss().then(() => {
			this.loadingList = this.loadingList.slice(0, -1);
			if (this.loadingList.length === 0) {
				this.isLoadingOpen = false;
			}
		}));
	}

	static showAlert(options: { header?: string, message: string, onDidDismiss?: (result: any) => void, button?: { label: string } }): void {
		const alert = this.alertList.pop();
		if (alert) {
			alert.dismiss().then(() => {
				this.showAlert(options);
			});
		} else {
			alertController.create({
				header: options.header,
				backdropDismiss: false,
				message: options.message,
				buttons: [
					{
						text: options.button?.label || "Okay",
						handler: (result: any) => {
							if (options.onDidDismiss) {
								options.onDidDismiss(result);
							}
							this.isDialogOpen = false;
						},
						role: "confirm"
					}
				]
			}).then((alert) => {
				this.alertList.push(alert);
				alert.present();
				this.isDialogOpen = true;

				alert.onWillDismiss().then((result: any) => {
					if (options.onDidDismiss) {
						options.onDidDismiss(result);
					}
					this.isDialogOpen = false;
				});
			});
		}
	}

	static closeAlert(): void {
		const alert = this.alertList.pop();
		alert?.dismiss().then(() => {
			this.isDialogOpen = false;
		});
	}

	static closeAllAlerts(): void {
		this.alertList.forEach(alert => alert.dismiss().then(() => {
			this.isDialogOpen = false;
		}));
		this.alertList = [];
	}

	static showConfirmation(options: { header: string, message: string, onConfirm?: () => void, onCancel?: () => void }): void {
		alertController.create({
			header: options.header,
			message: options.message,
			backdropDismiss: false,
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
				},
				{
					text: "Confirm",
					role: "confirm",
				}
			]
		}).then((alertResult) => {
			this.alertList.push(alertResult);
			alertResult.present();
			this.isDialogOpen = true;

			alertResult.onWillDismiss().then((result: any) => {

				this.closeConfirmation();

				this.isDialogOpen = false;

				if (result.role === "cancel") {
					if (options.onCancel) {
						options.onCancel();
					}
					return;
				}

				if (result.role === "confirm") {
					if (options.onConfirm) {
						options.onConfirm();
					}
				}

			});
		});
	}

	static closeConfirmation(): void {
		const alert = this.alertList.pop();
		alert?.dismiss().then(() => {
			this.isDialogOpen = false;
		});
	}

	static showCustomDialog(component: any, options: Partial<{ props?: Record<string, any>, onDidDismiss: (result: any) => void }> = {}): void {
		modalController.create({
			component: component,
			cssClass: "",
			backdropDismiss: true,
			showBackdrop: true,
			initialBreakpoint: 1,
			breakpoints: [0, 1],
			componentProps: options.props
		}).then((dialog) => {
			this.dialogList.push(dialog);
			document.body.style.overflow = "hidden";
			this.isDialogOpen = true;
			dialog.present();
			dialog.onWillDismiss().then((result: any) => {
				document.body.style.overflow = "";
				if (options.onDidDismiss) {
					options.onDidDismiss(result);
				}
				this.isDialogOpen = false;
			});
		});
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}
}
