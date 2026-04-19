import { useEffect } from 'react';
import { HiOutlineX, HiOutlineDownload } from 'react-icons/hi';

export default function ImageLightbox({ image, onClose }) {
  const imageUrl = image.path;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <h3 className="lightbox-title">{image.name}</h3>
          <div className="lightbox-actions">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="lightbox-btn"
              title="Open in new tab"
            >
              <HiOutlineDownload />
            </a>
            <button className="lightbox-btn" onClick={onClose} title="Close">
              <HiOutlineX />
            </button>
          </div>
        </div>
        <div className="lightbox-image-wrapper">
          <img src={imageUrl} alt={image.name} />
        </div>
      </div>
    </div>
  );
}
