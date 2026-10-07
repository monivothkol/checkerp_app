import POP from "@/core/utilities/pop";
import { BizCheckMobileSystem } from "@/shared/bizcheckmobile";

type ExportFn = (format: "pdf" | "excel", onDone: (ok: boolean, res?: { url?: string }, error?: unknown) => void) => void;

/** Statement export (ACT30000-36000): pick PDF/Excel, run the store's exportStatement, open the returned file. */
export async function pickStatementExport(tr: (key: string) => string, exportStatement: ExportFn): Promise<void> {
	const run = (format: "pdf" | "excel") => exportStatement(format, (ok, res, error) => {
		if (ok && res?.url) {
			void BizCheckMobileSystem.callBrowser({ url: res.url });
		} else if (!ok) {
			POP.apiError(error as { code?: string; message?: string } | undefined, tr("EXPORT_FAILED"));
		}
	});
	const format = await POP.choose<"pdf" | "excel">({ options: [{ text: tr("EXPORT_PDF"), value: "pdf" }, { text: tr("EXPORT_EXCEL"), value: "excel" }] });
	if (format) run(format);
}
