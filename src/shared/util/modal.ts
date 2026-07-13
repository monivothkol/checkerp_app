/**
 * Minimal Modal utility for the shared bizcheckmobile layer.
 *
 * NOTE: NivotsApp's full util/modal.ts depends on its own UI component set
 * (input-string, list-selector, overflow, server-message, ...). Those screens
 * are not part of this project, so this file implements only the surface the
 * bizcheckmobile layer consumes (alert / loading), on top of Ionic controllers.
 * App screens should keep using @/utilities/dialog-util.
 */
import { alertController, loadingController } from "@ionic/vue";

export default class Modal {
	private static instance: Modal;
	static isLoadingPresent = false;

	private constructor() {}

	static getInstance(): Modal {
		if (!this.instance) {
			this.instance = new Modal();
		}
		return this.instance;
	}

	async alert(message: string, option: Partial<{ title: string; buttonText: string; onDismiss: () => void }> = {}) {
		const alert = await alertController.create({
			header: option.title,
			message,
			buttons: [{ text: option.buttonText ?? "OK" }]
		});
		alert.onDidDismiss().then(() => option.onDismiss?.());
		await alert.present();
		return alert;
	}

	async presentLoading(message?: string) {
		const loading = await loadingController.create({ message });
		Modal.isLoadingPresent = true;
		await loading.present();
		return loading;
	}

	async dismissLoading() {
		try {
			await loadingController.dismiss();
		} catch {
			// no loading overlay is currently presented
		} finally {
			Modal.isLoadingPresent = false;
		}
	}
}
