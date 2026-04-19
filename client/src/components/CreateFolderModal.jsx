import { useState } from 'react';
import { HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi';

export default function CreateFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onCreate(name.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><HiOutlinePhotograph /> New Folder</h2>
          <button className="modal-close" onClick={onClose}><HiOutlineX /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-group">
            <input id="folder-name-input" type="text" placeholder="Folder name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="folder-create-btn" type="submit" className="btn btn-primary" disabled={isLoading || !name.trim()}>{isLoading ? <span className="spinner" /> : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
