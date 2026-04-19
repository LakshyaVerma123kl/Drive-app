import { HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ImageCard({ image, onDelete, onView }) {
 const imageUrl = image.path;

  return (
    <div className="card image-card">
      <div className="image-preview" onClick={onView} style={{ cursor: 'pointer' }}>
        <img src={imageUrl} alt={image.name} loading="lazy" />
        <div className="image-preview-overlay">
          <HiOutlineEye />
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-name" title={image.name}>{image.name}</h3>
        <span className="card-meta">{formatSize(image.size)}</span>
      </div>
      <button
        className="card-action delete-btn"
        onClick={onDelete}
        title="Delete image"
      >
        <HiOutlineTrash />
      </button>
    </div>
  );
}
