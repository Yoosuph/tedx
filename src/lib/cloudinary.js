// src/lib/cloudinary.js
//
// Cloudinary client library for the TEDxDutse gallery.
//
// Responsibilities (per design `cloudinary-gallery-media`):
//   * Read Cloudinary configuration from `import.meta.env`.
//   * Validate gallery files before upload.
//   * Upload gallery media via XMLHttpRequest with progress reporting.
//   * Build Cloudinary delivery URLs for the public site.
//
// SECURITY: This module is bundled into the browser. It MUST NEVER reference
// any Cloudinary signing secret (Req 1.5). Signing happens only inside
// the `cloudinary-destroy` Supabase Edge Function.

// ---------------------------------------------------------------------------
// Constants (Task 3.1)
// ---------------------------------------------------------------------------

/** Allowed image extensions for gallery uploads (Req 2.8). */
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];

/** Allowed video extensions for gallery uploads (Req 2.9). */
export const ALLOWED_VIDEO_FORMATS = ['mp4', 'webm', 'mov'];

/** Maximum image upload size in bytes — 10 MB (Req 2.10). */
export const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;

/** Maximum video upload size in bytes — 100 MB (Req 2.11). */
export const VIDEO_SIZE_LIMIT = 100 * 1024 * 1024;

/** Cloudinary-delivered width for masonry tiles and HomePage preview (Req 6.1, 6.4, 6.5). */
export const THUMBNAIL_WIDTH = 600;

/** Cloudinary-delivered width inside the lightbox modal (Req 6.2). */
export const LIGHTBOX_WIDTH = 1600;

/** Responsive widths emitted in `<img srcSet>` (Req 6.8). */
export const RESPONSIVE_WIDTHS = [400, 800, 1200];

/** Cloudinary upload folder (Req 2.1, Req 10.1). */
export const CLOUDINARY_FOLDER = 'tedxdutse/gallery';

// ---------------------------------------------------------------------------
// Configuration (Task 3.1)
// ---------------------------------------------------------------------------

/**
 * Read Cloudinary config from Vite env vars.
 *
 * @returns {{ cloudName: string, uploadPreset: string }}
 * @throws {Error} naming the missing variable when either is absent or empty
 *
 * Validates Req 1.1, 1.2, 1.3, 1.4.
 */
function getConfig() {
  const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Return null when config is missing — callers must handle gracefully
  // instead of crashing the render tree.  This protects against deployments
  // where Cloudinary env vars haven't been set yet.
  if (!cloudName || typeof cloudName !== 'string') {
    console.warn(
      'Cloudinary: VITE_CLOUDINARY_CLOUD_NAME is missing — Cloudinary URLs will not be generated.',
    );
    return null;
  }
  if (!uploadPreset || typeof uploadPreset !== 'string') {
    console.warn(
      'Cloudinary: VITE_CLOUDINARY_UPLOAD_PRESET is missing — Cloudinary uploads are disabled.',
    );
    // upload preset is only needed for uploads; URL generation still works
  }

  return { cloudName, uploadPreset: uploadPreset || '' };
}

// ---------------------------------------------------------------------------
// URL builders (Task 3.8)
// ---------------------------------------------------------------------------
//
// These builders construct Cloudinary delivery URLs for the public site. They
// MUST emit only the transformation parameters listed below (Req 6.7):
//   - `f_auto`  : automatic format selection
//   - `q_auto`  : automatic quality
//   - `w_<n>`   : explicit pixel width
//   - `so_0`    : start offset 0 seconds (video poster only)
//
// No other implicit transformations are added, so builds remain reproducible.

/**
 * Build a Cloudinary delivery URL for a gallery image.
 *
 *   https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto,w_{width}/{public_id}.{format}
 *
 * @param {{ publicId: string, format: string, width: number }} input
 * @returns {string}
 *
 * Validates Req 6.1, 6.2, 6.5, 6.7.
 */
export function buildImageUrl({ publicId, format, width }) {
  const cfg = getConfig();
  if (!cfg) return null;
  return `https://res.cloudinary.com/${cfg.cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}.${format}`;
}

/**
 * Build a Cloudinary delivery URL for a gallery video.
 *
 *   https://res.cloudinary.com/{cloud}/video/upload/f_auto,q_auto/{public_id}.{format}
 *
 * @param {{ publicId: string, format: string }} input
 * @returns {string}
 *
 * Validates Req 6.3, 6.7.
 */
export function buildVideoUrl({ publicId, format }) {
  const cfg = getConfig();
  if (!cfg) return null;
  return `https://res.cloudinary.com/${cfg.cloudName}/video/upload/f_auto,q_auto/${publicId}.${format}`;
}

/**
 * Build a Cloudinary poster image URL for a gallery video.
 *
 *   https://res.cloudinary.com/{cloud}/video/upload/f_auto,q_auto,w_{width},so_0/{public_id}.jpg
 *
 * @param {{ publicId: string, width?: number }} input
 * @returns {string}
 *
 * Validates Req 6.4, 6.5, 6.7.
 */
export function buildVideoPosterUrl({ publicId, width = THUMBNAIL_WIDTH }) {
  const cfg = getConfig();
  if (!cfg) return null;
  return `https://res.cloudinary.com/${cfg.cloudName}/video/upload/f_auto,q_auto,w_${width},so_0/${publicId}.jpg`;
}

/**
 * Build a `srcSet` string for responsive image loading. Returns the
 * `RESPONSIVE_WIDTHS` widths joined by ", " with `<n>w` descriptors.
 *
 *   "<url@400> 400w, <url@800> 800w, <url@1200> 1200w"
 *
 * @param {{ publicId: string, format: string }} input
 * @returns {string}
 *
 * Validates Req 6.8.
 */
export function buildSrcSet({ publicId, format }) {
  const cfg = getConfig();
  if (!cfg) return '';
  return RESPONSIVE_WIDTHS
    .map((width) => `${buildImageUrl({ publicId, format, width })} ${width}w`)
    .join(', ');
}

// ---------------------------------------------------------------------------
// File validation (Task 3.2)
// ---------------------------------------------------------------------------
//
// Pre-flight validation for gallery uploads. Pure synchronous function so it
// can be property-tested without mocking XHR. Throws synchronously with a
// message that names the offending value when invalid.
//
// Validates:
//   - file.type starts with "image/" or "video/"            (Req 2.7)
//   - lowercased final extension of file.name is in the
//     matching allow-list                                   (Req 2.8, 2.9)
//   - file.size <= the matching size limit                  (Req 2.10, 2.11)
//
// Returns { resourceType: 'image' | 'video', extension: string } for valid
// files.

/**
 * Extract the lowercased final extension segment from a filename. Returns the
 * empty string when the filename has no `.` separator or ends with `.`.
 *
 * @param {string} name
 * @returns {string}
 */
function extractExtension(name) {
  if (typeof name !== 'string') return '';
  const lastDot = name.lastIndexOf('.');
  if (lastDot < 0 || lastDot === name.length - 1) return '';
  return name.slice(lastDot + 1).toLowerCase();
}

/**
 * Format a byte count as a whole-number megabyte limit for error messages,
 * e.g. `10 MB`. The constants are exact multiples of 1024*1024 so this is a
 * lossless conversion.
 *
 * @param {number} bytes
 * @returns {string}
 */
function bytesToMbLabel(bytes) {
  return `${bytes / (1024 * 1024)} MB`;
}

/**
 * Validate a gallery upload file.
 *
 * @param {File} file - A browser `File` (or any object with `type`, `name`,
 *   and `size` properties).
 * @returns {{ resourceType: 'image' | 'video', extension: string }}
 * @throws {Error} synchronously when validation fails. The message names the
 *   offending value (MIME type, extension allow-list, or size limit in MB).
 *
 * Validates Req 2.7, 2.8, 2.9, 2.10, 2.11.
 */
export function validateGalleryFile(file) {
  const mime = typeof file?.type === 'string' ? file.type : '';

  let resourceType;
  let allowedFormats;
  let sizeLimit;

  if (mime.startsWith('image/')) {
    resourceType = 'image';
    allowedFormats = ALLOWED_IMAGE_FORMATS;
    sizeLimit = IMAGE_SIZE_LIMIT;
  } else if (mime.startsWith('video/')) {
    resourceType = 'video';
    allowedFormats = ALLOWED_VIDEO_FORMATS;
    sizeLimit = VIDEO_SIZE_LIMIT;
  } else {
    // Req 2.7: include the offending MIME in the message.
    throw new Error(
      `Unsupported file type "${mime}": gallery uploads must have a MIME type starting with "image/" or "video/".`,
    );
  }

  const extension = extractExtension(file?.name ?? '');
  if (!allowedFormats.includes(extension)) {
    // Req 2.8 / 2.9: include the allow-list in the message.
    const allowList = allowedFormats.join(', ');
    throw new Error(
      `Unsupported ${resourceType} extension ".${extension}": allowed formats are ${allowList}.`,
    );
  }

  const size = typeof file?.size === 'number' ? file.size : NaN;
  if (!Number.isFinite(size) || size > sizeLimit) {
    // Req 2.10 / 2.11: include the limit in MB in the message.
    throw new Error(
      `${resourceType === 'image' ? 'Image' : 'Video'} file is too large: maximum size is ${bytesToMbLabel(sizeLimit)}.`,
    );
  }

  return { resourceType, extension };
}

// ---------------------------------------------------------------------------
// Upload (Task 3.4)
// ---------------------------------------------------------------------------
//
// Direct browser upload to Cloudinary using `XMLHttpRequest`. We use XHR
// rather than `fetch` because `fetch` cannot report upload progress in
// Safari, and Req 2.6 requires an exact `loaded / total` fraction.
//
// Wire shape (Req 1.6, 2.1, 2.2, 2.3):
//   POST https://api.cloudinary.com/v1_1/{cloudName}/{resource_type}/upload
//   multipart/form-data:
//     file           = <File>
//     upload_preset  = <Upload_Preset>
//     folder         = "tedxdutse/gallery"   (CLOUDINARY_FOLDER)
//
// Resolves with a Media_Reference (Req 2.4); rejects with an Error whose
// message includes the HTTP status and Cloudinary `error.message` on non-2xx
// (Req 2.5), or a network-error message on transport failures.

/**
 * @typedef {Object} MediaReference
 * @property {string} public_id     Cloudinary asset public_id
 * @property {string} secure_url    HTTPS delivery URL of the asset
 * @property {'image' | 'video'} resource_type
 * @property {string} format        e.g. 'jpg', 'mp4'
 * @property {number} width
 * @property {number} height
 * @property {number} bytes
 * @property {number | null} duration  Null when Cloudinary returned no `duration` field
 */

/**
 * Upload a gallery file to Cloudinary.
 *
 * @param {File} file
 * @param {(fraction: number) => void} [onProgress] - Receives upload
 *   progress as a fraction in [0, 1] computed from `event.loaded / event.total`.
 *   Only called when `event.lengthComputable` is true.
 * @returns {Promise<MediaReference>}
 *
 * Validates Req 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6.
 */
export async function uploadGalleryMedia(file, onProgress) {
  // Pre-flight validation. validateGalleryFile throws synchronously on any
  // invalid input; because this function is `async`, the throw becomes a
  // rejection of the returned promise (Req 2.7-2.11 are surfaced via this).
  const { resourceType } = validateGalleryFile(file);
  const { cloudName, uploadPreset } = getConfig();

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    // Progress reporting (Req 2.6). Attach to `xhr.upload`, not `xhr` itself,
    // so we observe outbound bytes rather than the response.
    if (typeof onProgress === 'function') {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded / event.total);
        }
      });
    }

    xhr.addEventListener('load', () => {
      const status = xhr.status;
      let body = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }

      if (status >= 200 && status < 300) {
        // Req 2.4: project the Cloudinary_Asset down to a Media_Reference and
        // coerce a missing `duration` to `null` (the Supabase column is
        // nullable for image rows that have no duration).
        if (!body) {
          reject(new Error(
            `Cloudinary upload failed: HTTP ${status}: empty or invalid JSON response body.`,
          ));
          return;
        }
        resolve({
          public_id: body.public_id,
          secure_url: body.secure_url,
          resource_type: resourceType,
          format: body.format,
          width: body.width,
          height: body.height,
          bytes: body.bytes,
          duration: body.duration ?? null,
        });
        return;
      }

      // Req 2.5: include the HTTP status and Cloudinary error.message when
      // present.
      const cloudinaryMessage = body?.error?.message;
      const detail = cloudinaryMessage ? `: ${cloudinaryMessage}` : '';
      reject(new Error(`Cloudinary upload failed: HTTP ${status}${detail}`));
    });

    // Network-failure paths. We never see a response on these, so we cannot
    // include a Cloudinary message (Req 2.5 only applies to non-2xx HTTP
    // responses).
    xhr.addEventListener('error', () => {
      reject(new Error('Cloudinary upload failed: network error.'));
    });
    xhr.addEventListener('timeout', () => {
      reject(new Error('Cloudinary upload failed: network timeout.'));
    });
    xhr.addEventListener('abort', () => {
      reject(new Error('Cloudinary upload failed: request aborted.'));
    });

    // Build the multipart body with EXACTLY the three fields specified by
    // Req 2.1. We must not add any other fields (api_key, timestamp,
    // signature) because the upload preset is configured Unsigned and any
    // extra credential-shaped field would either be ignored or trip
    // Cloudinary's signature validation.
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    form.append('folder', CLOUDINARY_FOLDER);

    xhr.send(form);
  });
}
