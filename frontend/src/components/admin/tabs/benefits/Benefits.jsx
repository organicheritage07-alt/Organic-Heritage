console.log('✅ Benefits.jsx LOADED - Admin Benefits Management with Image Upload');
import { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, 
  FaTimes, FaSave, FaImage, FaListUl, FaEye,
  FaArrowLeft, FaSyncAlt, FaCloudUploadAlt, FaMinusCircle
} from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Benefits.css';

const API_URL = 'http://localhost:5000/api/benefits';

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    shortHighlight: '',
    accentColor: '#2D6A4F',
    benefits: [],
    ctaText: '',
    order: 0,
    isActive: true
  });
  const [benefitInput, setBenefitInput] = useState('');
  const token = localStorage.getItem('token');

  const fetchBenefits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBenefits(response.data.benefits);
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
      Swal.fire({ title: 'Error!', text: 'Failed to fetch benefits', icon: 'error', confirmButtonColor: '#2D6A4F' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      shortHighlight: '',
      accentColor: '#2D6A4F',
      benefits: [],
      ctaText: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
    setBenefitInput('');
    setEditingBenefit(null);
    setShowForm(false);
    setUploading(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'File Too Large',
          text: 'Image size should be less than 5MB',
          icon: 'warning',
          confirmButtonColor: '#2D6A4F'
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      name: benefit.name,
      subtitle: benefit.subtitle,
      shortHighlight: benefit.shortHighlight,
      accentColor: benefit.accentColor || '#2D6A4F',
      benefits: benefit.benefits || [],
      ctaText: benefit.ctaText || `Discover ${benefit.name}`,
      order: benefit.order || 0,
      isActive: benefit.isActive
    });
    setImagePreview(benefit.image);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput('');
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate image
    if (!editingBenefit && !imageFile) {
      Swal.fire({
        title: 'Image Required',
        text: 'Please upload an image for the benefit',
        icon: 'warning',
        confirmButtonColor: '#2D6A4F'
      });
      return;
    }

    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'benefits') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image file
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingBenefit ? `${API_URL}/${editingBenefit._id}` : API_URL;
      const method = editingBenefit ? 'put' : 'post';
      
      const response = await axios[method](url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: `Benefit ${editingBenefit ? 'updated' : 'created'} successfully`,
          icon: 'success',
          confirmButtonColor: '#2D6A4F',
          timer: 2000
        });
        resetForm();
        fetchBenefits();
      }
    } catch (error) {
      console.error('Error saving benefit:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to save benefit',
        icon: 'error',
        confirmButtonColor: '#2D6A4F'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (benefit) => {
    const result = await Swal.fire({
      title: 'Delete Benefit?',
      text: `Delete "${benefit.name}" permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${benefit._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({ title: 'Deleted!', text: 'Benefit deleted', icon: 'success', confirmButtonColor: '#2D6A4F', timer: 1500 });
        fetchBenefits();
      } catch (error) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#2D6A4F' });
      }
    }
  };

  const handleToggleActive = async (benefit) => {
    try {
      await axios.patch(`${API_URL}/${benefit._id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBenefits();
    } catch (error) {
      Swal.fire({ title: 'Error!', text: 'Failed to toggle status', icon: 'error', confirmButtonColor: '#2D6A4F' });
    }
  };

  return (
    <div className="benefits-admin-container">
      <div className="benefits-page-header">
        <h1 className="benefits-page-title">Benefits Management</h1>
        <p className="benefits-page-subtitle">Manage product benefits displayed on the landing page</p>
      </div>

      {/* Stats */}
      <div className="benefits-stats-grid">
        <div className="benefits-stat-card total">
          <div className="benefits-stat-card-left">
            <div className="benefits-stat-icon"><FaListUl /></div>
            <div className="benefits-stat-info">
              <span className="benefits-stat-label">Total Benefits</span>
              <span className="benefits-stat-value">{benefits.length}</span>
            </div>
          </div>
        </div>
        <div className="benefits-stat-card active">
          <div className="benefits-stat-card-left">
            <div className="benefits-stat-icon"><FaToggleOn /></div>
            <div className="benefits-stat-info">
              <span className="benefits-stat-label">Active</span>
              <span className="benefits-stat-value">{benefits.filter(b => b.isActive).length}</span>
            </div>
          </div>
        </div>
        <div className="benefits-stat-card inactive">
          <div className="benefits-stat-card-left">
            <div className="benefits-stat-icon"><FaToggleOff /></div>
            <div className="benefits-stat-info">
              <span className="benefits-stat-label">Inactive</span>
              <span className="benefits-stat-value">{benefits.filter(b => !b.isActive).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="benefits-action-bar">
        <div className="benefits-action-bar-left">
          <button className="benefits-btn-refresh" onClick={fetchBenefits}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
        <div className="benefits-action-bar-right">
          <button className="benefits-btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            <FaPlus /> Add Benefit
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="benefits-form-container">
          <div className="benefits-form-header">
            <h3>{editingBenefit ? 'Edit Benefit' : 'Add New Benefit'}</h3>
            <button className="benefits-form-close" onClick={resetForm}>
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="benefits-form-row">
              <div className="benefits-form-group">
                <label>Benefit Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Ashwagandha"
                />
              </div>
              <div className="benefits-form-group">
                <label>Subtitle *</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  required
                  placeholder="e.g. Stress Relief Capsules"
                />
              </div>
            </div>

            <div className="benefits-form-row">
              <div className="benefits-form-group">
                <label>Short Highlight *</label>
                <input
                  type="text"
                  value={formData.shortHighlight}
                  onChange={(e) => setFormData({...formData, shortHighlight: e.target.value})}
                  required
                  placeholder="e.g. Natural Stress Reliever"
                />
              </div>
              <div className="benefits-form-group">
                <label>CTA Text</label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  placeholder="e.g. Discover Ashwagandha"
                />
              </div>
            </div>

            <div className="benefits-form-row">
              <div className="benefits-form-group">
                <label>Accent Color *</label>
                <div className="benefits-color-picker-wrapper">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
                    className="benefits-color-picker"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({...formData, accentColor: e.target.value})}
                    placeholder="#2D6A4F"
                    className="benefits-color-input"
                  />
                </div>
              </div>
              <div className="benefits-form-group">
                <label>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="Display order (lower number = first)"
                />
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="benefits-form-group">
              <label>Product Image *</label>
              <div className="benefits-image-upload-area">
                {imagePreview ? (
                  <div className="benefits-image-preview">
                    <img src={imagePreview} alt="Benefit" />
                    <button 
                      type="button" 
                      className="benefits-remove-image" 
                      onClick={() => { setImagePreview(''); setImageFile(null); }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="benefits-upload-placeholder">
                    <FaCloudUploadAlt size={40} />
                    <p>Click to upload image</p>
                    <span>PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="benefits-image-input"
                />
              </div>
            </div>

            <div className="benefits-form-group">
              <label>Benefits List</label>
              <div className="benefits-bullet-input-group">
                <input
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  placeholder="Type benefit and press Enter or click Add"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  className="benefits-bullet-input"
                />
                <button type="button" onClick={addBenefit} className="benefits-btn-bullet-add">
                  <FaPlus /> Add
                </button>
              </div>
              <div className="benefits-bullet-list">
                {formData.benefits.length === 0 ? (
                  <div className="benefits-bullet-empty">No benefits added yet</div>
                ) : (
                  formData.benefits.map((item, index) => (
                    <div key={index} className="benefits-bullet-item">
                      <span className="benefits-bullet-text">{item}</span>
                      <button type="button" onClick={() => removeBenefit(index)} className="benefits-bullet-remove">
                        <FaTimes />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="benefits-form-group">
              <label className="benefits-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                Active (visible on landing page)
              </label>
            </div>

            <div className="benefits-form-actions">
              <button type="submit" className="benefits-btn-submit" disabled={uploading}>
                {uploading ? 'Uploading...' : (
                  <>
                    <FaSave /> {editingBenefit ? 'Update Benefit' : 'Create Benefit'}
                  </>
                )}
              </button>
              <button type="button" className="benefits-btn-cancel" onClick={resetForm}>
                <FaArrowLeft /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Benefits Table */}
      {loading ? (
        <div className="benefits-loading-state">
          <div className="benefits-spinner"></div>
          <p>Loading benefits...</p>
        </div>
      ) : (
        <div className="benefits-table-wrapper">
          <table className="benefits-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Highlight</th>
                <th>Color</th>
                <th>Benefits</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {benefits.length === 0 ? (
                <tr>
                  <td colSpan="9" className="benefits-empty-state">
                    <FaImage size={48} />
                    <h3>No benefits added yet</h3>
                    <p>Click "Add Benefit" to create your first benefit</p>
                  </td>
                </tr>
              ) : (
                benefits.map((benefit, index) => (
                  <tr key={benefit._id}>
                    <td>{index + 1}</td>
                    <td>
                      <img src={benefit.image} alt={benefit.name} className="benefits-thumbnail" />
                    </td>
                    <td>
                      <div className="benefits-name">
                        <strong>{benefit.name}</strong>
                        <span className="benefits-subtitle">{benefit.subtitle}</span>
                      </div>
                    </td>
                    <td>{benefit.shortHighlight}</td>
                    <td>
                      <div className="benefits-color-preview" style={{ backgroundColor: benefit.accentColor || '#2D6A4F' }}>
                        {benefit.accentColor || '#2D6A4F'}
                      </div>
                    </td>
                    <td>
                      <span className="benefits-count">{benefit.benefits?.length || 0}</span>
                    </td>
                    <td>
                      <span className={`benefits-status-badge ${benefit.isActive ? 'active' : 'inactive'}`}>
                        {benefit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{benefit.order || 0}</td>
                    <td>
                      <div className="benefits-action-buttons">
                        <button className="benefits-action-btn edit" onClick={() => handleEdit(benefit)} title="Edit">
                          <FaEdit />
                        </button>
                        <button 
                          className={`benefits-action-btn ${benefit.isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleActive(benefit)}
                          title={benefit.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {benefit.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button className="benefits-action-btn delete" onClick={() => handleDelete(benefit)} title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Benefits;