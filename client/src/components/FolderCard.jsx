import { HiOutlineFolder, HiOutlineTrash } from 'react-icons/hi';

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FolderCard({ folder, onClick, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="card folder-card" onClick={onClick}>
      <div className="card-icon folder-icon-wrapper">
        <HiOutlineFolder />
      </div>
      <div className="card-info">
        <h3 className="card-name" title={folder.name}>{folder.name}</h3>
        <span className="card-meta">{formatSize(folder.size || 0)}</span>
      </div>
      <button
        className="card-action delete-btn"
        onClick={handleDelete}
        title="Delete folder"
      >
        <HiOutlineTrash />
      </button>
    </div>
  );
}
