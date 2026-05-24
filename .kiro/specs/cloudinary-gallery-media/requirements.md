# Requirements Document

## Introduction

The TEDxDutse admin gallery currently stores uploaded images as base64 data URLs in `localStorage` (capped at 2 MB) and writes them into the Supabase `gallery_images.src` column. Two problems result: large images and videos cannot be hosted at all, and new gallery items get client-assigned string IDs of the form `'img-' + Date.now()` that never match the integer `SERIAL` primary key in Supabase, so the existing save flow silently no-ops on the UPDATE branch and changes only persist to `localStorage`. Errors from Supabase are also swallowed by `console.error`, so admins see a green "Saved" confirmation even when nothing was written.

This feature replaces the gallery media path end-to-end. The browser uploads gallery images and videos directly to Cloudinary using an unsigned upload preset, Supabase stores only the Cloudinary metadata (public_id, secure_url, resource_type, format, width, height, duration, bytes, etc.), and the public site (HomePage preview, GallerySection, GalleryPage) renders the gallery from Supabase using Cloudinary delivery URLs with transformation parameters for thumbnails and responsive sizes. Videos are rendered with an HTML5 `<video>` element fed by the Cloudinary `secure_url`. Deletions propagate to both Supabase and Cloudinary, save errors surface in the admin UI, and the existing seeded `/images/gallery/TEDxD-*.jpg` files continue to work as legacy fallbacks until they are replaced.

## Glossary

- **Cloudinary**: Third-party media hosting and transformation CDN where TEDxDutse gallery assets are uploaded.
- **Cloud_Name**: Cloudinary account identifier, exposed to the browser via the env var `VITE_CLOUDINARY_CLOUD_NAME`.
- **Upload_Preset**: A named, unsigned Cloudinary preset that authorizes browser-originated uploads. Exposed via the env var `VITE_CLOUDINARY_UPLOAD_PRESET`. "Unsigned" means clients can call the upload endpoint without an API secret.
- **Cloudinary_API_Key**: Public-facing Cloudinary key in `VITE_CLOUDINARY_API_KEY`. Safe for the browser; used only to address a specific cloud account.
- **Cloudinary_API_Secret**: Cloudinary's signing secret. MUST never appear in any browser-bundled file.
- **Cloudinary_Asset**: The JSON object returned by `POST https://api.cloudinary.com/v1_1/{Cloud_Name}/{resource_type}/upload`. Contains at least `public_id`, `secure_url`, `resource_type` (`"image"` or `"video"`), `format`, `width`, `height`, `bytes`, and (for videos) `duration`.
- **Media_Reference**: The subset of Cloudinary_Asset persisted to Supabase: `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `bytes`, `duration` (nullable).
- **Upload_Service**: The browser module at `src/lib/cloudinary.js` that posts a `File` to Cloudinary, reports progress, and returns a Media_Reference.
- **Delete_Service**: The server-side function (Supabase Edge Function) that signs a Cloudinary `destroy` request and removes an asset from Cloudinary.
- **Admin_Gallery**: The admin page at `src/pages/admin/AdminGallery.jsx`.
- **Public_Gallery**: The set of public-site components that render gallery content: `src/pages/HomePage.jsx` (preview grid), `src/components/sections/GallerySection.jsx`, and `src/pages/GalleryPage.jsx`.
- **Site_Data_Context**: The React context at `src/context/SiteDataContext.jsx` that loads, caches, and persists site content via Supabase and `localStorage`.
- **Gallery_Item**: A single row in the Supabase `gallery_images` table. Under this feature it represents either an image or a video.
- **Gallery_API**: The `galleryAPI` helper object exported from `src/lib/supabase.js`.
- **Image_Size_Limit**: 10 megabytes (10 × 1024 × 1024 bytes).
- **Video_Size_Limit**: 100 megabytes (100 × 1024 × 1024 bytes).
- **Allowed_Image_Formats**: `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`.
- **Allowed_Video_Formats**: `mp4`, `webm`, `mov`.
- **Legacy_Src**: A `gallery_images.src` value that is either a static path beginning with `/images/` or a `data:` URL, written before this feature.
- **Thumbnail_Width**: 600 pixels, the Cloudinary-delivered width used for masonry tiles and HomePage preview.
- **Lightbox_Width**: 1600 pixels, the Cloudinary-delivered width used inside the lightbox modal.

## Requirements

### Requirement 1: Cloudinary configuration and credentials

**User Story:** As a deployer, I want Cloudinary configuration to live in environment variables that the browser can read, so that the admin can upload gallery media without shipping any signing secret to the client.

#### Acceptance Criteria

1. THE Upload_Service SHALL read Cloud_Name from `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME`.
2. THE Upload_Service SHALL read Upload_Preset from `import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET`.
3. WHEN `VITE_CLOUDINARY_CLOUD_NAME` is missing or empty at runtime, THE Upload_Service SHALL throw an error whose message names `VITE_CLOUDINARY_CLOUD_NAME`.
4. WHEN `VITE_CLOUDINARY_UPLOAD_PRESET` is missing or empty at runtime, THE Upload_Service SHALL throw an error whose message names `VITE_CLOUDINARY_UPLOAD_PRESET`.
5. THE Upload_Service SHALL NOT read, reference, or accept any value named `api_secret`, `cloudinary_secret`, `VITE_CLOUDINARY_API_SECRET`, or any equivalent Cloudinary signing secret.
6. THE Upload_Service SHALL post uploads only to `https://api.cloudinary.com/v1_1/{Cloud_Name}/{resource_type}/upload` where `{resource_type}` is `image` or `video`.
7. THE project's `.env.example` file SHALL document `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, and `VITE_CLOUDINARY_UPLOAD_PRESET` with empty placeholder values and a comment stating the upload preset must be configured as Unsigned.

### Requirement 2: Direct browser upload to Cloudinary for gallery media

**User Story:** As an admin, I want the browser to upload gallery images and videos directly to Cloudinary, so that uploads bypass Supabase row size limits and the site can host large images and videos without a custom backend.

#### Acceptance Criteria

1. WHEN an admin selects a file in Admin_Gallery, THE Upload_Service SHALL post the file to Cloudinary with multipart form fields `file`, `upload_preset` set to Upload_Preset, and `folder` set to `tedxdutse/gallery`.
2. WHEN the selected file's MIME type starts with `image/`, THE Upload_Service SHALL post to the `image` Cloudinary endpoint and set the resulting Media_Reference `resource_type` to `"image"`.
3. WHEN the selected file's MIME type starts with `video/`, THE Upload_Service SHALL post to the `video` Cloudinary endpoint and set the resulting Media_Reference `resource_type` to `"video"`.
4. WHEN the Cloudinary response is received with a 2xx status, THE Upload_Service SHALL return a Media_Reference containing `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `bytes`, and `duration` (set to `null` when Cloudinary returned no `duration` field).
5. IF the Cloudinary response status code is not in the 2xx range, THEN THE Upload_Service SHALL reject with an error whose message includes the HTTP status code and the Cloudinary `error.message` field when present.
6. WHILE an upload is in progress, THE Upload_Service SHALL emit progress updates as a fraction between 0 and 1 inclusive, computed from the XHR `progress` event's `loaded / total`.
7. IF the file's MIME type does not start with `image/` or `video/`, THEN THE Upload_Service SHALL reject the file with an error whose message names the offending MIME type.
8. IF an image file's last extension segment (lowercased) is not in Allowed_Image_Formats, THEN THE Upload_Service SHALL reject the file before posting and include Allowed_Image_Formats in the error message.
9. IF a video file's last extension segment (lowercased) is not in Allowed_Video_Formats, THEN THE Upload_Service SHALL reject the file before posting and include Allowed_Video_Formats in the error message.
10. IF an image file's `size` exceeds Image_Size_Limit, THEN THE Upload_Service SHALL reject the file before posting and include Image_Size_Limit (in MB) in the error message.
11. IF a video file's `size` exceeds Video_Size_Limit, THEN THE Upload_Service SHALL reject the file before posting and include Video_Size_Limit (in MB) in the error message.

### Requirement 3: Schema migration for Cloudinary metadata and video support

**User Story:** As a developer, I want the `gallery_images` table to store Cloudinary metadata and to distinguish images from videos, so that the public site can render either media type with the correct transformations.

#### Acceptance Criteria

1. THE `gallery_images` table SHALL have a column `public_id TEXT` that stores the Cloudinary asset's `public_id`.
2. THE `gallery_images` table SHALL have a column `resource_type TEXT` constrained to the values `'image'` and `'video'`.
3. THE `gallery_images` table SHALL have columns `format TEXT`, `width INTEGER`, `height INTEGER`, `bytes INTEGER`, and `duration NUMERIC` where `duration` is nullable, and where `width`, `height`, and `bytes` SHALL accept any integer value Cloudinary returns (including zero) without an additional CHECK constraint.
4. THE `gallery_images` table SHALL retain its existing columns `id SERIAL PRIMARY KEY`, `src TEXT NOT NULL`, `alt TEXT`, `orientation TEXT`, `order_index INTEGER`, `created_at`, and `updated_at`.
5. WHEN a Gallery_Item row is created from a Cloudinary upload, THE `src` column SHALL be populated with the Cloudinary `secure_url` so that legacy reads (which only project `src`) continue to render the asset.
6. THE `gallery_images.public_id` column SHALL have a UNIQUE constraint that allows multiple `NULL` values (for legacy rows) but rejects two non-null rows with the same `public_id`.
7. THE migration SHALL be delivered as a new SQL file under `supabase/migrations/` whose filename sorts after `00001_initial_schema.sql`.
8. THE migration SHALL be idempotent: running it twice against the same database SHALL leave the schema in the same final state without raising an error.
9. THE migration SHALL leave the existing rows in `gallery_images` readable, with their `src`, `alt`, `orientation`, and `order_index` values unchanged.

### Requirement 4: Persisting Cloudinary uploads to Supabase (insert vs update bug fix)

**User Story:** As an admin, I want new uploads to be inserted into Supabase as new rows and existing items to be updated by their integer ID, so that gallery changes actually persist to the database instead of silently writing only to localStorage.

#### Acceptance Criteria

1. WHEN Admin_Gallery saves a Gallery_Item that has no integer `id` (newly uploaded in the current session), THE Site_Data_Context SHALL call `Gallery_API.create` to INSERT a new row and SHALL replace the in-memory item's `id` with the integer `id` returned by Supabase.
2. WHEN Admin_Gallery saves a Gallery_Item whose `id` is a positive integer that already exists in Supabase, THE Site_Data_Context SHALL call `Gallery_API.update` with that integer `id`.
3. THE Admin_Gallery SHALL NOT assign client-generated string identifiers (such as `'img-<timestamp>'`) to the `id` field of any Gallery_Item passed to Site_Data_Context for persistence. Newly added items SHALL carry an `id` of `null` or `undefined` until Supabase assigns one.
4. WHERE the admin reorders items, THE Site_Data_Context SHALL set each row's `order_index` to its zero-based position in the saved array.
5. IF `Gallery_API.create` or `Gallery_API.update` returns a Supabase error, THEN THE Site_Data_Context SHALL propagate that error to Admin_Gallery as a thrown exception (the function returned to the admin button handler SHALL reject) instead of swallowing it.
6. THE `Gallery_API.create` and `Gallery_API.update` helpers in `src/lib/supabase.js` SHALL throw (or return a rejected result with `error` populated) when Supabase returns a non-null `error`, so that callers can detect failures.
7. WHEN every item in a save batch has been persisted successfully, THE Site_Data_Context SHALL update the in-memory `galleryImages` array to the values returned by Supabase (including DB-assigned `id`s) before resolving.

### Requirement 5: Deleting gallery items from Supabase and Cloudinary

**User Story:** As an admin, I want deleting a gallery item to remove it from both Supabase and Cloudinary, so that orphaned media does not accumulate in the Cloudinary account.

#### Acceptance Criteria

1. WHEN an admin confirms deletion of a Gallery_Item that has a non-null integer `id`, THE Site_Data_Context SHALL call `Gallery_API.delete(id)` to remove the row from Supabase before resolving the delete operation.
2. WHEN an admin confirms deletion of a Gallery_Item that has a non-null `public_id`, THE Site_Data_Context SHALL invoke Delete_Service with `{ public_id, resource_type }` to destroy the asset on Cloudinary.
3. THE Delete_Service SHALL be implemented as a Supabase Edge Function (path: `supabase/functions/cloudinary-destroy/index.ts`) that signs the Cloudinary `destroy` request server-side using `CLOUDINARY_API_SECRET` from the function's environment.
4. THE Delete_Service SHALL NOT expose, return, or echo `CLOUDINARY_API_SECRET` in any response body, log, or error message.
5. THE Delete_Service SHALL accept only requests authenticated with a valid Supabase JWT whose role claim equals `authenticated` (i.e., a logged-in admin); unauthenticated requests SHALL receive HTTP 401.
6. WHEN Delete_Service receives a request body containing `public_id` and `resource_type`, THE Delete_Service SHALL POST to `https://api.cloudinary.com/v1_1/{Cloud_Name}/{resource_type}/destroy` with form fields `public_id`, `api_key`, `timestamp`, and `signature` computed as `SHA1("public_id={public_id}&timestamp={timestamp}{api_secret}")`.
7. IF the Cloudinary destroy response's JSON `result` field is `"ok"` or `"not found"`, THEN THE Delete_Service SHALL return HTTP 200 with `{ result }` to the caller.
8. IF the Cloudinary destroy response indicates failure, THEN THE Delete_Service SHALL return HTTP 502 with a JSON body `{ error: <message> }`, and THE Site_Data_Context SHALL surface that error to Admin_Gallery.
9. IF the Site_Data_Context's call to Delete_Service rejects, THEN THE Supabase row SHALL still be deleted (so the public site stops showing the item) and Admin_Gallery SHALL display a non-blocking warning that the Cloudinary asset may need manual cleanup, including the `public_id`.
10. THE Site_Data_Context SHALL NOT call Delete_Service for Gallery_Items whose `public_id` is null or whose `src` matches the Legacy_Src pattern (i.e., legacy rows are deleted from Supabase only).

### Requirement 6: Public site rendering of Cloudinary URLs and videos

**User Story:** As a site visitor, I want gallery images and videos to load from Cloudinary at appropriately sized resolutions, so that the gallery loads quickly on mobile and supports video playback.

#### Acceptance Criteria

1. WHEN GallerySection renders a Gallery_Item whose `resource_type` equals `"image"` and whose `public_id` is non-null, THE GallerySection SHALL build the tile `src` using the Cloudinary delivery URL `https://res.cloudinary.com/{Cloud_Name}/image/upload/f_auto,q_auto,w_{Thumbnail_Width}/{public_id}.{format}`.
2. WHEN GallerySection opens its lightbox on a Gallery_Item with `resource_type` of `"image"`, THE GallerySection SHALL render the lightbox image using the Cloudinary URL `https://res.cloudinary.com/{Cloud_Name}/image/upload/f_auto,q_auto,w_{Lightbox_Width}/{public_id}.{format}`.
3. WHEN GallerySection renders a Gallery_Item whose `resource_type` equals `"video"`, THE GallerySection SHALL render an HTML5 `<video>` element whose `src` is the Cloudinary URL `https://res.cloudinary.com/{Cloud_Name}/video/upload/f_auto,q_auto/{public_id}.{format}`, with attributes `controls`, `playsinline`, and `preload="metadata"`.
4. WHEN GallerySection renders a video tile (outside the lightbox), THE GallerySection SHALL render a Cloudinary-generated poster image at Thumbnail_Width using the URL `https://res.cloudinary.com/{Cloud_Name}/video/upload/f_auto,q_auto,w_{Thumbnail_Width},so_0/{public_id}.jpg` and SHALL overlay a play-icon affordance.
5. WHEN HomePage renders the gallery preview (`previewImages = galleryImages.slice(0, 4)`), THE HomePage SHALL apply the same Thumbnail_Width Cloudinary URL rule for image items and the same poster-image rule for video items.
6. WHERE a Gallery_Item is a Legacy_Src (i.e., `public_id` is null and `src` starts with `/images/` or `data:`), THE Public_Gallery SHALL render the existing `src` directly as `<img>` (or `<video>` if `resource_type` equals `"video"`) without applying Cloudinary URL templates.
7. THE Cloudinary delivery URLs constructed for the Public_Gallery SHALL include only the transformation parameters listed in this requirement, so that builds remain reproducible and no implicit Cloudinary derivations are introduced.
8. WHEN rendering an image `<img>` tile, THE GallerySection SHALL set a `srcSet` containing the same `f_auto,q_auto,w_{n}` template with `n` ∈ {400, 800, 1200} and a corresponding `sizes` attribute, so that mobile devices download a smaller variant.

### Requirement 7: Admin UI feedback for upload, save, and delete failures

**User Story:** As an admin, I want clear in-UI feedback when an upload, save, or delete fails, so that I do not believe a change was applied when it was actually rejected by Cloudinary or Supabase.

#### Acceptance Criteria

1. WHILE an upload is in progress in Admin_Gallery, THE Admin_Gallery SHALL display a progress indicator showing the percentage from Requirement 2's progress fraction.
2. IF the Upload_Service rejects, THEN THE Admin_Gallery SHALL display the rejection's error message in a visible, dismissible alert and SHALL NOT add the item to the in-memory list.
3. IF the Save action's promise rejects (per Requirement 4 acceptance criterion 5), THEN THE Admin_Gallery SHALL display the error message in a visible alert and SHALL set the save button state back to `idle` (not `success`).
4. WHILE the save promise is pending, THE Admin_Gallery save button SHALL remain in its `loading` state and SHALL NOT transition to the `success` state; THE Admin_Gallery SHALL transition to the `success` state only after the save promise resolves with all rows successfully persisted to Supabase.
5. IF the Delete action's promise rejects on the Supabase step, THEN THE Admin_Gallery SHALL keep the item in the list and display the error message.
6. WHERE the Cloudinary destroy step warns (per Requirement 5 acceptance criterion 9), THE Admin_Gallery SHALL display the warning including the `public_id` so that the admin can clean it up manually.
7. THE Admin_Gallery SHALL NOT use `window.alert` for upload, save, or delete error reporting; THE Admin_Gallery SHALL use an in-page alert region with `role="alert"`.

### Requirement 8: Fallback when Cloudinary is unreachable

**User Story:** As a site visitor, I want the gallery to keep rendering something usable when Cloudinary is briefly unreachable, so that the page does not show a broken layout.

#### Acceptance Criteria

1. WHEN a Public_Gallery image fails to load (`onError` fires) and the failed `src` was a Cloudinary URL, THE Public_Gallery SHALL fall back to the row's stored `src` value if it differs from the failed URL.
2. WHEN a Public_Gallery image fails to load and no alternative `src` is available, THE Public_Gallery SHALL render a placeholder element (a styled `<div>` with the row's `alt` text as visible label) so that the masonry layout does not collapse.
3. IF the `galleryAPI.getAll` call rejects on initial load, THEN THE Site_Data_Context SHALL fall back to the `localStorage` cache as it does today, AND THE Site_Data_Context SHALL log the error to the console; both actions are mandatory.
4. WHILE the Site_Data_Context has not yet completed its initial gallery fetch, THE Public_Gallery SHALL render the seeded `defaultGalleryImages` from `src/data/siteData.js` so that first paint is not blank.
5. WHEN a Cloudinary video element fails to load (`error` event fires), THE Public_Gallery SHALL replace the `<video>` with the Cloudinary poster image (per Requirement 6 acceptance criterion 4) so that the tile still occupies the layout.

### Requirement 9: Migration of existing seeded gallery items

**User Story:** As a developer, I want the existing seeded `/images/gallery/TEDxD-*.jpg` rows to keep working after this feature ships, so that nothing visible breaks before the admin re-uploads them.

#### Acceptance Criteria

1. THE Site_Data_Context's gallery loader SHALL accept rows whose `public_id` is null and whose `src` starts with `/images/` and SHALL render them via the Legacy_Src branch defined in Requirement 6 acceptance criterion 6.
2. THE seed script `seed-supabase.js` SHALL continue to insert the legacy rows with their existing `src` values; it SHALL set `public_id` to NULL and `resource_type` to `'image'` for those rows.
3. THE repository SHALL provide a documented manual procedure (in `SUPABASE_SETUP.md` or a new `CLOUDINARY_SETUP.md`) for re-uploading the legacy `/images/gallery/*.jpg` files to Cloudinary via the admin UI; the procedure SHALL NOT require running ad-hoc SQL.
4. THE repository SHALL retain the files in `public/images/gallery/` on disk and SHALL serve them at their existing `/images/gallery/...` URLs, so that Legacy_Src URLs continue to resolve via static asset hosting (not via redirects).

### Requirement 10: Securing the unsigned upload preset

**User Story:** As a site owner, I want the unsigned upload preset to be scoped tightly, so that a leaked preset name cannot be abused to dump arbitrary content into the Cloudinary account.

#### Acceptance Criteria

1. THE setup documentation SHALL instruct the operator to configure Upload_Preset on Cloudinary as Unsigned with the folder `tedxdutse/gallery`, allowed formats limited to Allowed_Image_Formats ∪ Allowed_Video_Formats, max image size of Image_Size_Limit, and max video size of Video_Size_Limit.
2. THE setup documentation SHALL instruct the operator to enable Cloudinary's Restricted Media Types and Moderation features on Upload_Preset where available.
3. THE Admin_Gallery upload UI SHALL be mounted only on routes wrapped by the existing admin auth guard; the Upload_Service module itself imposes no caller-side gating, so calling code (including future tooling) MAY invoke uploads as long as it holds Upload_Preset.
4. THE setup documentation SHALL state that `Cloudinary_API_Secret` is configured only as a Supabase Edge Function secret (`CLOUDINARY_API_SECRET`) and SHALL NOT be added to any `VITE_*` variable.
5. THE setup documentation SHALL state that the operator should rotate Upload_Preset (rename or recreate it) if the preset name is suspected to have been abused, and SHALL describe how to update `VITE_CLOUDINARY_UPLOAD_PRESET` afterwards.
