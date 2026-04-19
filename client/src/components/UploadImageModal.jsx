import { useState, useRef } from 'react';
import { HiOutlineX, HiOutlineCloudUpload } from 'react-icons/hi';

export default function UploadImageModal({ onClose, onUpload }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      if (!name) setName(selected.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !file) return;
    setIsLoading(true);
    try {
      await onUpload(name.trim(), file);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><HiOutlineCloudUpload /> Upload Image</h2>
          <button className="modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-group">
            <input id="image-name-input" type="text" placeholder="Image name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="upload-zone" onClick={() => fileRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <HiOutlineCloudUpload className="upload-icon" />
                <p>Click to select an image</p>
                <span>JPG, PNG, GIF, WebP up to 10MB</span>
              </div>
            )}
            <input ref={fileRef} id="image-file-input" type="file" accept="image/*" onChange={handleFileChange} hidden />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="image-upload-btn" type="submit" className="btn btn-primary" disabled={isLoading || !name.trim() || !file}>
              {isLoading ? <span className="spinner" /> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
