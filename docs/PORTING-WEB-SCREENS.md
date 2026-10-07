# Porting checkerp_web screens to checkerp_app

The app runs the **same screens as the web** (same screen id, path, models, stores, APIs, i18n keys),
re-rendered with Ionic for a phone. Web repo: `../checkerp_web`.

## What is already shared (do NOT re-create)
| Layer | Location in app | Notes |
|---|---|---|
| Models | `src/models/**` | verbatim copy of the web |
| APIs | `src/services/api/<MOD>/<verbNoun>.ts` | verbatim; one class per trCode, `IRequest` |
| Stores | `src/store/**/<ID>Store.ts` | verbatim Pinia stores — reuse them, the view logic lives there |
| i18n | `src/locale/messages/web-*.json` | every web key (`SAL11000.PAGE_TITLE` …) already works |
| HTTP | `src/services/http-network-service.ts` | same contract as the web |
| Utils | `src/core/utilities/{pop,ut,date,phones,pref,data-storage}.ts` | `UT`/`DATE` = web bodies |
| Recipe engine | `src/core/components/module/*` + `MODULE_CONFIGS` | already serves CAT/BRD/UNT/INV/CUS/CUSG/SUP/DPM/TAX/PSM/STM/EXPL/EXPC + PRD create |

## Rules for every ported screen
1. **Same path + name as the web**: `checkerp_web/src/views/POS/SAL/SAL11000.vue` → `checkerp_app/src/views/POS/SAL/SAL11000.vue`.
   The router auto-routes any `views/**/XXX#####.vue` to `/XXX#####` and throws on a duplicate id.
   Non-screen components (modals, tabs) keep the web file name (e.g. `InvoicePayModal.vue`) in the same folder.
2. **Read the web view + its store + its models fully first.** Keep every behaviour: validation, guards,
   status transitions, permissions checks, confirm dialogs, navigation targets and query params.
   Only the presentation changes. Do not drop features; if something truly can't work on a phone, say so in the report.
3. **Reuse the web store** (`import { SAL11000Store } from "@/store/POS/SAL/SAL11000Store"`) exactly as the web view does.
   Do not edit stores, models, APIs, core, router, `main.scss`, or `en.json`/`km.json`/`web-*.json`.
   If one of those must change, stop and describe the change in your report instead.
4. **Ionic UI** (components are global, no imports): `ion-page` root, `bm-header :title :default-href="<list route>"` with
   `#end` (header buttons) and `#bottom` (search bar / segments) slots, `ion-content`, `ion-list class="scr_list"` + `ion-item`,
   `ion-input/ion-textarea/ion-select/ion-toggle` with `label-placement="stacked"`, `ion-footer > ion-toolbar` for primary actions,
   `ion-fab` for "create", `ion-item-sliding` for row actions, `ion-segment` for tabs, `bm-empty-state :description="'<i18n key>'"`.
   Tables become lists: title = code/name, `<p>` lines for the important columns, `ion-badge` for status.
   Font sizes 10/12/14/16px only; spacing 2/4/8/12/16.
5. **Script**: `<script setup lang="ts">` + `defineOptions({ name: "<ID>" })`, typed with `src/models` types (no `any` at the API seam).
   `const { t } = useI18n(); const tr = (k: string) => t(\`<ID>.${k}\`)` — same keys as the web.
6. **Lifecycle**: use `useViewEnter(fn)` from `@/core/modules/use-view-enter` for "load when shown/returned to" (Ionic keeps pages alive;
   `onIonViewWillEnter` only works on the routed component itself). Query params via `useRoute().query`.
7. **Lists**: always `usePagedList` from `@/core/modules/use-paged-list` + `ion-infinite-scroll :disabled="!hasMore"` + `ion-refresher`.
   Never hand-roll paging. Filters: the web filter bar → `ModuleFilterPanel`-style sheet or `ion-select`s in `#bottom`.
8. **Modals**: `POP.showPopup(Component, { title, props })` — body is content-only and emits `ok(data)` / `cancel`.
   Never hand-roll `ion-modal`. Alerts: `POP.alert`, `POP.confirm`; request failures: `POP.apiError(e, title)` (silent for
   transport errors, which the network layer already alerted). Loading: `enableLoading: true` on the request.
9. **Formatting**: exactly what the web twin does (`UT.currency(v, "USD")`, `DATE.*`, same slices). No new formatters.
10. **App-only i18n keys** (rare — reuse web keys first): put them in `src/locale/messages/app/<MOD>.en.json` and `<MOD>.km.json`
    (`{ "<ID>": { "KEY": "..." } }`), both languages.
11. **Printing/documents** (InvoiceDocument etc.): render the document in a `POP.showPopup` body (viewing works everywhere).
    Show the Print button only when `!isNativeContainer()` (from `@/shared/bizcheckmobile`) and have it call `window.print()`;
    in the native shell `window.print()` is a no-op and the backend has no per-document PDF, so native printing is a known gap (flagged to the user).
12. **Done = `npx vue-tsc --noEmit` shows no errors in your files** (other batches run in parallel — ignore errors in files you did not touch).
    Comments 1–2 lines, purpose only.

## Shared pieces already ported (import them, don't copy)
- `core/components/module/ExportModal.vue` — `POP.showPopup(ExportModal, { title, props: { config: EXPORT_CONFIGS.X, params } })`.
- `views/POS/SAL/VariantPickerModal.vue` — resolves `{ data: SellableVariant }`.
- `views/POS/CUS/Customer{Credit,Sales,Returns,Statement}*.vue`, `CustomerStatementView.vue`.
- **Import (Excel upload) stays web-only** (would add exceljs to the app): drop Import buttons, keep everything else.

## Local test setup
Backend: local warehouse_v2 on :8092. App dev server: `http://localhost:3000` (already running; port 3000 is the only CORS-allowed one).
Login: company `demo-store`, user `demo`, password `demo2026@@`. Headless Chromium: Playwright is installed in the
session scratchpad (`node` scripts there, viewport 390x844). Only read/create flows in tests; never delete/cancel/void/post.
Never write to any database with SQL.
- **Opening a URL / file** (export, PDF, receipt): `BizCheckMobileSystem.callBrowser({ url })` from `@/shared/bizcheckmobile` — never raw `window.open` (does nothing in the native WebView).
