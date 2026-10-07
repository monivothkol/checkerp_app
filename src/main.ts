import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/display.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";

/* Theme variables */
import "@/assets/style/main.scss";

import * as bmComponents from "@/components";
import i18n from "@/locale/i18n";
import AppConfig, { BizCheckMobileDevice } from "@/shared/bizcheckmobile";
import * as ionComponents from "@ionic/vue";
import { pinia } from "@/store/pinia";
import { englishOnly } from "./directives/EnglishOnly";
import { khmerOnly } from "./directives/KhmerOnly";
import { safeHtml } from "./directives/SafeHtml";

const app = createApp(App);

app.use(ionComponents.IonicVue, { animated: true, mode: "ios", swipeBackEnabled: BizCheckMobileDevice.isIOS() ? true : false, rippleEffect: false });
app.use(router);
app.use(i18n);
app.use(pinia);
app.directive("english-only", englishOnly);
app.directive("khmer-only", khmerOnly);
app.directive("safe-html", safeHtml);

AppConfig.setLogger({ enable: true, level: "all" });

// register Ionic Components globally (copied views/components rely on global ion-* resolution)
for (const component of Object.keys(ionComponents)) {
	if (/^Ion[A-Z]\w+$/.test(component)) {
		app.component(component, (ionComponents as any)[component]);
	}
}

// register bm custom components globally
for (const component of Object.keys(bmComponents)) {
	app.component(component, (bmComponents as any)[component]);
}

// Initialize BizCheckMobile App Config (mirrors the source project's main.ts)
AppConfig.setNetwork({
	method: "POST",
	timeout: 2 * 60 * 60 * 1000,
	mockUrl: import.meta.env.VITE_API_MOCK_URL,
	enableMock: JSON.parse(import.meta.env.VITE_ENABLE_MOCK_REQUEST || "false"),
	option: {
		credentials: "include",
		cache: "no-cache",
		mode: "cors",
	},
	headers: {
		"Content-Type": "application/json",
		"Accept-Language": "en-US"
	},
});

AppConfig.setDateTimeSystemPattern({
	date: "yyyymmdd",
	time: "hhmmssSSS"
});

AppConfig.setDatePattern({
	pattern: "DD MMM, YYYY"
});

AppConfig.setDateTimePattern({
	pattern: "DD MMM, YYYY HH:mm:ss"
});

AppConfig.setTimePattern({
	pattern: "HH:mm:ss"
});

AppConfig.setCurrencyPattern({
	currencyCode: {
		USD: "#,###.00",
		KHR: "#,###"
	}
});

AppConfig.setDataPattern({
	phoneNo: {
		pattern: "### ### ####"
	},
	accountNo: {
		pattern: "#-##-#########-#",
		prefix: "000"
	},
	customerNo: {
		pattern: "#-##-#########-#",
		prefix: "000"
	},
	loanAccountNo: {
		pattern: "####-####-##-######",
		prefix: "000"
	},
	applicationNo: {
		pattern: "####-##-####-######",
		prefix: ""
	},
	cardNo: {
		pattern: "####-####-####-####",
		prefix: ""
	}
});

app.config.errorHandler = (err, vm, info) => {
	console.error("Error:", err);
	console.error("Component:", vm);
	console.error("Info:", info);
};

// Mount the app after initialization
router.isReady().then(() => {
	app.mount("#app");
});
