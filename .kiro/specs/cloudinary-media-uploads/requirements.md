# Requirements Document

## Introduction

The TEDxDutse site currently stores media in two inconsistent ways: gallery images are uploaded from the admin UI as base64 data URLs and persisted into the Supabase `gallery_images.src` column (and localStorage), while speaker photos and sponsor logos are either base64 data URLs or static paths under `/public/images`. The base64 approach caps uploads at 2 MB to fit in localStorage, bloats Supabase rows, prevents video, and the current `AdminGallery` save flow generates client-side string IDs (`'img-' + Date.now()`) for an integer primary key, which causes every "update" branch to silently no-op against Supabase — so admin uploads only persist to localStorage.

This feature replaces all admin-uploaded media (gallery images and videos, speaker photos, sponsor logos) with assets hosted on Cloudinary. The browser uploads files directly to Cloudinary using an unsigned upload preset, receives back a Cloudinary asset descriptor (public_id, secure_url, resource_type, format, width, height, duration, bytes), and stores only that descriptor in Supabase. Public pages fetch directly from Cloudinary's CDN. The gallery additionally gains video support (with poster, lazy loading, and playback controls), and the existing gallery save path is corrected so that creates, updates, deletes, and reorders all reliably persist to Supabase. Pre-existing static paths (e.g. `/images/gallery/TEDxD-2.jpg`) continue to render unchanged until they are replaced through the admin UI.

## Glossary

- **Cloudinary**: Third-party media hosting and transformation service that stores uploaded assets and serves them over its CDN.
- **Cloud_Name**: The Cloudinary account identifier, exposed to the browser via the environment variable `VITE_CLOUDINARY_CLOUD_NAME`.
- **Upload_Preset**: A named, server-side configuration on Cloudinary that defines what an unsigned upload from the browser is allowed to do (folder, allowed formats, max bytes, transformations). Exposed to the browser via the environment variable `VITE_CLOUDINARY_UPLOAD_PRESET`.
- **Cloudinary_Asset**: A descriptor returned by the Cloudinary upload endpoint, containing at minimum `public_id`, `secure_url`, `resource_type` (`image` or `video`), `format`, `width`, `height`, `bytes`, and (for videos) `duration`.
- **Media_Reference**: The subset of a Cloudinary_Asset persisted in Supabase: `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `duration` (nullable), `bytes` (nullable).
- **Legacy_Media**: A `src` value already present in Supabase that is either a static path under `/images/...` or a `data:` URL, predating this feature.
- **Upload_Service**: The browser-side module (`src/lib/cloudinary.js` or equivalent) that posts a `File` to Cloudinary's REST endpoint, reports progress, and returns a Cloudinary_Asset.
- **Admin_Gallery**: The admin page at `src/pages/admin/AdminGallery.jsx` used to manage gallery items.
- **Admin_Speakers**: The admin page at `src/pages/admin/AdminSpeakers.jsx` used to manage speaker records, including their photo.
- **Admin_Sponsors**: The admin page used to manage sponsor records, including their logo.
- **Public_Gallery**: The visitor-facing gallery rendered by `GallerySection.jsx` and `GalleryPage.jsx`.
- **Site_Data_Context**: The React context (`src/context/SiteDataContext.jsx`) that loads, caches, and persists site content via Supabase and localStorage.
- **Gallery_Item**: A single row in `gallery_images`. Under this feature it represents either an image or a video.
- **Image_Asset**: A Cloudinary_Asset whose `resource_type` equals `"image"`.
- **Video_Asset**: A Cloudinary_Asset whose `resource_type` equals `"video"`.
- **Image_Size_Limit**: 10 megabytes (10 × 1024 × 1024 bytes), the maximum accepted file size for an Image_Asset upload.
- **Video_Size_Limit**: 100 megabytes (100 × 1024 × 1024 bytes), the maximum accepted file size for a Video_Asset upload.
- **Allowed_Image_Formats**: `jpg`, `jpeg`, `png`, `webp`, `gif`, `avif`.
- **Allowed_Video_Formats**: `mp4`, `webm`, `mov`.
- **Order_Index**: The integer column `gallery_images.order_index` that determines display order in Public_Gallery.

## Requirements

### Requirement 1: Cloudinary configuration and credentials

**User Story:** As a deployer, I want Cloudinary configuration to live in environment variables, so that the browser can upload to Cloudinary without exposing any API secret.

#### Acceptance Criteria

1. THE Upload_Service SHALL read `Cloud_Name` from `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME`.
2. THE Upload_Service SHALL read `Upload_Preset` from `import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET`.
3. WHEN `VITE_CLOUDINARY_CLOUD_NAME` or `VITE_CLOUDINARY_UPLOAD_PRESET` is missing or empty at runtime, THE Upload_Service SHALL throw an error whose message names the missing variable.
4. THE Upload_Service SHALL NOT read, reference, or accept any value named `api_secret`, `cloudinary_secret`, `VITE_CLOUDINARY_API_SECRET`, or any equivalent secret credential.
5. THE Upload_Service SHALL post uploads only to `https://api.cloudinary.com/v1_1/{Cloud_Name}/{resource_type}/upload` where `{resource_type}` is `image` or `video`.
6. THE project's `.env.example` file SHALL document `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` with empty placeholder values and a comment stating the upload preset must be configured as unsigned.

### Requirement 2: Direct browser upload to Cloudinary

**User Story:** As an admin, I want the browser to upload media directly to Cloudinary, so that uploads bypass Supabase row size limits and the site can host large images and videos.

#### Acceptance Criteria

1. WHEN an admin selects a file in Admin_Gallery, Admin_Speakers, or Admin_Sponsors, THE Upload_Service SHALL post the file to Cloudinary with multipart form fields `file`, `upload_preset` set to `Upload_Preset`, and (for gallery uploads) `folder` set to `tedxdutse/gallery`.
2. WHEN a file's MIME type starts with `image/`, THE Upload_Service SHALL upload to the `image` Cloudinary endpoint and set the resulting `Media_Reference.resource_type` to `"image"`.
3. WHEN a file's MIME type starts with `video/`, THE Upload_Service SHALL upload to the `video` Cloudinary endpoint and set the resulting `Media_Reference.resource_type` to `"video"`.
4. WHEN the Cloudinary response is received, THE Upload_Service SHALL return a Media_Reference object containing `public_id`, `secure_url`, `resource_type`, `format`, `width`, `height`, `bytes`, and `duration` (set to `null` when Cloudinary did not return a duration).
5. IF the Cloudinary response status code is not in the 2xx range, THEN THE Upload_Service SHALL reject with an error whose message includes the HTTP status code and the Cloudinary `error.message` field when present.
6. WHILE an upload is in progress, THE Upload_Service SHALL emit progress updates as a fraction between `0` and `1` inclusive, computed from the XHR `progress` event's `loaded / total`.

### Requirement 3: File validation before upload

**User Story:** As an admin, I want invalid files rejected before they hit the network, so that I do not waste bandwidth on uploads that will be refused.

#### Acceptance Criteria

1. WHEN a selected file's MIME type does not start with `image/` or `video/`, THE Upload_Service SHALL reject the file with an error message naming the received MIME type.
2. WHEN a selected image's `File.size` exceeds `Image_Size_Limit`, THE Upload_Service SHALL reject the file with an error message that includes both the file's size in MB and `Image_Size_Limit` in MB.
3. WHEN a selected video's `File.size` exceeds `Video_Size_Limit`, THE Upload_Service SHALL reject the file with an error message that includes both the file's size in MB and `Video_Size_Limit` in MB.
4. WHEN a selected image file's extension (lowercased, last segment after `.`) is not in `Allowed_Image_Formats`, THE Upload_Service SHALL reject the file with an error message listing `Allowed_Image_Formats`.
5. WHEN a selected video file's extension (lowercased, last segment after `.`) is not in `Allowed_Video_Formats`, THE Upload_Service SHALL reject the file with an error message listing `Allowed_Video_Formats`.
6. IF the Upload_Service rejects a file, THEN THE Upload_Service SHALL NOT issue any network request to Cloudinary for that file.

### Requirement 4: Gallery schema migration

**User Story:** As a developer, I want the `gallery_images` table to store Cloudinary metadata, so that public pages can render both images and videos using only the data in Supabase.

#### Acceptance Criteria

1. THE `gallery_images` table SHALL have a column `public_id` of type `text`, nullable, used to store `Cloudinary_Asset.public_id`.
2. THE `gallery_images` table SHALL have a column `resource_type` of type `text`, default `'image'`, constrained to the values `'image'` or `'video'`.
3. THE `gallery_images` table SHALL have columns `format` (text, nullable), `width` (integer, nullable), `height` (integer, nullable), `duration` (numeric, nullable), and `bytes` (integer, nullable).
4. THE `gallery_images.src` column SHALL continue to exist and SHALL hold either `Cloudinary_Asset.secure_url` for new uploads or the unchanged Legacy_Media string for pre-existing rows.
5. THE migration SQL SHALL leave existing rows readable: every existing row SHALL retain its current `id`, `src`, `alt`, `orientation`, and `order_index` values, and SHALL receive `resource_type = 'image'` and null values for `public_id`, `format`, `width`, `height`, `duration`, and `bytes`.
6. THE migration SQL file SHALL be added under `supabase/migrations/` (or the project's chosen migrations directory) with a timestamped filename.

### Requirement 5: Speaker and sponsor schema migration

**User Story:** As a developer, I want speaker photos and sponsor logos to also store Cloudinary metadata, so that all admin-uploaded media uses the same hosting strategy.

#### Acceptance Criteria

1. THE `speakers` table SHALL have a column `image_public_id` of type `text`, nullable, used to store the Cloudinary `public_id` of the speaker's photo.
2. THE `speakers.image` column SHALL continue to hold either `Cloudinary_Asset.secure_url` for new uploads or the unchanged Legacy_Media string for pre-existing rows.
3. THE `sponsors` table SHALL have a column `logo_public_id` of type `text`, nullable, used to store the Cloudinary `public_id` of the sponsor's logo.
4. THE `sponsors.logo` column SHALL continue to hold either `Cloudinary_Asset.secure_url` for new uploads or the unchanged Legacy_Media string for pre-existing rows.
5. THE migration SQL SHALL leave existing rows readable: every pre-existing row in `speakers` and `sponsors` SHALL retain its current values for all columns that already existed, and SHALL receive `null` for `image_public_id` and `logo_public_id` respectively.

### Requirement 6: Persisting gallery uploads to Supabase

**User Story:** As an admin, I want a saved gallery item to actually appear in Supabase, so that the public site reflects what I uploaded.

#### Acceptance Criteria

1. WHEN an admin uploads a new Gallery_Item through Admin_Gallery and clicks Save, THE Site_Data_Context SHALL call `galleryAPI.create` with `{src, alt, orientation, order_index, public_id, resource_type, format, width, height, duration, bytes}`.
2. WHEN an admin saves a Gallery_Item that has an existing integer `id` from Supabase, THE Site_Data_Context SHALL call `galleryAPI.update` with that `id` and the same field set as in criterion 1.
3. THE Site_Data_Context SHALL NOT generate or send any non-integer client-side `id` (such as a string starting with `img-`) to `galleryAPI.update` or `galleryAPI.create`.
4. WHEN an admin deletes a Gallery_Item that has an existing integer `id` and clicks Save, THE Site_Data_Context SHALL call `galleryAPI.delete` with that `id` so that the row is removed from Supabase.
5. WHEN an admin reorders Gallery_Items and clicks Save, THE Site_Data_Context SHALL update each persisted Gallery_Item's `order_index` to its new zero-based position in the saved list.
6. WHEN `galleryAPI.create` returns a row with a server-assigned integer `id`, THE Site_Data_Context SHALL replace the in-memory item's temporary client identifier with that returned integer `id`.
7. WHEN any Supabase write performed during a Save operation returns an error, THE Admin_Gallery save action SHALL surface a user-visible error message and SHALL NOT report the save as successful.

### Requirement 7: Persisting speaker and sponsor media uploads

**User Story:** As an admin, I want speaker photos and sponsor logos uploaded through the admin to be stored on Cloudinary and referenced from Supabase, so that the public site loads them from the CDN.

#### Acceptance Criteria

1. WHEN an admin uploads a photo in Admin_Speakers, THE Admin_Speakers page SHALL call the Upload_Service, set the speaker's `image` field to the returned `secure_url`, and set the speaker's `image_public_id` field to the returned `public_id`.
2. WHEN an admin saves speakers, THE Site_Data_Context SHALL persist `image` and `image_public_id` for every speaker row to Supabase.
3. WHEN an admin uploads a logo in Admin_Sponsors, THE Admin_Sponsors page SHALL call the Upload_Service, set the sponsor's `logo` field to the returned `secure_url`, and set the sponsor's `logo_public_id` field to the returned `public_id`.
4. WHEN an admin saves sponsors, THE Site_Data_Context SHALL persist `logo` and `logo_public_id` for every sponsor row to Supabase.
5. WHERE a speaker or sponsor row has no uploaded media, THE Site_Data_Context SHALL persist `null` for both the URL field and the corresponding `*_public_id` field.

### Requirement 8: Backwards compatibility with legacy media

**User Story:** As a visitor, I want pages that still reference the original static images to keep rendering, so that the site does not break during the migration.

#### Acceptance Criteria

1. WHEN Public_Gallery renders a Gallery_Item whose `src` starts with `/images/`, THE Public_Gallery SHALL render that path unchanged in the `<img>` tag.
2. WHEN Public_Gallery renders a Gallery_Item whose `src` starts with `data:`, THE Public_Gallery SHALL render that data URL unchanged in the `<img>` tag.
3. WHEN Public_Gallery renders a Gallery_Item whose `src` starts with `https://res.cloudinary.com/`, THE Public_Gallery SHALL render that URL unchanged in the `<img>` or `<video>` tag.
4. WHEN a Gallery_Item has `resource_type` equal to `null` or absent, THE Public_Gallery SHALL treat the item as `resource_type = 'image'`.
5. WHEN Admin_Gallery loads an existing Gallery_Item whose `public_id` is `null`, THE Admin_Gallery SHALL still display the row, allow editing of `alt` and `orientation`, allow reordering, and allow replacing the media via a new Cloudinary upload.

### Requirement 9: Video playback in the public gallery

**User Story:** As a visitor, I want to watch event videos in the gallery, so that I can experience moving content alongside the photos.

#### Acceptance Criteria

1. WHEN Public_Gallery renders a Gallery_Item whose `resource_type` is `"video"`, THE Public_Gallery SHALL render an HTML `<video>` element instead of an `<img>` element.
2. THE rendered `<video>` element SHALL have the attributes `controls`, `playsinline`, `preload="metadata"`, and `muted` initially set to `true`.
3. WHEN a Video_Asset has a known `public_id`, THE Public_Gallery SHALL set the `<video>` element's `poster` attribute to the Cloudinary URL `https://res.cloudinary.com/{Cloud_Name}/video/upload/so_auto,w_800,c_fill/{public_id}.jpg`.
4. WHEN Public_Gallery is rendered as a masonry grid, THE Public_Gallery SHALL apply the same `gallery-item--portrait` or `gallery-item--landscape` class to a video Gallery_Item that it would apply to an image Gallery_Item with the same `orientation` value.
5. WHEN a visitor opens the lightbox on a Gallery_Item whose `resource_type` is `"video"`, THE lightbox SHALL render a `<video>` element with `controls` and shall not auto-advance to the next item while the video is playing.
6. THE Public_Gallery SHALL set `loading="lazy"` on image Gallery_Items, and SHALL set `preload="metadata"` (not `preload="auto"`) on video Gallery_Items so that video bytes are fetched only on user interaction.

### Requirement 10: Deleting media from Cloudinary

**User Story:** As an admin, I want media I removed from the gallery to be cleaned up from Cloudinary, so that storage usage reflects the live site.

#### Acceptance Criteria

1. WHEN an admin deletes a Gallery_Item whose `public_id` is non-null and saves, THE Site_Data_Context SHALL append `{public_id, resource_type, deleted_at}` to a Supabase table named `cloudinary_deletions_pending` for later server-side cleanup.
2. WHEN an admin replaces the media on an existing Gallery_Item, speaker, or sponsor (uploading a new file in place of an old one whose `public_id` is non-null), THE corresponding admin page SHALL append the old `{public_id, resource_type}` to `cloudinary_deletions_pending`.
3. THE `cloudinary_deletions_pending` table SHALL have columns `id` (serial primary key), `public_id` (text, not null), `resource_type` (text, not null, constrained to `'image'` or `'video'`), `created_at` (timestamptz, default `now()`), and `processed_at` (timestamptz, nullable).
4. THE browser-side code SHALL NOT call Cloudinary's destroy endpoint directly, because that endpoint requires the API secret.
5. WHERE a deletion entry exists in `cloudinary_deletions_pending` with `processed_at` null, a server-side or scheduled job (out of scope for this feature beyond the table contract) MAY consume it; this requirement only mandates that the table is written to correctly.

### Requirement 11: Upload progress and error feedback

**User Story:** As an admin, I want to see upload progress and clear error messages, so that I know whether my file is going through.

#### Acceptance Criteria

1. WHILE an upload is in progress in Admin_Gallery, Admin_Speakers, or Admin_Sponsors, THE admin page SHALL display a progress indicator showing the integer percentage `Math.round(progress * 100)`.
2. WHILE an upload is in progress, THE admin page SHALL disable the file input and the Save button for that section.
3. WHEN an upload completes successfully, THE admin page SHALL display a thumbnail of the uploaded media (image preview or video first frame) within 2 seconds of the success callback firing.
4. IF an upload fails, THEN THE admin page SHALL display an inline error message containing the error from the Upload_Service, and SHALL re-enable the file input.
5. IF the network connection is lost mid-upload, THEN THE Upload_Service SHALL reject with an error whose message contains the string `network`.

### Requirement 12: Public gallery rendering of images and order

**User Story:** As a visitor, I want gallery items to appear in the order an admin set, so that the curated sequence is preserved.

#### Acceptance Criteria

1. THE Public_Gallery SHALL render Gallery_Items in ascending order of `order_index`.
2. WHEN two Gallery_Items have the same `order_index`, THE Public_Gallery SHALL break the tie by ascending `id`.
3. WHEN an admin saves N Gallery_Items in a specific list order, THE next reload of Public_Gallery SHALL display exactly those N items in that same order.
4. WHEN an admin deletes a Gallery_Item and saves, THE next reload of Public_Gallery SHALL NOT include that item.

### Requirement 13: Persisted Cloudinary asset invariants

**User Story:** As a maintainer, I want every Cloudinary-backed gallery row to satisfy a stable shape, so that the public site never has to defensively render half-populated assets.

#### Acceptance Criteria

1. FOR every Gallery_Item where `public_id` is non-null, THE Gallery_Item's `src` SHALL be a non-empty string starting with `https://res.cloudinary.com/`.
2. FOR every Gallery_Item where `public_id` is non-null, THE Gallery_Item's `resource_type` SHALL be either `"image"` or `"video"`.
3. FOR every Gallery_Item where `resource_type` is `"video"` and `public_id` is non-null, THE Gallery_Item's `format` SHALL be a member of `Allowed_Video_Formats`.
4. FOR every Gallery_Item where `resource_type` is `"image"` and `public_id` is non-null, THE Gallery_Item's `format` SHALL be a member of `Allowed_Image_Formats`.
5. FOR every Gallery_Item where `public_id` is non-null, THE Gallery_Item's `width` and `height` SHALL be positive integers.

### Requirement 14: Round-trip persistence

**User Story:** As an admin, I want what I save to be exactly what I see on the next reload, so that the admin and Supabase agree.

#### Acceptance Criteria

1. WHEN an admin saves a list of N Gallery_Items, THEN reloads the page, THE Admin_Gallery SHALL display N Gallery_Items in the same order with the same `alt`, `orientation`, `src`, `public_id`, and `resource_type` values for each.
2. WHEN an admin saves a speaker with a freshly-uploaded photo and reloads, THE Admin_Speakers page SHALL display that speaker with the same `image` URL and `image_public_id` value.
3. WHEN an admin saves a sponsor with a freshly-uploaded logo and reloads, THE Admin_Sponsors page SHALL display that sponsor with the same `logo` URL and `logo_public_id` value.
4. WHEN an admin saves the same gallery list twice in a row without changes, THE second save SHALL leave the Supabase rows for that list unchanged in count and in `(id, src, public_id, order_index)` per row (idempotent save).

### Requirement 15: Upload preset configuration documentation

**User Story:** As a deployer, I want documented Cloudinary preset settings, so that the unsigned upload preset enforces sensible limits server-side, not just in the browser.

#### Acceptance Criteria

1. THE project SHALL include a `CLOUDINARY_SETUP.md` document at the repo root.
2. THE `CLOUDINARY_SETUP.md` document SHALL state that the upload preset must be configured as `Unsigned`.
3. THE `CLOUDINARY_SETUP.md` document SHALL state that the upload preset must restrict allowed formats to `Allowed_Image_Formats ∪ Allowed_Video_Formats`.
4. THE `CLOUDINARY_SETUP.md` document SHALL state that the upload preset must set a maximum file size at least as strict as `Video_Size_Limit` and that the image-specific size cap on Cloudinary's side should be `Image_Size_Limit`.
5. THE `CLOUDINARY_SETUP.md` document SHALL state that no Cloudinary API secret is to be added to any `VITE_*` environment variable.
