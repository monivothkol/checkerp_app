import { BizCheckMobileDevice, BizCheckMobileLogger, BizCheckMobileNetwork, BizCheckMobileSystem } from "@/shared/bizcheckmobile";
export default class GoogleService {
	private geocoder: any;
	protected markerClusterInstance: any;
	protected markerInstance: any;
	protected mapInstance: any;
	private googleMapsApiKey: string = BizCheckMobileDevice.isAndroid() ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY_ANDROID : import.meta.env.VITE_GOOGLE_MAPS_API_KEY_IOS;

	public initializeGeocoder = async (): Promise<void> => {
		const googleObj = (window as any).google;
		if (!googleObj?.maps) {
			await this.onLoadMap();
		}
		const { Geocoder } = await googleObj.maps.importLibrary("geocoding") as any;
		this.geocoder = new Geocoder();
	};
	public onLoadMap = async (): Promise<void> => {
		((g: Record<string, unknown>) => {
			let h: Promise<void> | null = null;
			let a: HTMLScriptElement;
			let k: string;
			const p = "The Google Maps JavaScript API";
			const c = "google";
			const l = "importLibrary";
			const q = "__ib__";
			const m = document;
			const b = (window as any)[c] || ((window as any)[c] = {});
			const d = b.maps || (b.maps = {});
			const r = new Set<string>();
			const e = new URLSearchParams();

			const u = () => h || (h = new Promise<void>((f, n) => {
				a = m.createElement("script");
				e.set("libraries", [...r].join(","));
				for (k in g) {
					if (Object.prototype.hasOwnProperty.call(g, k)) {
						e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), String((g as Record<string, unknown>)[k]));
					}
				}
				e.set("callback", c + ".maps." + q);
				a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
				d[q] = f;
				a.onerror = () => {
					h = null;
					n(new Error(p + " could not load."));
				};
				const nonceElement = m.querySelector("script[nonce]");
				const nonce = nonceElement && (nonceElement as HTMLScriptElement).nonce;
				if (nonce) a.nonce = nonce;
				m.head.append(a);
			}));

			if (d[l]) {
				BizCheckMobileLogger.log(p + " only loads once. Ignoring:", g);
			} else {
				d[l] = (f: unknown, ...n: unknown[]) => {
					r.add(String(f));
					return u().then(() => d[l](f, ...n));
				};
			}
		})(

			{
				rankby: "distance",
				key: this.googleMapsApiKey,
				v: "weekly",
				libraries: "marker"
			}
		);
		// BizCheckMobileLogger.log("googleMapsApiKey ==== ", this.googleMapsApiKey, "isAndroid ==== ", BizCheckMobileDevice.isAndroid());
		// const oldScript = document.querySelector("script[src='https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js']");
		// if (!oldScript) {
		// 	const script = document.createElement("script");
		// 	script.src = "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js";
		// 	document.head.prepend(script);
		// }

		const googleObj = (window as any).google;
		if (!googleObj?.maps?.importLibrary) {
			throw new Error("Google Maps library is not loaded.");
		}
		//@ts-ignore
		this.markerInstance = await googleObj.maps.importLibrary("marker") as any;

	};

	public initMapLoad = async (branchLocation?: any[], isMyLocation: boolean = false, type?: string, currentLocationIconUrl?: string) => {
		this.onLoadMap();
		const currentLocation = await this.getMyCurrentLocation();
		const googleObj = (window as any).google;
		if (!googleObj?.maps?.importLibrary) {
			throw new Error("Google Maps library is not loaded.");
		}
		const { Map } = await googleObj.maps.importLibrary("maps") as any;

		const map = new Map(document.getElementById("map") as HTMLElement, {
			center: { lat: currentLocation.latitude, lng: currentLocation.longitude },
			zoom: isMyLocation ? 16 : 14.5,
			mapId: "4504f8b37365c3d0",
			mapTypeControl: false,
			clickableIcons: false,
			mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP
		});
		if (isMyLocation) {
			map.setOptions({
				center: { lat: currentLocation.latitude, lng: currentLocation.longitude },
				zoom: 16,
			});
		}
		const content = currentLocationIconUrl
			? (() => {
				const img = document.createElement("img");
				img.src = currentLocationIconUrl;
				img.alt = "";
				img.setAttribute("style", "width: 36px; height: 36px; display: block; pointer-events: none;");
				return img;
			})()
			: (() => {
				const div = document.createElement("div");
				div.className = "current-location";
				div.textContent = "";
				div.setAttribute("style", "width: 25px;height: 25px;background-color: #4285F4;color: #FFFFFF;padding: 4px 8px;border-radius: 50%;font-size: 12px;font-weight: 500;line-height: 140%; border: 5px solid #ffffff;");
				return div;
			})();
		const { AdvancedMarkerElement } = this.markerInstance as any;
		if (this.markerInstance) {
			new AdvancedMarkerElement({
				map,
				position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
				content,
			});
		}
		return map;
	};

	formatDistance(distance: number, unit: "km" | "m"): string {
		if (distance < 1) {
			return `${Math.round(distance * 1000)} m`;
		} else if (distance < 10) {
			return `${distance.toFixed(2)}${unit === "km" ? "km" : "m"}`;
		} else {
			return `${distance.toFixed(2)}${unit === "km" ? "km" : "m"}`;
		}
	}

	calculateDistance(origin: any, destination: any, unit: "km" | "m") {

		BizCheckMobileLogger.log("calculateDistance====12 ", origin, destination, unit);
		const R = unit === "km" ? 6371 : 6371000; // Earth's radius in km or meters
		const dLat = this.toRadians(destination.latitude - origin.latitude);
		const dLng = this.toRadians(destination.longitude - origin.longitude);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.toRadians(origin.latitude)) *
			Math.cos(this.toRadians(destination.latitude)) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c;
		return {
			distance,
			distanceText: this.formatDistance(distance, unit),
			unit
		};
	}

	getDistancesFromCurrentLocation(currentLocation: any, destinations: any[]) {
		const results: any[] = [];
		for (let index = 0; index < destinations.length; index++) {
			const destination = destinations[index];
			const distance = this.calculateDistance(currentLocation, destination, "km");
			destination.distance = distance.distance as number;
			destination.distanceText = distance.distanceText;
			results.push(destination);
		}
		const sortedResults = results.sort((a: any, b: any) => a.distance - b.distance);
		return sortedResults.filter((item: any) => item.distance <= 5);
	}


	findNearestLocation(currentLocation: any, destinations: any[]): Promise<any[]> {
		const results = this.getDistancesFromCurrentLocation(currentLocation, destinations);
		return Promise.resolve(results.length > 0 ? results : []);
	}

	public getMyCurrentLocation = async (): Promise<any> => {
		if (BizCheckMobileDevice.isApp()) {
			return BizCheckMobileSystem.getGPS({
				callback: (response: any) => {
					BizCheckMobileLogger.log("responseBody GPS Location==== ", response);
					const responseBody = response?.body ? response.body : response;
					return responseBody;
				}
			});
		} else {
			const position = new Promise<any>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
			});
			return position.then((response: any) => {
				return {
					latitude: response.coords.latitude,
					longitude: response.coords.longitude,
				};
			});
		}
	};

	toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	public geocodeByLocation = async (latitude: number, longitude: number): Promise<any> => {
		if (!this.geocoder) {
			await this.initializeGeocoder();
		}

		return new Promise((resolve, reject) => {
			this.geocoder.geocode(
				{ location: { lat: latitude, lng: longitude } },
				(results: any, status: string) => {
					if (status === "OK" && results && results.length > 0) {
						BizCheckMobileLogger.log("Geocode results:", results[0].formatted_address);
						resolve({
							success: true,
							formattedAddress: results[0].formatted_address,
							results: results
						});
					} else {
						BizCheckMobileLogger.log("Geocode failed with status:", status);
						reject({
							success: false,
							status: status,
							message: "Unable to geocode location"
						});
					}
				}
			);
		});
	};

	public geocodeByAddress = async (address: string): Promise<any> => {
		if (!this.geocoder) {
			await this.initializeGeocoder();
		}

		return new Promise((resolve, reject) => {
			this.geocoder.geocode(
				{ address: address },
				(results: any, status: string) => {
					if (status === "OK" && results && results.length > 0) {
						const location = results[0].geometry.location;
						BizCheckMobileLogger.log("Geocode results:", {
							address: results[0].formatted_address,
							latitude: location.lat(),
							longitude: location.lng()
						});
						resolve({
							success: true,
							formattedAddress: results[0].formatted_address,
							latitude: location.lat(),
							longitude: location.lng(),
							results: results
						});
					} else {
						BizCheckMobileLogger.log("Geocode failed with status:", status);
						reject({
							success: false,
							status: status,
							message: "Unable to geocode address"
						});
					}
				}
			);
		});
	};

	public async addMarker(map: any, latitude: number, longitude: number, item?: any) {
		const { Marker } = this.markerInstance;
		const marker = new Marker({
			map,
			position: { lat: latitude, lng: longitude },
		});
		return marker;
	}
	public async advancedMarker(map: any, latitude: number, longitude: number, image: string) {
		const { Marker } = this.markerInstance;
		const marker = new Marker({
			map,
			position: { lat: latitude, lng: longitude },
			icon: image,
		});
		return marker;
	}

	public addMarkerCluster(map: any, markers: any[]) {
		const markerClustererInstance = new (window as any).markerClusterer.MarkerClusterer({
			markers: markers,
			map,
			zoomOnClick: true,
			averageCenter: true,
		});
		return markerClustererInstance;
	}

	public getAddressDetail(option: { latitude: number, longitude: number }): Promise<any> {
		return new Promise((resolve) => {
			BizCheckMobileNetwork.requestHttp({
				url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${option.latitude}&lon=${option.longitude}`,
				headers: {
					"Accept-Language": "en-US",
					"Content-Type": "application/json"
				},
				timeout: 120000,
				method: "POST"
			}).then((response: any) => {
				BizCheckMobileLogger.info("httpFetch => ", response.display_name);
				resolve({ displayName: response.display_name, addressDetail: response.address });
			}).catch((error: any) => {
				BizCheckMobileLogger.error("getAddressDetail error: ", error);
				resolve({ displayName: "", addressDetail: "" });
			}).finally(() => {
				resolve({ displayName: "", addressDetail: "" });
			});
		});
	}
}

declare global {
	interface Window {
		google: any;
	}
}
