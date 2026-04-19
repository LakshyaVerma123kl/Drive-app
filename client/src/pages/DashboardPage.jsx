import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import ImageLightbox from '../components/ImageLightbox';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';
import { HiOutlineFolderAdd, HiOutlinePhotograph, HiOutlineFolder } from 'react-icons/hi';

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolder = searchParams.get('folder') || null;

  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const folderParams = currentFolder ? `?parent=${currentFolder}` : '';
      const foldersRes = await api.get(`/folders${folderParams}`);
      setFolders(foldersRes.data);

      if (currentFolder) {
        const [imagesRes, pathRes] = await Promise.all([
          api.get(`/images?folder=${currentFolder}`),
          api.get(`/folders/${currentFolder}/path`),
        ]);
        setImages(imagesRes.data);
        setBreadcrumb(pathRes.data);
      } else {
        setImages([]);
        setBreadcrumb([]);
      }
    } catch (error) {
      toast.error('Error loading data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigateToFolder = (folderId) => {
    if (folderId) {
      setSearchParams({ folder: folderId });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      await api.post('/folders', { name, parent: currentFolder });
      toast.success('Folder created!');
      setShowFolderModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating folder');
    }
  };

  const handleUploadImage = async (name, file) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', file);
      formData.append('folderId', currentFolder);

      await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Image uploaded!');
      setShowUploadModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading image');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Delete this folder and all its contents?')) return;
    try {
      await api.delete(`/folders/${folderId}`);
      toast.success('Folder deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting folder');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/images/${imageId}`);
      toast.success('Image deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <Breadcrumb items={breadcrumb} onNavigate={navigateToFolder} />

          <div className="toolbar-actions">
            <button
              id="btn-new-folder"
              className="btn btn-secondary"
              onClick={() => setShowFolderModal(true)}
            >
              <HiOutlineFolderAdd />
              <span>New Folder</span>
            </button>

            {currentFolder && (
              <button
                id="btn-upload-image"
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <HiOutlinePhotograph />
                <span>Upload Image</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner large" />
            <p>Loading...</p>
          </div>
        ) : folders.length === 0 && images.length === 0 ? (
          <div className="empty-state">
            <HiOutlineFolder className="empty-icon" />
            <h3>This folder is empty</h3>
            <p>
              {currentFolder
                ? 'Create a folder or upload images to get started'
                : 'Create your first folder to get started'}
            </p>
          </div>
        ) : (
          <div className="dashboard-content">
            {folders.length > 0 && (
              <section className="content-section">
                <h2 className="section-title">Folders</h2>
                <div className="items-grid">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onClick={() => navigateToFolder(folder._id)}
                      onDelete={() => handleDeleteFolder(folder._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {images.length > 0 && (
              <section className="content-section">
                <h2 className="section-title">Images</h2>
                <div className="items-grid">
                  {images.map((image) => (
                    <ImageCard
                      key={image._id}
                      image={image}
                      onDelete={() => handleDeleteImage(image._id)}
                      onView={() => setLightboxImage(image)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {showFolderModal && (
        <CreateFolderModal
          onClose={() => setShowFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {showUploadModal && (
        <UploadImageModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadImage}
        />
      )}

      {lightboxImage && (
        <ImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
