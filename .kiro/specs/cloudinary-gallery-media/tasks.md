# Implementation Plan: Cloudinary Gallery Media

## Overview

Implement the Cloudinary-backed gallery pipeline in the order: schema migration → pure library code (`src/lib/cloudinary.js`, updated `galleryAPI`) → persistence orchestration (`SiteDataContext`) → admin UI (`AdminGallery` + shared `Alert`) → public render (`GallerySection` + `HomePage`) → Supabase Edge Function (`cloudinary-destroy`) → setup docs and seed updates.

Each phase introduces logic and is followed by its property tests before the next phase begins, matching the design's Correctness Properties (P1–P16). Tests use Vitest + `fast-check` for the React/Node code and Deno's built-in test runner + `fast-check` for the Edge Function. Tests are part of the implementation; sub-tasks marked with `*` are optional only in the sense that they may be skipped for a fast MVP, but the plan assumes they are written.

The design uses JavaScript/TypeScript throughout (React 19 + Vite for the browser, Deno + TypeScript for the Edge Function); no language clarification step is needed.

## Tasks

- [x] 1. Set up testing tooling and project scaffolding
  - [x] 1.1 Add Vitest + fast-check + Testing Library dev dependencies and config
    - Add `vitest`, `@vitest/ui`, `jsdom`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` to `devDependencies`
    - Add `"test": "vitest --run"` and `"test:watch": "vitest"` scripts to `package.json`
    - Create `vitest.config.js` at the repo root (jsdom environment, setupFiles for jest-dom matchers)
    - Create `tests/setup.js` that imports `@testing-library/jest-dom` and resets module mocks between tests
    - _Requirements: supports all property/unit test tasks below_

  - [x] 1.2 Create `.env.example` Cloudinary entries and confirm `.env.local` is gitignored
    - Add `VITE_CLOUDINARY_CLOUD_NAME=`, `VITE_CLOUDINARY_API_KEY=`, `VITE_CLOUDINARY_UPLOAD_PRESET=` to `.env.example` with a comment that the upload preset must be configured as Unsigned and scoped to the `tedxdutse/gallery` folder
    - Verify `.env`, `.env.local` are listed in `.gitignore` (do not modify if already present)
    - _Requirements: 1.7, 10.1_

- [ ] 2. Schema migration for Cloudinary metadata
  - [-] 2.1 Write idempotent migration `supabase/migrations/00003_cloudinary_gallery.sql`
    - `ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS public_id TEXT, resource_type TEXT, format TEXT, width INTEGER, height INTEGER, bytes INTEGER, duration NUMERIC` (one statement per design)
    - Wrap the `resource_type` CHECK constraint in a `DO $$ ... $$` guard that consults `pg_constraint` so a re-run is a no-op
    - `CREATE UNIQUE INDEX IF NOT EXISTS gallery_images_public_id_unique ON gallery_images (public_id) WHERE public_id IS NOT NULL`
    - No `UPDATE`/`DELETE` statements — legacy rows must be untouched
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 2.2 Write property test for migration idempotence and legacy preservation (Property 14)
    - File: `tests/migration.test.js`
    - **Property 14: Migration is idempotent and preserves legacy rows**
    - Apply `00003_cloudinary_gallery.sql` 1..n times against a fresh Postgres (local Supabase or Docker `postgres:15`), assert the resulting `information_schema.columns`/`pg_constraint` snapshot is identical from the 1st application onward and that every seeded legacy row's `(id, src, alt, orientation, order_index)` is unchanged
    - Generator: `fc.array(fc.record({ src, alt, orientation, order_index }))`; tag `@cost:integration`, `numRuns: 25`
    - **Validates: Requirements 3.8, 3.9**

  - [ ]* 2.3 Write property test for `public_id` uniqueness with multi-NULL (Property 15)
    - File: `tests/migration.test.js`
    - **Property 15: gallery_images.public_id uniqueness with multi-NULL**
    - Generator: `fc.tuple(fc.option(fc.string()), fc.option(fc.string()))`; insert two rows and assert the unique-violation only fires for two equal non-null `public_id`s
    - **Validates: Requirements 3.6**

  - [ ]* 2.4 Write integration assertion of final DDL shape
    - One example-based test that applies all three migrations against a clean Postgres and asserts `information_schema.columns` for `gallery_images` matches the design's expected column list and types
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.7**

- [ ] 3. Cloudinary client library — config, validation, upload, URL builders
  - [x] 3.1 Create `src/lib/cloudinary.js` constants and `getConfig`
    - Export `ALLOWED_IMAGE_FORMATS`, `ALLOWED_VIDEO_FORMATS`, `IMAGE_SIZE_LIMIT`, `VIDEO_SIZE_LIMIT`, `THUMBNAIL_WIDTH`, `LIGHTBOX_WIDTH`, `RESPONSIVE_WIDTHS`, `CLOUDINARY_FOLDER`
    - Implement private `getConfig()` that reads `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME` and `import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET` and throws with the missing variable's name when either is empty
    - Module must contain no token matching `/api[_-]?secret/i` or `VITE_CLOUDINARY_API_SECRET`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [-] 3.2 Implement `validateGalleryFile(file)`
    - Reject when `file.type` does not start with `image/` or `video/` (include MIME in message)
    - Reject when lowercased final extension of `file.name` is not in the matching allow-list (include allow-list in message)
    - Reject when `file.size` exceeds the matching size limit (include limit in MB in message)
    - Return `{ resourceType, extension }` for valid files
    - _Requirements: 2.7, 2.8, 2.9, 2.10, 2.11_

  - [ ]* 3.3 Write property test for file validation (Property 1)
    - File: `src/lib/cloudinary.test.js`
    - **Property 1: File validation rejects all invalid files with informative messages**
    - Generator: `fc.record({ mime, ext, sizeBytes, isValid })` over the union of valid and invalid arms; assert `validateGalleryFile` throws iff invalid and the message names the specific violation
    - **Validates: Requirements 2.7, 2.8, 2.9, 2.10, 2.11**

  - [~] 3.4 Implement `uploadGalleryMedia(file, onProgress)` via XMLHttpRequest
    - Call `validateGalleryFile` first; reject with its error
    - POST multipart form with exactly `{ file, upload_preset, folder: 'tedxdutse/gallery' }` to `https://api.cloudinary.com/v1_1/{cloudName}/{resource_type}/upload`
    - On `xhr.upload.progress` with `lengthComputable`, call `onProgress(loaded/total)`
    - On 2xx, resolve with a `Media_Reference` `{ public_id, secure_url, resource_type, format, width, height, bytes, duration }` where `duration = response.duration ?? null`
    - On non-2xx, reject with an `Error` whose message includes the status and `body.error.message` when present
    - On `error`/`timeout`/`abort`, reject with a network-error message
    - _Requirements: 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.5 Write property test for upload endpoint and form (Property 2)
    - File: `src/lib/cloudinary.test.js`
    - **Property 2: Upload posts to the correct endpoint and form for any valid file**
    - Mock `XMLHttpRequest` to capture URL + FormData; for any valid file with any `(cloudName, uploadPreset)`, assert URL host/path matches and the FormData has exactly `file`, `upload_preset`, `folder=tedxdutse/gallery`
    - **Validates: Requirements 1.6, 2.1, 2.2, 2.3**

  - [ ]* 3.6 Write property test for response normalisation (Property 3)
    - File: `src/lib/cloudinary.test.js`
    - **Property 3: Upload normalises Cloudinary responses**
    - Generator: `fc.record({ status, body })` covering 2xx and non-2xx, with/without `duration`, with/without `error.message`; assert resolve/reject contract and `duration === null` exactly when absent
    - **Validates: Requirements 2.4, 2.5**

  - [ ]* 3.7 Write property test for progress fractions (Property 4)
    - File: `src/lib/cloudinary.test.js`
    - **Property 4: Progress fractions are exactly loaded/total and lie in [0,1]**
    - Generator: `fc.array(fc.tuple(loaded ≤ total, total > 0))`; drive the fake XHR's progress event and assert exact equality and bounds
    - **Validates: Requirements 2.6**

  - [x] 3.8 Implement URL builders `buildImageUrl`, `buildVideoUrl`, `buildVideoPosterUrl`, `buildSrcSet`
    - Image: `https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto,w_{width}/{public_id}.{format}`
    - Video: `https://res.cloudinary.com/{cloud}/video/upload/f_auto,q_auto/{public_id}.{format}`
    - Video poster: `https://res.cloudinary.com/{cloud}/video/upload/f_auto,q_auto,w_{width},so_0/{public_id}.jpg`
    - srcSet: comma-joined `buildImageUrl` outputs at widths from `RESPONSIVE_WIDTHS` with `<n>w` descriptors
    - Builders must use only `{f_auto, q_auto, w_<n>, so_0}` transforms — no implicit additions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_

  - [ ]* 3.9 Write property test for URL builder transform allow-list (Property 5)
    - File: `src/lib/cloudinary.test.js`
    - **Property 5: URL builders produce only the listed transformations**
    - Generator: `fc.record({ publicId: fc.string(), format: fc.constantFrom(...allowedFormats), width: fc.integer({min:1, max:4096}) })`; parse the produced URL and assert the transforms set is a subset of `{f_auto, q_auto, w_<positive integer>, so_0}` and matches the canonical template per builder
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.7, 6.8**

- [ ] 4. `galleryAPI` updates in `src/lib/supabase.js`
  - [-] 4.1 Project Cloudinary fields and throw on Supabase errors
    - Update `galleryAPI.getAll`, `galleryAPI.create`, `galleryAPI.update`, `galleryAPI.delete` to accept and return the new columns: `public_id`, `resource_type`, `format`, `width`, `height`, `bytes`, `duration`
    - Stop swallowing errors: when Supabase returns a non-null `error`, throw `new Error(\`gallery <op> failed: ${error.code} ${error.message}\`)`; the previous `console.error` + `return null` behaviour is removed for these four methods only
    - Do not change the other API helpers (speakers, schedule, etc.) in this feature
    - _Requirements: 4.6_

  - [ ]* 4.2 Write unit tests for `galleryAPI` error propagation
    - Mock the Supabase client to return `{ data: null, error: { code, message } }`; assert each method rejects with an `Error` whose message contains the code and message
    - Mock a successful insert and assert the returned row contains all Cloudinary fields
    - **Validates: Requirements 4.6**

- [ ] 5. Persistence orchestration in `SiteDataContext`
  - [~] 5.1 Replace `updateGalleryImages` with the insert/update/delete dispatcher
    - Take `(newImages, removedItems = [])`
    - Snapshot `galleryImages` for rollback
    - For each `item` in `newImages` with index `i`: when `typeof item.id === 'number' && item.id > 0`, call `galleryAPI.update(item.id, payload)` with `order_index: i`; when `item.id == null`, call `galleryAPI.create(payload)` and replace the in-memory id with the returned integer
    - Reject with a `TypeError` if any `item.id` is a non-empty string (regression guard against `'img-<timestamp>'`)
    - On any rejection: roll in-memory state back to the snapshot, do not write `localStorage`, and reject with the underlying Supabase error
    - On success: set state to the array with DB ids, write `localStorage`, resolve `{ images, cloudinaryWarnings: [] }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

  - [~] 5.2 Wire deletes — Supabase row delete and Edge Function call
    - Implement `callCloudinaryDestroy(public_id, resource_type)` that POSTs `{ public_id, resource_type }` to `${VITE_SUPABASE_URL}/functions/v1/cloudinary-destroy` with `Authorization: Bearer <session.access_token>` and rejects on non-2xx with `body.error || \`HTTP ${status}\``
    - Implement `isLegacySrc(item)` (`public_id == null` and `src` starts with `/images/` or `data:`)
    - Extend `updateGalleryImages` `removedItems` handling: for each removed item with a positive integer `id`, call `galleryAPI.delete(id)`; then for each removed item with `public_id` and `!isLegacySrc(item)`, call `callCloudinaryDestroy`
    - When the Edge Function call rejects, leave the row deletion committed and append `{ public_id, message }` to `cloudinaryWarnings`
    - Add a `deleteGalleryImage(item)` convenience wrapper that calls `updateGalleryImages(currentList without item, [item])`
    - Add an `addGalleryImage(item)` convenience wrapper that calls `updateGalleryImages([...currentList, { ...item, id: null }])`
    - _Requirements: 5.1, 5.2, 5.9, 5.10, 7.6_

  - [~] 5.3 Update `loadData` to fall back to localStorage on `getAll` rejection and render defaults during initial fetch
    - In the existing initial-load path, wrap `galleryAPI.getAll()` in try/catch; on catch, `console.error(error)` (mandatory) and read the cached value from `localStorage[STORAGE_KEYS.galleryImages]`, falling back to `defaultGalleryImages` if the key is missing or unparsable
    - Ensure the context exposes `defaultGalleryImages` as the initial state value so first paint is not blank before the fetch resolves
    - _Requirements: 8.3, 8.4_

  - [ ]* 5.4 Write property test for persistence dispatch (Property 8)
    - File: `src/context/SiteDataContext.test.jsx`
    - **Property 8: Persistence dispatch in updateGalleryImages**
    - Generator: `fc.array(fc.record({ id: fc.option(fc.integer({min:1}), {nil: null}), ... }))` with mocked `galleryAPI` returning auto-incrementing ids; assert each null-id item flows to `create`, each integer-id item flows to `update(id, ...)`, all `order_index` values match position, and the resolved snapshot has integer ids
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7**

  - [ ]* 5.5 Write property test for error propagation and src mirroring (Property 9)
    - File: `src/context/SiteDataContext.test.jsx`
    - **Property 9: Errors propagate from galleryAPI to the admin save flow, and src mirrors secure_url**
    - Generator: rejection at random index `k`; assert the returned promise rejects with an `Error` containing the Supabase message (and code), in-memory state equals the pre-call snapshot, and (in the success arm) every persisted row has `src === Media_Reference.secure_url`
    - **Validates: Requirements 3.5, 4.5, 4.6**

  - [ ]* 5.6 Write property test for delete dispatch and Legacy_Src exclusion (Property 10)
    - File: `src/context/SiteDataContext.test.jsx`
    - **Property 10: Delete dispatch and Legacy_Src exclusion**
    - Generator: mixed Cloudinary, Legacy `/images/`, and `data:` items with optional integer ids; assert `galleryAPI.delete` is called once iff `id` is a positive integer, and `callCloudinaryDestroy` is called once iff `public_id != null && !isLegacySrc(item)`
    - **Validates: Requirements 5.1, 5.2, 5.10**

  - [ ]* 5.7 Write property test for `getAll` rejection fallback (Property 16)
    - File: `src/context/SiteDataContext.test.jsx`
    - **Property 16: getAll rejection routes to localStorage fallback with logging**
    - Generator: `fc.option(fc.array(fc.record(...)))` for the cached value, random reject errors; assert `console.error` is called with the error and the resulting state equals the parsed cached value or `defaultGalleryImages` when the key is absent/malformed
    - **Validates: Requirements 8.3**

- [~] 6. Checkpoint — library + context tests pass
  - Run `npm run test -- --run` and confirm Properties 1–5, 8–10, 16 are green; ask the user if any property's generator or counterexample needs review.

- [ ] 7. Shared `Alert` component and Admin UI overhaul
  - [-] 7.1 Create `src/components/shared/Alert.jsx`
    - Accept `variant` ∈ `{error, warning, info, success}`, `onDismiss`, and children/message
    - Root element has `role="alert"` and `aria-live="assertive"` for `error`, `aria-live="polite"` otherwise
    - Render a dismiss button when `onDismiss` is provided
    - Export from `src/components/shared/index.js`
    - _Requirements: 7.7_

  - [~] 7.2 Refactor `src/pages/admin/AdminGallery.jsx` state machine
    - Replace ad-hoc booleans with an explicit `state` ∈ `{idle, uploading, saving, error}` and a separate `btnState` ∈ `{idle, loading, success}`
    - New items carry `id: null` (remove every `'img-' + Date.now()` assignment); list keys use `key={img.id ?? img.public_id ?? \`pending-${index}\`}`
    - Maintain a `removedItems` array of items the admin removed that already had an integer `id`; pass it to `updateGalleryImages` on save
    - On file select: call `validateGalleryFile`; on success start `uploading` and call `uploadGalleryMedia` with an `onProgress` setter; on resolve append the item with id `null` and the returned Media_Reference fields; on reject render an error `Alert` and do not append
    - On save click: set `btnState='loading'`, await `updateGalleryImages`, on resolve set `btnState='success'` and surface any `cloudinaryWarnings` via warning `Alert`s containing the `public_id`; on reject set `btnState='idle'` and render an error `Alert`
    - On delete click: route through `deleteGalleryImage`; on Supabase rejection keep the item in the list and render an error `Alert`
    - Render `<progress value={p} max={1} />` plus `${Math.round(p*100)}%` while `state === 'uploading'`
    - Remove every `window.alert(...)` and bare `alert(...)` from this file
    - _Requirements: 4.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 7.3 Write property/component tests for the AdminGallery state machine (Property 13)
    - File: `src/pages/admin/AdminGallery.test.jsx`
    - **Property 13: AdminGallery state machine — failures alert and do not advance to success**
    - Generators: random failure messages and timing across `{Upload_Service rejection, save promise rejection, delete promise rejection, cloudinary-destroy warning}`; using Testing Library, assert (a) an `Alert` with the message renders, (b) `btnState` after a save rejection is `idle`, (c) after an upload rejection no item is appended, (d) after a Supabase delete rejection the item remains, (e) cloudinary-destroy warning text contains the `public_id`, (f) while a save promise is pending `btnState` remains `loading`, (g) `window.alert` is never called
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

  - [ ]* 7.4 Write source-text scan test for forbidden tokens
    - File: `tests/forbidden-tokens.test.js`
    - Read `src/lib/cloudinary.js` and assert it contains none of `api_secret`, `cloudinary_secret`, `VITE_CLOUDINARY_API_SECRET` (case-insensitive)
    - Read `src/pages/admin/AdminGallery.jsx` and assert it contains neither `window.alert(` nor a bare `alert(` call
    - **Validates: Requirements 1.5, 7.7**

- [ ] 8. Public render — `GallerySection`, `HomePage`, `GalleryPage`
  - [~] 8.1 Update `src/components/sections/GallerySection.jsx`
    - Implement `renderTile(item)`: when `public_id == null` use the Legacy_Src branch (`<img src={item.src}>` or `<video>` for `resource_type === 'video'`); when Cloudinary image, use `buildImageUrl` for `src`, `buildSrcSet` for `srcSet`, and `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`; when Cloudinary video, render a poster `<img src={buildVideoPosterUrl}>` with a play-icon overlay
    - Implement `renderLightbox(item)`: Cloudinary video → `<video src={buildVideoUrl(...)} controls playsinline preload="metadata" autoPlay>`; Cloudinary image → `<img src={buildImageUrl(..., LIGHTBOX_WIDTH)}>`; Legacy → `<img src={item.src}>`
    - Implement `onError` fallback: when failed `src` is a Cloudinary URL and `item.src` differs, swap to `item.src`; otherwise replace with a styled `<div>` placeholder labelled with `item.alt`
    - Implement video `error` handler that swaps the `<video>` for the `buildVideoPosterUrl` `<img>`
    - Construct only the transforms listed in the design — no extras
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 6.8, 8.1, 8.2, 8.5_

  - [~] 8.2 Update `src/pages/HomePage.jsx` preview grid
    - Replace the existing preview-image rendering with a call to the same `renderTile` rules used by `GallerySection` for `galleryImages.slice(0, 4)`
    - Ensure the preview keeps the existing "View More" link and section structure
    - _Requirements: 6.5, 6.6_

  - [~] 8.3 Update `src/pages/GalleryPage.jsx` and any other Public_Gallery surfaces
    - Replace any direct `item.src` `<img>` rendering with the same `renderTile` logic so all Public_Gallery surfaces share one render path
    - _Requirements: 6.6, 9.1_

  - [ ]* 8.4 Write property test for public render dispatch (Property 6)
    - File: `src/components/sections/GallerySection.test.jsx`
    - **Property 6: Public render dispatch (Cloudinary vs Legacy_Src, image vs video)**
    - Generators producing Cloudinary image items, Cloudinary video items, Legacy `/images/` items, and `data:` items; using Testing Library, assert the rendered tag and `src`/`srcSet`/poster URL match the design's per-branch rules in both `GallerySection` and the `HomePage` preview
    - **Validates: Requirements 6.5, 6.6, 9.1**

  - [ ]* 8.5 Write property test for onError fallback chain (Property 7)
    - File: `src/components/sections/GallerySection.test.jsx`
    - **Property 7: onError fallback chain for Cloudinary-rendered elements**
    - Simulate the DOM `error` event with random `failed_src` vs `item.src` combinations; assert (a) `<img>` falls back to `item.src` when different, otherwise to the placeholder `<div>` with `item.alt` as visible label, and (b) `<video>` `error` swaps to a `buildVideoPosterUrl` `<img>`
    - **Validates: Requirements 8.1, 8.2, 8.5**

  - [ ]* 8.6 Write component test for first-paint defaults
    - Mount `SiteDataProvider` with a never-resolving `galleryAPI.getAll`; assert the rendered tile list equals `defaultGalleryImages` from `src/data/siteData.js`
    - **Validates: Requirements 8.4**

- [~] 9. Checkpoint — public render and admin UI tests pass
  - Run `npm run test -- --run` and confirm Properties 6–7 and 13 are green plus the 8.6 example test; ask the user if any visual/regression concern arises.

- [ ] 10. Supabase Edge Function `cloudinary-destroy`
  - [ ] 10.1 Create `supabase/functions/cloudinary-destroy/index.ts`
    - `Deno.serve` handler; reject non-`POST` methods with 405
    - Auth: require `Authorization: Bearer <token>`; create a Supabase client bound to the request's `Authorization` header and call `supabase.auth.getUser()`; on missing/invalid token return HTTP 401 `{error:'unauthorized'}`
    - Parse JSON body; require `public_id: string` (non-empty) and `resource_type ∈ {'image','video'}`; otherwise HTTP 400 `{error}`
    - Read `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` from `Deno.env`; never read these from request input
    - Compute `timestamp = Math.floor(Date.now()/1000).toString()` and `signature = sha1Hex(\`public_id=${public_id}&timestamp=${timestamp}${api_secret}\`)` using `crypto.subtle.digest('SHA-1', ...)` and lowercase hex
    - POST `FormData{public_id, api_key, timestamp, signature}` to `https://api.cloudinary.com/v1_1/{cloudName}/{resource_type}/destroy`
    - When response is OK and `body.result ∈ {"ok","not found"}`, return HTTP 200 `{result}`; otherwise return HTTP 502 `{error: body.error?.message || 'cloudinary destroy failed'}`
    - Never include `api_secret` or any signing material in any response body, log line, or error message
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 10.2 Write property test for Edge Function authorization, signature, and dispatch (Property 11)
    - File: `supabase/functions/cloudinary-destroy/index.test.ts` (Deno test runner + fast-check Deno build)
    - **Property 11: Edge Function authorization, signature, and dispatch**
    - Generators for `public_id`, `resource_type ∈ {'image','video'}`, `api_key`, `api_secret`, and Authorization header shapes; mock `fetch` to capture the outbound URL and form fields, mock the Supabase client to return authorized/unauthorized; assert (a) missing/malformed/invalid token → 401 and no Cloudinary call, (b) authorized requests POST to the correct URL with the four form fields and a signature equal to a reference SHA-1 of `public_id=...&timestamp=...{api_secret}`, (c) Cloudinary `result ∈ {"ok","not found"}` → 200 `{result}`, otherwise 502 `{error}`
    - **Validates: Requirements 5.5, 5.6, 5.7, 5.8**

  - [ ]* 10.3 Write property test that the secret is never echoed (Property 12)
    - File: `supabase/functions/cloudinary-destroy/index.test.ts`
    - **Property 12: Edge Function never echoes CLOUDINARY_API_SECRET**
    - Across all request shapes (authorized, unauthorized, malformed, arbitrary Cloudinary failure bodies) and any `CLOUDINARY_API_SECRET`, assert the response body bytes do not contain the secret as a substring
    - **Validates: Requirements 5.4**

- [ ] 11. Wire delete propagation end-to-end
  - [~] 11.1 Connect AdminGallery delete confirmations to context + Edge Function
    - Replace any current direct `localStorage` mutation in the delete handler with a call to `deleteGalleryImage(item)` from `SiteDataContext`
    - On a returned `cloudinaryWarnings` entry, render a warning `Alert` with text including the `public_id` and a manual-cleanup hint
    - On Supabase delete rejection, render an error `Alert` and keep the item in the list
    - _Requirements: 5.9, 7.5, 7.6_

- [ ] 12. Seed script and legacy compatibility
  - [~] 12.1 Update `seed-supabase.js`
    - Insert each legacy `/images/gallery/TEDxD-*.jpg` row with explicit `public_id: null, resource_type: 'image'` so the seeded shape is self-documenting
    - Do not change the `src`, `alt`, `orientation`, or `order_index` values
    - _Requirements: 9.1, 9.2_

  - [ ]* 12.2 Write a unit test for the seed script payload
    - Mock the Supabase client and run `seed-supabase.js` (or its exported function); assert each gallery insert payload contains `public_id: null` and `resource_type: 'image'` and unchanged legacy fields
    - **Validates: Requirements 9.2**

- [ ] 13. Documentation
  - [~] 13.1 Create `CLOUDINARY_SETUP.md`
    - Document creating the Cloudinary account, the Unsigned upload preset, and the required preset settings: folder `tedxdutse/gallery`, allowed formats = `Allowed_Image_Formats ∪ Allowed_Video_Formats`, max image size 10 MB, max video size 100 MB, plus Restricted Media Types and Moderation where available
    - Document the env vars `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, `VITE_CLOUDINARY_UPLOAD_PRESET` (browser) and `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (Edge Function secrets)
    - State explicitly that `Cloudinary_API_Secret` is configured only as a Supabase Edge Function secret and MUST NOT be added to any `VITE_*` variable
    - Document the manual procedure for re-uploading legacy `/images/gallery/*.jpg` files via the Admin UI, with no ad-hoc SQL
    - Document upload-preset rotation: how to rename/recreate the preset and update `VITE_CLOUDINARY_UPLOAD_PRESET` afterwards
    - _Requirements: 9.3, 10.1, 10.2, 10.4, 10.5_

  - [~] 13.2 Update `SUPABASE_SETUP.md`
    - Add a section that links to `CLOUDINARY_SETUP.md` and describes deploying the `cloudinary-destroy` Edge Function with `supabase functions deploy cloudinary-destroy` and setting its three secrets via `supabase secrets set`
    - Add a section reaffirming that legacy `/images/gallery/...` static assets keep being served from `public/images/gallery/` and are not redirected
    - _Requirements: 9.3, 9.4, 10.4_

  - [ ]* 13.3 Write documentation-content tests
    - Files: `tests/docs.test.js`
    - Assert `CLOUDINARY_SETUP.md` contains the required headings and the literal strings for each Req 10.1–10.5 instruction (preset folder name, formats list, size limits, secret-placement statement, rotation instructions)
    - Assert `SUPABASE_SETUP.md` contains the legacy static-asset paragraph
    - **Validates: Requirements 9.3, 9.4, 10.1, 10.2, 10.4, 10.5**

- [~] 14. Final checkpoint — full test suite green
  - Run `npm run test -- --run` and the Edge Function's `deno test` suite; confirm every property test (P1–P16) and example test passes; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP, but each phase introduces logic with its property tests as sub-tasks; per the user's brief the tests are part of the implementation and should land alongside the code.
- Each task references specific requirements (e.g. `4.3`) for traceability. Property test sub-tasks additionally reference the design's Correctness Properties (P1–P16) and the requirements they validate.
- Checkpoints (tasks 6, 9, 14) ensure incremental validation between phases.
- Testing tools: Vitest + `fast-check` + `@testing-library/react` for the browser code; Deno's built-in test runner + `fast-check` for the Edge Function. All property tests use a single `fc.assert` per property at `numRuns: 100` (or `numRuns: 25` with the `@cost:integration` tag for migration tests).
- The design uses JavaScript/TypeScript throughout; no language clarification was needed for this tasks plan.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "3.1", "3.2", "3.8"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "3.3", "3.9", "4.1", "7.1", "10.1"] },
    { "id": 2, "tasks": ["3.4", "4.2", "5.3", "10.2", "10.3"] },
    { "id": 3, "tasks": ["3.5", "3.6", "3.7", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.4", "5.5", "5.7"] },
    { "id": 5, "tasks": ["5.6", "7.2", "8.1", "12.1"] },
    { "id": 6, "tasks": ["7.3", "7.4", "8.2", "8.3", "12.2", "13.1", "13.2"] },
    { "id": 7, "tasks": ["8.4", "8.5", "8.6", "11.1", "13.3"] }
  ]
}
```
