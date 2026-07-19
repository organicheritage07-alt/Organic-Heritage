// Ingredients.jsx - Admin Management
console.log('✅ Ingredients.jsx LOADED');
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, 
    FaTimes, FaSave, FaImage, FaListUl, FaArrowLeft,
    FaSyncAlt, FaCloudUploadAlt
} from 'react-icons/fa';
import './ingredients.css';

const API_URL = 'http://localhost:5000/api/ingredients';

const Ingredients = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        tag: '',
        detail: '',
        productRelation: '',
        color: '#2D6A4F',
        order: 0,
        isActive: true
    });
    const token = localStorage.getItem('token');

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setIngredients(response.data.ingredients);
            }
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            Swal.fire({ title: 'Error!', text: 'Failed to fetch ingredients', icon: 'error', confirmButtonColor: '#2D6A4F' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            tag: '',
            detail: '',
            productRelation: '',
            color: '#2D6A4F',
            order: 0,
            isActive: true
        });
        setImageFile(null);
        setImagePreview('');
        setEditingIngredient(null);
        setShowForm(false);
        setUploading(false);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({ title: 'File Too Large', text: 'Image should be less than 5MB', icon: 'warning', confirmButtonColor: '#2D6A4F' });
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => setImagePreview(event.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (ingredient) => {
        setEditingIngredient(ingredient);
        setFormData({
            name: ingredient.name,
            tag: ingredient.tag,
            detail: ingredient.detail,
            productRelation: ingredient.productRelation,
            color: ingredient.color || '#2D6A4F',
            order: ingredient.order || 0,
            isActive: ingredient.isActive
        });
        setImagePreview(ingredient.image);
        setImageFile(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingIngredient && !imageFile) {
            Swal.fire({ title: 'Image Required', text: 'Please upload an image', icon: 'warning', confirmButtonColor: '#2D6A4F' });
            return;
        }

        setUploading(true);
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
            if (imageFile) formDataToSend.append('image', imageFile);

            const url = editingIngredient ? `${API_URL}/${editingIngredient._id}` : API_URL;
            const method = editingIngredient ? 'put' : 'post';
            
            const response = await axios[method](url, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                Swal.fire({ title: 'Success!', text: `Ingredient ${editingIngredient ? 'updated' : 'created'}`, icon: 'success', confirmButtonColor: '#2D6A4F', timer: 2000 });
                resetForm();
                fetchIngredients();
            }
        } catch (error) {
            console.error('Error saving ingredient:', error);
            Swal.fire({ title: 'Error!', text: error.response?.data?.message || 'Failed to save', icon: 'error', confirmButtonColor: '#2D6A4F' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (ingredient) => {
        const result = await Swal.fire({
            title: 'Delete Ingredient?',
            text: `Delete "${ingredient.name}" permanently?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${ingredient._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({ title: 'Deleted!', icon: 'success', confirmButtonColor: '#2D6A4F', timer: 1500 });
                fetchIngredients();
            } catch (error) {
                Swal.fire({ title: 'Error!', text: 'Failed to delete', icon: 'error', confirmButtonColor: '#2D6A4F' });
            }
        }
    };

    const handleToggleActive = async (ingredient) => {
        try {
            await axios.patch(`${API_URL}/${ingredient._id}/toggle-active`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchIngredients();
        } catch (error) {
            Swal.fire({ title: 'Error!', text: 'Failed to toggle status', icon: 'error', confirmButtonColor: '#2D6A4F' });
        }
    };

    return (
        <div className="ingredients-admin-container">
            <div className="ingredients-page-header">
                <h1 className="ingredients-page-title">Ingredients Management</h1>
                <p className="ingredients-page-subtitle">Manage ingredients displayed on the landing page</p>
            </div>

            {/* Stats */}
            <div className="ingredients-stats-grid">
                <div className="ingredients-stat-card total">
                    <div className="ingredients-stat-card-left">
                        <div className="ingredients-stat-icon"><FaListUl /></div>
                        <div className="ingredients-stat-info">
                            <span className="ingredients-stat-label">Total</span>
                            <span className="ingredients-stat-value">{ingredients.length}</span>
                        </div>
                    </div>
                </div>
                <div className="ingredients-stat-card active">
                    <div className="ingredients-stat-card-left">
                        <div className="ingredients-stat-icon"><FaToggleOn /></div>
                        <div className="ingredients-stat-info">
                            <span className="ingredients-stat-label">Active</span>
                            <span className="ingredients-stat-value">{ingredients.filter(i => i.isActive).length}</span>
                        </div>
                    </div>
                </div>
                <div className="ingredients-stat-card inactive">
                    <div className="ingredients-stat-card-left">
                        <div className="ingredients-stat-icon"><FaToggleOff /></div>
                        <div className="ingredients-stat-info">
                            <span className="ingredients-stat-label">Inactive</span>
                            <span className="ingredients-stat-value">{ingredients.filter(i => !i.isActive).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="ingredients-action-bar">
                <div className="ingredients-action-bar-left">
                    <button className="ingredients-btn-refresh" onClick={fetchIngredients}>
                        <FaSyncAlt /> Refresh
                    </button>
                </div>
                <div className="ingredients-action-bar-right">
                    <button className="ingredients-btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
                        <FaPlus /> Add Ingredient
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="ingredients-form-container">
                    <div className="ingredients-form-header">
                        <h3>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
                        <button className="ingredients-form-close" onClick={resetForm}>
                            <FaTimes />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="ingredients-form-row">
                            <div className="ingredients-form-group">
                                <label>Ingredient Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="e.g. Moringa Leaf"
                                />
                            </div>
                            <div className="ingredients-form-group">
                                <label>Tag *</label>
                                <input
                                    type="text"
                                    value={formData.tag}
                                    onChange={(e) => setFormData({...formData, tag: e.target.value})}
                                    required
                                    placeholder="e.g. RAW SUPERFOOD"
                                />
                            </div>
                        </div>

                        <div className="ingredients-form-group">
                            <label>Detail Description *</label>
                            <textarea
                                value={formData.detail}
                                onChange={(e) => setFormData({...formData, detail: e.target.value})}
                                required
                                rows="3"
                                placeholder="Detailed description of the ingredient..."
                            />
                        </div>

                        <div className="ingredients-form-group">
                            <label>Product Relation *</label>
                            <input
                                type="text"
                                value={formData.productRelation}
                                onChange={(e) => setFormData({...formData, productRelation: e.target.value})}
                                required
                                placeholder="e.g. Used in Moringa Powder & Capsules"
                            />
                        </div>

                        <div className="ingredients-form-row">
                            <div className="ingredients-form-group">
                                <label>Accent Color</label>
                                <div className="ingredients-color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                                        className="ingredients-color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                                        placeholder="#2D6A4F"
                                        className="ingredients-color-input"
                                    />
                                </div>
                            </div>
                            <div className="ingredients-form-group">
                                <label>Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                    min="0"
                                    placeholder="Display order"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="ingredients-form-group">
                            <label>Ingredient Image *</label>
                            <div className="ingredients-image-upload-area">
                                {imagePreview ? (
                                    <div className="ingredients-image-preview">
                                        <img src={imagePreview} alt="Ingredient" />
                                        <button type="button" className="ingredients-remove-image" onClick={() => { setImagePreview(''); setImageFile(null); }}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="ingredients-upload-placeholder">
                                        <FaCloudUploadAlt size={40} />
                                        <p>Click to upload image</p>
                                        <span>PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageSelect} className="ingredients-image-input" />
                            </div>
                        </div>

                        <div className="ingredients-form-group">
                            <label className="ingredients-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                />
                                Active (visible on landing page)
                            </label>
                        </div>

                        <div className="ingredients-form-actions">
                            <button type="submit" className="ingredients-btn-submit" disabled={uploading}>
                                {uploading ? 'Uploading...' : <><FaSave /> {editingIngredient ? 'Update Ingredient' : 'Create Ingredient'}</>}
                            </button>
                            <button type="button" className="ingredients-btn-cancel" onClick={resetForm}>
                                <FaArrowLeft /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="ingredients-loading-state">
                    <div className="ingredients-spinner"></div>
                    <p>Loading ingredients...</p>
                </div>
            ) : (
                <div className="ingredients-table-wrapper">
                    <table className="ingredients-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Tag</th>
                                <th>Relation</th>
                                <th>Status</th>
                                <th>Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="ingredients-empty-state">
                                        <FaImage size={48} />
                                        <h3>No ingredients added yet</h3>
                                        <p>Click "Add Ingredient" to create your first ingredient</p>
                                    </td>
                                </tr>
                            ) : (
                                ingredients.map((ingredient, index) => (
                                    <tr key={ingredient._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <img src={ingredient.image} alt={ingredient.name} className="ingredients-thumbnail" />
                                        </td>
                                        <td>
                                            <div className="ingredients-name">
                                                <strong>{ingredient.name}</strong>
                                                <span className="ingredients-subtitle">{ingredient.tag}</span>
                                            </div>
                                        </td>
                                        <td>{ingredient.tag}</td>
                                        <td className="ingredients-relation">{ingredient.productRelation}</td>
                                        <td>
                                            <span className={`ingredients-status-badge ${ingredient.isActive ? 'active' : 'inactive'}`}>
                                                {ingredient.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{ingredient.order || 0}</td>
                                        <td>
                                            <div className="ingredients-action-buttons">
                                                <button className="ingredients-action-btn edit" onClick={() => handleEdit(ingredient)} title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className={`ingredients-action-btn ${ingredient.isActive ? 'deactivate' : 'activate'}`}
                                                    onClick={() => handleToggleActive(ingredient)}
                                                    title={ingredient.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {ingredient.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button className="ingredients-action-btn delete" onClick={() => handleDelete(ingredient)} title="Delete">
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

export default Ingredients;