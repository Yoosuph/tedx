import { useState, useRef, useCallback } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';
import { uploadGalleryMedia, validateGalleryFile } from '../../lib/cloudinary';
import { supabase } from '../../lib/supabase';

/**
 * Build a thumbnail URL for a gallery item.
 * Uses Cloudinary URL builders when publicId is available, otherwise falls
 * back to the raw `src`.
 */
import {
  buildImageUrl,
  buildVideoPosterUrl,
} from '../../lib/cloudinary';

function getThumbnailUrl(item) {
  if (!item.publicId) return item.src;
  if (item.resourceType === 'video') {
    return buildVideoPosterUrl({ publicId: item.publicId, width: 400 });
  }
  return buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: 400 });
}

/**
 * Destroy a Cloudinary asset via the `cloudinary-destroy` Supabase Edge Function.
 * Silently fails if the function is not deployed or returns an error.
 */
async function destroyCloudinaryAsset(publicId, resourceType) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const funcUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cloudinary-destroy`;
    await fetch(funcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType }),
    });
  } catch {
    // Non-critical — asset will remain in Cloudinary but won't be referenced.
    console.warn('Could not destroy Cloudinary asset (edge function may not be deployed).');
  }
}

export default function AdminGallery() {
  const { galleryImages, updateGalleryImages, deleteGalleryImage } = useSiteData();
  const [images, setImages] = useState(galleryImages.map(img => ({ ...img })));
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAlt, setNewAlt] = useState('');
  const [newOrientation, setNewOrientation] = useState('landscape');
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(''); // '' | 'uploading' | 'error' | 'success'
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  /** Upload a file to Cloudinary, then add the result to the local state. */
  const handleUpload = useCallback(async (file, altText, orientation) => {
    if (!file) return;

    // Pre-flight validation
    try {
      validateGalleryFile(file);
    } catch (err) {
      setUploadStatus('error');
      setUploadErrorMessage(err.message);
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadErrorMessage('');

    try {
      const media = await uploadGalleryMedia(file, (fraction) => {
        setUploadProgress(Math.round(fraction * 100));
      });

      const newImg = {
        id: 'img-' + Date.now(),
        src: media.secure_url,
        alt: altText.trim() || file.name.replace(/\.[^.]+$/, ''),
        orientation,
        publicId: media.public_id,
        resourceType: media.resource_type,
        format: media.format,
        width: media.width,
        height: media.height,
        bytes: media.bytes,
        duration: media.duration,
      };

      setImages(prev => [...prev, newImg]);
      setNewAlt('');
      setNewOrientation('landscape');
      setShowAddForm(false);
      setSaved(false);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (err) {
      setUploadStatus('error');
      setUploadErrorMessage(err.message || 'Upload failed');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Handle file selected from "Add New" form
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleUpload(file, newAlt, newOrientation);
  }, [newAlt, newOrientation, handleUpload]);

  // Handle file selected from "Edit" panel (replace)
  const handleEditFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !editingId) return;
    setUploadStatus('uploading');
    try {
      validateGalleryFile(file);
      const media = await uploadGalleryMedia(file, (fraction) => {
        setUploadProgress(Math.round(fraction * 100));
      });
      updateImage(editingId, 'src', media.secure_url);
      updateImage(editingId, 'publicId', media.public_id);
      updateImage(editingId, 'resourceType', media.resource_type);
      updateImage(editingId, 'format', media.format);
      updateImage(editingId, 'width', media.width);
      updateImage(editingId, 'height', media.height);
      updateImage(editingId, 'bytes', media.bytes);
      updateImage(editingId, 'duration', media.duration);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (err) {
      setUploadStatus('error');
      setUploadErrorMessage(err.message || 'Upload failed');
    }
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  }, [editingId]);

  const deleteImage = useCallback(async (id) => {
    const img = images.find(i => i.id === id);
    if (!img) return;

    // Destroy Cloudinary asset if present
    if (img?.publicId && img?.resourceType) {
      await destroyCloudinaryAsset(img.publicId, img.resourceType);
    }

    // Delete from database if it has a real DB id (numeric)
    if (Number.isInteger(Number(id))) {
      try {
        await deleteGalleryImage(id);
      } catch (err) {
        console.error('Failed to delete from database:', err);
      }
    }

    setImages(prev => prev.filter(img => img.id !== id));
    if (editingId === id) setEditingId(null);
    setSaved(false);
  }, [images, editingId, deleteGalleryImage]);

  const updateImage = useCallback((id, field, value) => {
    setImages(prev => {
      const updated = prev.map(img =>
        img.id === id ? { ...img, [field]: value } : img
      );
      // Check if anything actually changed to avoid unnecessary re-renders
      return updated;
    });
    setSaved(false);
  }, []);

  const moveImage = useCallback((index, dir) => {
    const ni = index + dir;
    if (ni < 0 || ni >= images.length) return;
    setImages(prev => {
      const u = [...prev];
      [u[index], u[ni]] = [u[ni], u[index]];
      return u;
    });
    setSaved(false);
  }, [images.length]);

  const handleDragStart = useCallback((i) => { dragItem.current = i; }, []);
  const handleDragEnter = useCallback((i) => { dragOver.current = i; }, []);
  const handleDragEnd = useCallback(() => {
    if (dragItem.current !== null && dragOver.current !== null && dragItem.current !== dragOver.current) {
      setImages(prev => {
        const u = [...prev];
        const [d] = u.splice(dragItem.current, 1);
        u.splice(dragOver.current, 0, d);
        return u;
      });
      setSaved(false);
    }
    dragItem.current = null;
    dragOver.current = null;
  }, []);

  const [btnState, setBtnState] = useState('idle');

  const handleSave = useCallback(async () => {
    setBtnState('loading');
    try {
      await updateGalleryImages(images);
      setBtnState('success');
      setTimeout(() => setBtnState('idle'), 1500);
    } catch (err) {
      console.error(err);
      setBtnState('idle');
    }
  }, [images, updateGalleryImages]);

  const editingImage = images.find(img => img.id === editingId);

  const acceptTypes = 'image/*,video/*';
  const acceptTypesEdit = acceptTypes;

  return (
    <AdminLayout>
      <style>{`
        .gallery-page { max-width: 1100px; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .gallery-card { position: relative; background: var(--dark-surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; cursor: grab; transition: border-color 0.2s; }
        .gallery-card:hover { border-color: rgba(255,255,255,0.15); }
        .gallery-thumb { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
        .gallery-card.portrait .gallery-thumb { aspect-ratio: 3/4; }
        .gallery-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
        .overlay-btn { padding: 0.375rem 0.875rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; min-width: 80px; }
        .overlay-btn.edit { background: var(--ted-red); color: white; }
        .overlay-btn.edit:hover { background: #C41E3A; }
        .overlay-btn.del { background: rgba(239,68,68,0.15); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.3); }
        .reorder-btns { display: flex; gap: 0.25rem; }
        .reorder-btn { width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .reorder-btn:hover { background: rgba(255,255,255,0.2); }
        .gallery-alt-text { padding: 0.5rem 0.625rem; font-size: 0.6875rem; color: var(--gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-top: 1px solid rgba(255,255,255,0.05); }
        .add-form-card { background: var(--dark-surface); border: 2px dashed rgba(255,255,255,0.12); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .add-form-card h4 { color: var(--white); font-size: 1rem; margin: 0 0 1rem; }
        .add-form-row { display: grid; grid-template-columns: 2fr 1fr auto auto; gap: 0.75rem; align-items: end; }
        .afg { display: flex; flex-direction: column; gap: 0.375rem; }
        .afg label { color: var(--gray-400); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .afg input, .afg select { padding: 0.625rem 0.875rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--white); font-size: 0.8125rem; }
        .afg input:focus, .afg select:focus { outline: none; border-color: var(--ted-red); }
        .afg select { cursor: pointer; }
        .btn-add-img { padding: 0.625rem 1.25rem; background: var(--ted-red); color: white; border: none; border-radius: 8px; font-size: 0.8125rem; font-weight: 700; cursor: pointer; }
        .btn-add-img:hover { background: #C41E3A; }
        .btn-add-new { padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; color: var(--gray-400); font-size: 0.875rem; cursor: pointer; margin-bottom: 1.5rem; }
        .btn-add-new:hover { border-color: var(--ted-red); color: var(--ted-red); }
        .edit-panel { background: var(--dark-surface); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-start; }
        .edit-panel img, .edit-panel video { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
        .edit-fields { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
        .edit-fields .afg input, .edit-fields .afg select { width: 100%; }
        .edit-actions { display: flex; gap: 0.5rem; align-items: center; }
        .btn-done { padding: 0.5rem 1rem; background: var(--ted-red); color: white; border: none; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
        .btn-cancel { padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); color: var(--gray-400); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.8125rem; cursor: pointer; }
        .save-bar { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
        .btn-save {
          padding: 0.75rem 2rem;
          background: var(--ted-red);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-save:hover:not(:disabled) { background: #C41E3A; }
        .btn-save:disabled { opacity: 0.8; cursor: not-allowed; }
        .btn-save.success-state { background: #22C55E !important; }
        .btn-loading-content { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #ffffff; border-radius: 50%; animation: btn-spin 0.6s linear infinite; }
        @keyframes btn-spin { to { transform: rotate(360deg); } }

        /* Upload progress bar */
        .upload-progress-area { margin-bottom: 1rem; }
        .upload-progress-bar-track { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .upload-progress-bar-fill { height: 100%; background: var(--ted-red); border-radius: 3px; transition: width 0.2s ease; }
        .upload-progress-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--gray-400); margin-top: 0.375rem; }
        .upload-error { color: #FCA5A5; font-size: 0.75rem; margin-top: 0.5rem; background: rgba(239,68,68,0.1); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(239,68,68,0.2); }
        .upload-success { color: #86EFAC; font-size: 0.75rem; margin-top: 0.375rem; }

        /* Video badge */
        .video-badge { position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.7); color: white; font-size: 0.625rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.25rem; z-index: 2; }
        .video-badge svg { width: 12px; height: 12px; fill: currentColor; }

        .file-upload-label { display: inline-block; cursor: pointer; }
        .file-upload-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
        .file-upload-btn { display: inline-block; padding: 0.625rem 1rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--gray-300); font-size: 0.8125rem; transition: all 0.2s; }
        .file-upload-label:hover .file-upload-btn { border-color: var(--ted-red); color: var(--white); }

        .empty-state { text-align: center; padding: 3rem 1rem; color: var(--gray-400); }

        @media (max-width: 640px) {
          .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
          .add-form-row { grid-template-columns: 1fr !important; }
          .edit-panel { flex-direction: column; }
        }
      `}</style>

      <div className="gallery-page">
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Gallery</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
          Manage gallery images and videos. Files are uploaded to <strong>Cloudinary</strong>.
          {uploadStatus === 'uploading' && (
            <span style={{ color: 'var(--ted-red)', marginLeft: '0.5rem' }}>(uploading...)</span>
          )}
        </p>

        {/* Upload progress indicator */}
        {(uploadStatus === 'uploading' || uploadStatus === 'error') && (
          <div className="upload-progress-area">
            <div className="upload-progress-bar-track">
              <div className="upload-progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <div className="upload-progress-label">
              {uploadStatus === 'uploading' && (
                <>{uploadProgress}% uploaded — please wait</>
              )}
            </div>
            {uploadStatus === 'error' && uploadErrorMessage && (
              <div className="upload-error">⚠️ {uploadErrorMessage}</div>
            )}
          </div>
        )}
        {uploadStatus === 'success' && (
          <div className="upload-progress-area">
            <div className="upload-success">✓ Upload successful</div>
          </div>
        )}

        {/* Edit panel */}
        {editingImage && (
          <div className="edit-panel">
            {editingImage.resourceType === 'video' ? (
              <video src={editingImage.src} muted controls style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            ) : (
              <img src={getThumbnailUrl(editingImage)} alt={editingImage.alt} />
            )}
            <div className="edit-fields">
              <div className="afg">
                <label>Replace File</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <label className="file-upload-label">
                    <input
                      type="file"
                      accept={acceptTypesEdit}
                      ref={editFileInputRef}
                      onChange={handleEditFileSelect}
                      className="file-upload-input"
                    />
                    <span className="file-upload-btn">
                      {uploadStatus === 'uploading' ? `Uploading ${uploadProgress}%...` : 'Choose File'}
                    </span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="afg">
                  <label>Alt Text</label>
                  <input value={editingImage.alt} onChange={e => updateImage(editingImage.id, 'alt', e.target.value)} />
                </div>
                <div className="afg">
                  <label>Orientation</label>
                  <select value={editingImage.orientation} onChange={e => updateImage(editingImage.id, 'orientation', e.target.value)}>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
              </div>
              <div className="edit-actions">
                <button className="btn-done" onClick={() => setEditingId(null)}>Done</button>
                <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Add new form */}
        {showAddForm ? (
          <div className="add-form-card">
            <h4>Add New Media</h4>
            <div className="add-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <div className="afg">
                <label>File (Image or Video)</label>
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept={acceptTypes}
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="file-upload-input"
                    disabled={uploading}
                  />
                  <span className="file-upload-btn">
                    {uploading ? `Uploading ${uploadProgress}%...` : 'Choose File'}
                  </span>
                </label>
              </div>
              <div className="afg">
                <label>Alt Text</label>
                <input value={newAlt} onChange={e => setNewAlt(e.target.value)} placeholder="Description" />
              </div>
              <div className="afg">
                <label>Orientation</label>
                <select value={newOrientation} onChange={e => setNewOrientation(e.target.value)}>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', margin: '0.75rem 0 0' }}>
              Supported: <strong>Images</strong> — JPG, PNG, WebP, AVIF, GIF (max 10 MB) &nbsp;|&nbsp; <strong>Videos</strong> — MP4, WebM, MOV (max 100 MB)
            </p>
          </div>
        ) : (
          <button className="btn-add-new" onClick={() => setShowAddForm(true)}>+ Add New Media</button>
        )}

        {/* Gallery grid */}
        {images.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>🖼️</p>
            <p>No gallery media yet. Add your first image or video above.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`gallery-card ${img.orientation === 'portrait' ? 'portrait' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
              >
                {/* Video badge */}
                {img.resourceType === 'video' && (
                  <div className="video-badge">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    Video
                  </div>
                )}
                {img.resourceType === 'video' ? (
                  <video
                    className="gallery-thumb"
                    src={img.src}
                    muted
                    preload="metadata"
                    onError={e => { e.target.style.opacity = '0.3'; }}
                  />
                ) : (
                  <img
                    className="gallery-thumb"
                    src={getThumbnailUrl(img)}
                    alt={img.alt}
                    onError={e => { e.target.style.opacity = '0.3'; }}
                  />
                )}
                <div className="gallery-alt-text">
                  {img.alt || 'No alt text'}
                  {img.resourceType === 'video' && ' 🎬'}
                </div>
                <div className="gallery-overlay">
                  {img.resourceType === 'video' && (
                    <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 600 }}>
                      🎬 {img.duration ? `${Math.round(img.duration)}s` : 'Video'}
                    </span>
                  )}
                  <button className="overlay-btn edit" onClick={() => setEditingId(img.id)}>✏️ Edit</button>
                  <button className="overlay-btn del" onClick={() => deleteImage(img.id)}>🗑️ Delete</button>
                  <div className="reorder-btns">
                    <button className="reorder-btn" onClick={() => moveImage(index, -1)} title="Move up">↑</button>
                    <button className="reorder-btn" onClick={() => moveImage(index, 1)} title="Move down">↓</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save bar */}
        <div className="save-bar">
          <button
            className={`btn-save ${btnState === 'success' ? 'success-state' : ''}`}
            onClick={handleSave}
            disabled={btnState !== 'idle'}
          >
            {btnState === 'idle' && 'Save Gallery'}
            {btnState === 'loading' && (
              <div className="btn-loading-content">
                <div className="btn-spinner" />
                <span>Saving...</span>
              </div>
            )}
            {btnState === 'success' && '✓ Gallery Saved'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
