/// <reference types="vitest/config" />
import vue from "@vitejs/plugin-vue";
import http, { IncomingMessage } from "node:http";
import https from "node:https";
import path from "node:path";
import { defineConfig, loadEnv, Plugin } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	Object.keys(loadEnv(mode, process.cwd(), "")).forEach((key: string) => {
		if (key.startsWith("VITE_")) {
			process.env[key] = loadEnv(mode, process.cwd(), "")[key];
		}
	});
	return {
		plugins: [
			vue(),
			// Dynamic subdomain proxy plugin
			dynamicSubdomainProxy()
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			host: true,
			hmr: {
				overlay: true,
				timeout: Number.MAX_SAFE_INTEGER
			},
			port: 3000,
		},
		preview: {
			host: true,
			port: 4173,
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./tests/unit/setup.ts"],
			include: ["tests/unit/**/*.spec.ts"],
			coverage: {
				provider: "v8",
				reporter: ["text", "html"],
				// Scoped to the units under test so the % is meaningful. Widen this
				// as more modules get tests (screens, other services).
				include: [
					"src/services/token-store.ts",
					"src/services/session-service.ts",
					"src/shared/utils/secure-storage.ts",
				],
			},
		},
	};
});

/**
 * Vite plugin for dynamic subdomain-based proxy routing
 * Reads subdomain from request headers (X-Subdomain) or query params
 * and dynamically routes to the appropriate target URL
 * Uses only Node.js built-in modules (no external dependencies)
 */
function dynamicSubdomainProxy(): Plugin {
	const attach = (server: any) => {
		const getRawBody = (req: IncomingMessage): Promise<string> =>
			new Promise((resolve) => {
				const chunks: Buffer[] = [];
				req.on("data", chunk => chunks.push(chunk));
				req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
			});

		const toCurl = (
			method: string,
			url: string,
			headers: http.OutgoingHttpHeaders,
			body?: string
		) => {
			let curl = `curl -X ${method} "${url}"`;
			Object.entries(headers).forEach(([key, value]) => {
				if (!value) return;
				if (Array.isArray(value)) {
					value.forEach(v => { curl += ` \\\n  -H "${key}: ${v}"`; });
				} else {
					curl += ` \\\n  -H "${key}: ${value}"`;
				}
			});
			if (body) curl += ` \\\n  --data '${body.replace(/'/g, "'\\''")}'`;
			return curl;
		};

		server.middlewares.use(async (req: any, res: any, next: any) => {
			if (!req.url?.startsWith("/alias-server")) return next();
			try {
				const subdomain = req.headers["x-subdomain"] as string | undefined;
				const targetPath = req.url.replace(/^\/alias-server/, "");
				const protocol = process.env.VITE_SERVER_PROTOCOL || "https";
				const domain = process.env.VITE_SERVER_DOMAIN || "nivotsit.cloud";
				const hostname = subdomain ? `${subdomain}.${domain}` : domain;
				const baseUrl = `${protocol}://${hostname}${targetPath}`;
				const target = new URL(baseUrl);

				const proxyOptions: http.RequestOptions = {
					hostname: target.hostname,
					port: target.port || (target.protocol === "https:" ? 443 : 80),
					path: target.pathname + target.search,
					method: req.method,
					headers: {} as any
				};

				const hopByHopHeaders = ["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-authenticate", "proxy-authorization", "te", "trailer"];
				Object.keys(req.headers).forEach(key => {
					if (!hopByHopHeaders.includes(key.toLowerCase())) {
						(proxyOptions.headers as any)![key] = req.headers[key];
					}
				});
				(proxyOptions.headers as any)!["host"] = target.host;
				const client = target.protocol === "https:" ? https : http;

				let rawBody = "";
				const shouldPrint = process.env.VITE_ENVIRONMENT === "development" && process.env.VITE_PRINT_CURL === "true";
				if (shouldPrint) {
					rawBody = await getRawBody(req);
					const curl = toCurl(req.method || "GET", target.toString(), proxyOptions.headers as http.OutgoingHttpHeaders, rawBody);
					console.log("\n========== CURL ==========");
					console.log(curl);
					console.log("==========================\n");
				}

				const proxyReq = client.request(proxyOptions, proxyRes => {
					const responseHeaders: Record<string, string | string[]> = {};
					Object.keys(proxyRes.headers).forEach(key => {
						if (!hopByHopHeaders.includes(key.toLowerCase())) responseHeaders[key] = proxyRes.headers[key] as string | string[];
					});
					if (!res.headersSent) res.writeHead(proxyRes.statusCode || 200, responseHeaders);
					proxyRes.pipe(res);
				});

				proxyReq.on("error", err => {
					console.error("[Proxy Error]", err);
					if (!res.headersSent) { res.writeHead(502, { "Content-Type": "text/plain" }); res.end("Bad Gateway: " + err.message); }
				});
				req.on("aborted", () => proxyReq.destroy());
				res.on("close", () => proxyReq.destroy());

				if (rawBody) { proxyReq.write(rawBody); proxyReq.end(); } else { req.pipe(proxyReq); }
			} catch (err: any) {
				console.error("[Middleware Error]", err);
				if (!res.headersSent) { res.writeHead(500, { "Content-Type": "text/plain" }); res.end("Internal Server Error"); }
			}
		});
	};

	return {
		name: "dynamic-subdomain-proxy",
		configureServer(server) { attach(server); },
		configurePreviewServer(server) { attach(server); }
	};
}
