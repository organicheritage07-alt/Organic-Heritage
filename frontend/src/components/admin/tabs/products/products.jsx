// src/components/admin/tabs/products/Products.jsx
console.log('✅ Products.jsx LOADED - MULTIPLE IMAGES FULL VERSION');
import { useState, useEffect } from 'react';
import { 
  FaSearch, FaTrash, FaEdit, FaPlus, FaSyncAlt, FaLeaf,
  FaTrashRestore, FaTimes, FaEye, FaToggleOn, FaToggleOff, 
  FaSave, FaImage, FaTag, FaMoneyBill, FaBoxes,
  FaExclamationTriangle, FaCheckCircle, FaListUl, FaHashtag,
  FaArrowLeft, FaCloudUploadAlt, FaMinusCircle
} from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Products.css';

const API_URL = 'http://localhost:5000/api/products';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [inactiveProducts, setInactiveProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [stats, setStats] = useState({ total: 0, inactive: 0, deleted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Capsules',
    tag: '',
    stock: 999,
    rating: 4.5,
    reviews: 0,
    highlights: [],
    healthBenefits: [],
    howToUse: '',
    whoCanUse: '',
    images: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [benefitsInput, setBenefitsInput] = useState('');

  const token = localStorage.getItem('token');

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
      setInactiveProducts(response.data.inactiveProducts || []);
      setDeletedProducts(response.data.deletedProducts || []);
      setStats(response.data.stats || { total: 0, inactive: 0, deleted: 0 });
    } catch (error) {
      console.error('Fetch products error:', error);
      Swal.fire({ title: 'Error!', text: 'Failed to fetch products', icon: 'error', confirmButtonColor: '#2D5A27' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories/all`);
      setCategories(response.data.categories || ['All']);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle main image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional images — FILES (not URLs)
  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalCount = existingImages.length + additionalImageFiles.length + files.length;
    if (totalCount > 5) {
      Swal.fire({
        title: 'Limit Exceeded',
        text: `You can only upload max 5 additional images. Currently have ${existingImages.length + additionalImageFiles.length}.`,
        icon: 'warning',
        confirmButtonColor: '#2D5A27'
      });
      return;
    }

    setAdditionalImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAdditionalImagePreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a new (not yet uploaded) additional image
  const removeNewAdditionalImage = (index) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove an existing image (already in DB)
  const removeExistingImage = async (index) => {
    if (!editingProduct) return;

    const result = await Swal.fire({
      title: 'Delete Image?',
      text: 'This image will be permanently deleted from Cloudinary.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${editingProduct._id}/images/${index}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index)
        }));

        Swal.fire({
          title: 'Deleted!',
          text: 'Image removed successfully.',
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete image',
          icon: 'error',
          confirmButtonColor: '#2D5A27'
        });
      }
    }
  };

  // Handle highlights
  const addHighlight = () => {
    if (highlightsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlightsInput.trim()]
      }));
      setHighlightsInput('');
    }
  };

  const removeHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  // Handle benefits
  const addBenefit = () => {
    if (benefitsInput.trim()) {
      setFormData(prev => ({
        ...prev,
        healthBenefits: [...prev.healthBenefits, benefitsInput.trim()]
      }));
      setBenefitsInput('');
    }
  };

  const removeBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      healthBenefits: prev.healthBenefits.filter((_, i) => i !== index)
    }));
  };

  // CREATE PRODUCT — with multiple image upload
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'highlights' || key === 'healthBenefits') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'images') {
          if (formData.images && formData.images.length > 0) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      additionalImageFiles.forEach(file => {
        formDataToSend.append('additionalImages', file);
      });

      console.log('Creating product with files:', additionalImageFiles.length, 'additional images');

      const response = await axios.post(API_URL, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Swal.fire({ 
          title: 'Success!', 
          text: 'Product created successfully', 
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 2000
        });
        setShowAddForm(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Create product error:', error);
      Swal.fire({ 
        title: 'Error!', 
        text: error.response?.data?.message || 'Failed to create product', 
        icon: 'error',
        confirmButtonColor: '#2D5A27'
      });
    } finally {
      setUploading(false);
    }
  };

  // UPDATE PRODUCT — with multiple image upload
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key === 'highlights' || key === 'healthBenefits') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'images') {
          formDataToSend.append(key, JSON.stringify(existingImages));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      additionalImageFiles.forEach(file => {
        formDataToSend.append('additionalImages', file);
      });

      console.log('Updating product. Existing images:', existingImages.length, 'New files:', additionalImageFiles.length);

      const response = await axios.put(`${API_URL}/${editingProduct._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        Swal.fire({ 
          title: 'Success!', 
          text: 'Product updated successfully', 
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 2000
        });
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Update product error:', error);
      Swal.fire({ 
        title: 'Error!', 
        text: error.response?.data?.message || 'Failed to update product', 
        icon: 'error',
        confirmButtonColor: '#2D5A27'
      });
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Capsules',
      tag: '',
      stock: 999,
      rating: 4.5,
      reviews: 0,
      highlights: [],
      healthBenefits: [],
      howToUse: '',
      whoCanUse: '',
      images: []
    });
    setImageFile(null);
    setImagePreview('');
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setExistingImages([]);
    setHighlightsInput('');
    setBenefitsInput('');
    setEditingProduct(null);
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      subtitle: product.subtitle,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      tag: product.tag || '',
      stock: product.stock || 999,
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      highlights: product.highlights || [],
      healthBenefits: product.healthBenefits || [],
      howToUse: product.howToUse || '',
      whoCanUse: product.whoCanUse || '',
      images: product.images || []
    });
    setImagePreview(product.image);
    setImageFile(null);
    setAdditionalImageFiles([]);
    setAdditionalImagePreviews([]);
    setExistingImages(product.images || []);
    setHighlightsInput('');
    setBenefitsInput('');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ title: 'No Selection', text: 'Please select products to delete', icon: 'info', confirmButtonColor: '#2D5A27' });
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Delete?',
      html: `Are you sure you want to delete <strong>${selectedIds.length}</strong> products?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete all',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Deleting...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await Promise.all(selectedIds.map(id => 
          axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        ));
        setSelectedIds([]);
        await fetchProducts();
        Swal.fire({ title: 'Deleted!', text: `${selectedIds.length} products moved to trash.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: 'Failed to delete products', icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Bulk Restore
  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ title: 'No Selection', text: 'Please select products to restore', icon: 'info', confirmButtonColor: '#2D5A27' });
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Restore?',
      html: `Are you sure you want to restore <strong>${selectedIds.length}</strong> products?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, restore all',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Restoring...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await Promise.all(selectedIds.map(id => 
          axios.put(`${API_URL}/${id}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } })
        ));
        setSelectedIds([]);
        await fetchProducts();
        Swal.fire({ title: 'Restored!', text: `${selectedIds.length} products restored.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: 'Failed to restore products', icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Soft delete
  const handleSoftDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Move to Trash?',
      html: `Move <strong>${productName}</strong> to trash?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, move to trash',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Moving...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.delete(`${API_URL}/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchProducts();
        Swal.fire({ title: 'Moved to Trash!', text: `${productName} moved to trash.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Restore product
  const handleRestoreProduct = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Restore Product?',
      html: `Restore <strong>${productName}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, restore',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Restoring...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.put(`${API_URL}/${productId}/restore`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchProducts();
        Swal.fire({ title: 'Restored!', text: `${productName} restored.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Permanently Delete?',
      html: `This cannot be undone! Delete <strong>${productName}</strong> permanently?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete permanently',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Deleting...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.delete(`${API_URL}/${productId}/permanent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchProducts();
        Swal.fire({ title: 'Deleted!', text: `${productName} permanently deleted.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Toggle active status
  const handleToggleActive = async (productId, productName, currentStatus) => {
    const action = currentStatus ? 'Deactivate' : 'Activate';
    const result = await Swal.fire({
      title: `${action} Product?`,
      html: `${action} <strong>${productName}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#DC2626' : '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Updating...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        await axios.patch(`${API_URL}/${productId}/toggle-active`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchProducts();
        Swal.fire({ 
          title: `${action}d!`, 
          text: `${productName} ${currentStatus ? 'deactivated' : 'activated'}.`, 
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 2000
        });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  // Select/Deselect product
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedProducts.map(p => p._id));
    }
  };

  // View product details
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Get filtered products
  const getFilteredProducts = () => {
    let allProducts = products;
    if (showDeleted) allProducts = deletedProducts;
    else if (showInactive) allProducts = inactiveProducts;

    let filtered = allProducts;
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    return filtered;
  };

  const displayedProducts = getFilteredProducts();

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock < 50 && p.isActive);

  // Scroll to table function
  const scrollToTable = () => {
    document.querySelector('.table-wrapper')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Filter by low stock
  const filterLowStock = () => {
    if (lowStockProducts.length === 0) return;
    setSearchTerm('');
    setCategoryFilter('All');
    setShowDeleted(false);
    setShowInactive(false);
    setSelectedIds([]);
    setTimeout(scrollToTable, 300);
  };

  return (
    <div className="products-container">
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-home">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Products Management</span>
        </div>
        <h1 className="page-title">Product Management</h1>
        <p className="page-subtitle">Manage all products, inventory and pricing</p>
      </div>

      {/* ===== FIXED STATS CARDS - USING UNIQUE CLASS NAMES ===== */}
      <div className="prod-stats-row">
        <div 
          className="prod-stat-box total" 
          onClick={() => { 
            setShowDeleted(false); 
            setShowInactive(false); 
            setSelectedIds([]);
            setSearchTerm('');
            setCategoryFilter('All');
            scrollToTable();
          }}
        >
          <div className="prod-stat-icon-wrap">
            <FaBoxes />
          </div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Total Products</span>
            <span className="prod-stat-value">{stats.total}</span>
          </div>
          <span className="prod-stat-hint">Click to view all</span>
        </div>

        <div 
          className="prod-stat-box inactive" 
          onClick={() => { 
            setShowInactive(!showInactive); 
            setShowDeleted(false); 
            setSelectedIds([]);
            setSearchTerm('');
            setCategoryFilter('All');
            if (!showInactive) scrollToTable();
          }}
        >
          <div className="prod-stat-icon-wrap" style={{ color: '#F59E0B', background: '#FEF3C7' }}>
            <FaToggleOff />
          </div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Inactive</span>
            <span className="prod-stat-value">{stats.inactive}</span>
          </div>
          {showInactive && <span className="prod-stat-badge">Viewing</span>}
          {!showInactive && <span className="prod-stat-hint">Click to view</span>}
        </div>

        <div 
          className="prod-stat-box deleted" 
          onClick={() => { 
            setShowDeleted(!showDeleted); 
            setShowInactive(false); 
            setSelectedIds([]);
            setSearchTerm('');
            setCategoryFilter('All');
            if (!showDeleted) scrollToTable();
          }}
        >
          <div className="prod-stat-icon-wrap" style={{ color: '#DC2626', background: '#FEE2E2' }}>
            <FaTrash />
          </div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Trash</span>
            <span className="prod-stat-value">{stats.deleted}</span>
          </div>
          {showDeleted && <span className="prod-stat-badge">Viewing</span>}
          {!showDeleted && <span className="prod-stat-hint">Click to view</span>}
        </div>

        <div 
          className={`prod-stat-box warning ${lowStockProducts.length > 0 ? 'has-low-stock' : ''}`}
          onClick={filterLowStock}
          style={{ cursor: lowStockProducts.length > 0 ? 'pointer' : 'default' }}
        >
          <div className="prod-stat-icon-wrap" style={{ color: lowStockProducts.length > 0 ? '#DC2626' : '#10B981', background: lowStockProducts.length > 0 ? '#FEE2E2' : '#D1FAE5' }}>
            {lowStockProducts.length > 0 ? <FaExclamationTriangle /> : <FaCheckCircle />}
          </div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Low Stock Alert</span>
            <span className="prod-stat-value" style={{ fontSize: '1.2rem' }}>
              {lowStockProducts.length > 0 ? `${lowStockProducts.length} Products` : 'All Good'}
            </span>
          </div>
          {lowStockProducts.length > 0 && (
            <span className="prod-stat-badge low-stock-badge">⚠️ View</span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar-left">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, subtitle..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="action-bar-right">
          <button className="btn-refresh" onClick={fetchProducts}>
            <FaSyncAlt /> Refresh
          </button>

          {selectedIds.length > 0 && (
            <>
              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <FaTrash /> Delete ({selectedIds.length})
              </button>
              {showDeleted && (
                <button className="btn-bulk-restore" onClick={handleBulkRestore}>
                  <FaTrashRestore /> Restore ({selectedIds.length})
                </button>
              )}
            </>
          )}

          {showDeleted && (
            <button className="btn-back" onClick={() => { setShowDeleted(false); setShowInactive(false); setSelectedIds([]); }}>
              <FaTimes /> Active Products
            </button>
          )}
          {showInactive && (
            <button className="btn-back" onClick={() => { setShowInactive(false); setShowDeleted(false); setSelectedIds([]); }}>
              <FaTimes /> Active Products
            </button>
          )}
          <button className="btn-add" onClick={() => { setShowAddForm(true); resetForm(); }}>
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="product-form-container">
          <div className="form-header">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <button className="form-close" onClick={() => { setShowAddForm(false); resetForm(); }}>
              <FaTimes />
            </button>
          </div>
          <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Ashwagandha"
                />
              </div>
              <div className="form-group">
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

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows="3"
                placeholder="Describe your product..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (Rs) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  min="0"
                  placeholder="e.g. 1000"
                />
              </div>
              <div className="form-group">
                <label>Original Price (Rs) *</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  required
                  min="0"
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="Capsules">Capsules</option>
                  <option value="Powder">Powder</option>
                  <option value="Liquid">Liquid</option>
                  <option value="Tablets">Tablets</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tag</label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                >
                  <option value="">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Popular">Popular</option>
                  <option value="Hot">Hot</option>
                  <option value="Top Rated">Top Rated</option>
                  <option value="New">New</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Rating (0-5)</label>
                <input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            {/* Main Product Image */}
            <div className="form-group">
              <label>Product Main Image *</label>
              <div className="image-upload-area">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Product" />
                    <button type="button" className="remove-image" onClick={() => { setImagePreview(''); setImageFile(null); }}>
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <FaImage size={40} />
                    <p>Click to upload main image</p>
                    <span>PNG, JPG, JPEG (Max 5MB)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="image-input"
                />
              </div>
            </div>

            {/* BULLET POINT SYSTEM */}
            <div className="form-section">
              <h4>
                <FaListUl style={{ marginRight: '10px', color: '#2D5A27' }} />
                Product Details (For Product Detail Page)
              </h4>
              <p className="section-hint">Add information using bullet points for better readability</p>

              {/* Highlights - Bullet Points */}
              <div className="form-group bullet-group">
                <label>
                  <span className="label-icon">📌</span> Product Highlights
                  <span className="label-hint">Add key features as bullet points (Why to use?)</span>
                </label>
                <div className="bullet-input-group">
                  <input
                    type="text"
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    placeholder="Type highlight and press Enter or click Add"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                    className="bullet-input"
                  />
                  <button type="button" onClick={addHighlight} className="btn-bullet-add">
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="bullet-list">
                  {formData.highlights.length === 0 ? (
                    <div className="bullet-empty">
                      <FaHashtag /> No highlights added yet
                    </div>
                  ) : (
                    formData.highlights.map((item, index) => (
                      <div key={index} className="bullet-item highlight-bullet">
                        <span className="bullet-icon">●</span>
                        <span className="bullet-text">{item}</span>
                        <button type="button" onClick={() => removeHighlight(index)} className="bullet-remove">
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Health Benefits - Bullet Points */}
              <div className="form-group bullet-group">
                <label>
                  <span className="label-icon">💚</span> Health Benefits
                  <span className="label-hint">Add health benefits as bullet points</span>
                </label>
                <div className="bullet-input-group">
                  <input
                    type="text"
                    value={benefitsInput}
                    onChange={(e) => setBenefitsInput(e.target.value)}
                    placeholder="Type benefit and press Enter or click Add"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    className="bullet-input"
                  />
                  <button type="button" onClick={addBenefit} className="btn-bullet-add benefit-btn">
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="bullet-list">
                  {formData.healthBenefits.length === 0 ? (
                    <div className="bullet-empty">
                      <FaHashtag /> No health benefits added yet
                    </div>
                  ) : (
                    formData.healthBenefits.map((item, index) => (
                      <div key={index} className="bullet-item benefit-bullet">
                        <span className="bullet-icon">◆</span>
                        <span className="bullet-text">{item}</span>
                        <button type="button" onClick={() => removeBenefit(index)} className="bullet-remove">
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* How to Use - Paragraph */}
              <div className="form-group paragraph-group">
                <label>
                  <span className="label-icon">📖</span> How to Use
                  <span className="label-hint">Write detailed usage instructions (Paragraph style)</span>
                </label>
                <div className="paragraph-wrapper">
                  <textarea
                    value={formData.howToUse}
                    onChange={(e) => setFormData({...formData, howToUse: e.target.value})}
                    rows="3"
                    placeholder="Write detailed instructions on how to use this product..."
                    className="paragraph-textarea"
                  />
                  <div className="paragraph-helper">
                    <span>💡 Tip: Write clear, step-by-step instructions for best results.</span>
                  </div>
                </div>
              </div>

              {/* Who Can Use - Paragraph */}
              <div className="form-group paragraph-group">
                <label>
                  <span className="label-icon">👤</span> Who Can Use
                  <span className="label-hint">Describe the target audience (Paragraph style)</span>
                </label>
                <div className="paragraph-wrapper">
                  <textarea
                    value={formData.whoCanUse}
                    onChange={(e) => setFormData({...formData, whoCanUse: e.target.value})}
                    rows="2"
                    placeholder="Describe who can use this product..."
                    className="paragraph-textarea"
                  />
                  <div className="paragraph-helper">
                    <span>💡 Tip: Mention age groups, health conditions, or specific needs.</span>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL IMAGES SECTION */}
              <div className="form-group">
                <label>
                  <span className="label-icon">🖼️</span> Additional Product Images
                  <span className="label-hint">
                    Upload multiple images for product gallery 
                    (Max 5 images total — {existingImages.length + additionalImageFiles.length}/5 used)
                  </span>
                </label>

                {(existingImages.length + additionalImageFiles.length) < 5 && (
                  <div className="image-upload-area multiple">
                    <div className="upload-placeholder">
                      <FaCloudUploadAlt size={40} />
                      <p>Click or drag to upload images</p>
                      <span>PNG, JPG, JPEG, WEBP (Max 5MB each)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImages}
                      className="image-input"
                    />
                  </div>
                )}

                {existingImages.length > 0 && (
                  <div className="additional-images-section">
                    <p className="images-section-title">
                      <FaImage /> Saved Images (Click × to remove)
                    </p>
                    <div className="additional-images-preview">
                      {existingImages.map((imgUrl, index) => (
                        <div key={`existing-${index}`} className="additional-image-item saved">
                          <img src={imgUrl} alt={`Additional ${index + 1}`} />
                          <div className="image-overlay">
                            <span className="image-tag">Saved</span>
                          </div>
                          <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={() => removeExistingImage(index)}
                            title="Delete from Cloudinary"
                          >
                            <FaMinusCircle />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {additionalImagePreviews.length > 0 && (
                  <div className="additional-images-section">
                    <p className="images-section-title">
                      <FaCloudUploadAlt /> New Images (Will be uploaded on save)
                    </p>
                    <div className="additional-images-preview">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="additional-image-item new">
                          <img src={preview} alt={`New ${index + 1}`} />
                          <div className="image-overlay">
                            <span className="image-tag new-tag">New</span>
                          </div>
                          <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={() => removeNewAdditionalImage(index)}
                            title="Remove"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {existingImages.length === 0 && additionalImagePreviews.length === 0 && (
                  <div className="no-images-placeholder">
                    <FaImage size={32} style={{ opacity: 0.3 }} />
                    <p>No additional images yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={uploading}>
                {uploading ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Create Product')}
                {!uploading && <FaSave />}
              </button>
              <button type="button" className="btn-cancel" onClick={() => { setShowAddForm(false); resetForm(); }}>
                <FaArrowLeft /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === displayedProducts.length && displayedProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <FaLeaf size={48} />
                    <h3>No products found</h3>
                    <p>Try adjusting your search or add a new product</p>
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p, index) => (
                  <tr key={p._id} className={p.stock < 50 && p.isActive ? 'low-stock' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>
                      <div className="product-info" onClick={() => viewProductDetails(p)}>
                        <img src={p.image} alt={p.name} className="product-thumbnail" />
                        <div className="product-details">
                          <span className="product-name">{p.name}</span>
                          <span className="product-subtitle">{p.subtitle}</span>
                          {p.images && p.images.length > 0 && (
                            <span className="image-count">🖼️ {p.images.length} gallery images</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="category-badge">{p.category}</span></td>
                    <td>Rs {p.price}</td>
                    <td>{p.discount || 0}%</td>
                    <td>
                      <span className={`stock-badge ${p.stock < 50 ? 'low' : 'normal'}`}>
                        {p.stock || 0}
                      </span>
                    </td>
                    <td>
                      {!p.isDeleted ? (
                        <span className={`status-badge ${p.isActive ? 'active' : 'inactive'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      ) : (
                        <span className="status-badge deleted">Deleted</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => viewProductDetails(p)} title="View Details">
                          <FaEye />
                        </button>
                        {!p.isDeleted && (
                          <>
                            <button className="action-btn edit" onClick={() => handleEdit(p)} title="Edit">
                              <FaEdit />
                            </button>
                            <button 
                              className={`action-btn ${p.isActive ? 'deactivate' : 'activate'}`} 
                              onClick={() => handleToggleActive(p._id, p.name, p.isActive)}
                              title={p.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {p.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button className="action-btn delete" onClick={() => handleSoftDelete(p._id, p.name)} title="Move to Trash">
                              <FaTrash />
                            </button>
                          </>
                        )}
                        {p.isDeleted && (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestoreProduct(p._id, p.name)} title="Restore">
                              <FaTrashRestore />
                            </button>
                            <button className="action-btn permanent" onClick={() => handlePermanentDelete(p._id, p.name)} title="Permanent Delete">
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="product-profile">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="product-modal-image" />
                <div className="product-profile-info">
                  <h4>{selectedProduct.name}</h4>
                  <span className="category-badge">{selectedProduct.category}</span>
                  {selectedProduct.tag && (
                    <span className="tag-badge" style={{
                      background: selectedProduct.tag === 'Bestseller' ? '#1B2E1A' : 
                                   selectedProduct.tag === 'Hot' ? '#DC2626' :
                                   selectedProduct.tag === 'New' ? '#2D6A4F' : '#C4943A'
                    }}>
                      {selectedProduct.tag}
                    </span>
                  )}
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="modal-gallery-section">
                  <label><FaImage /> Gallery Images ({selectedProduct.images.length})</label>
                  <div className="modal-gallery">
                    {selectedProduct.images.map((img, i) => (
                      <div key={i} className="modal-gallery-item">
                        <img src={img} alt={`Gallery ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-details-list">
                <div className="detail-row">
                  <FaMoneyBill className="detail-icon" />
                  <div>
                    <label>Price</label>
                    <p>Rs {selectedProduct.price} <span className="original-price">(Original: Rs {selectedProduct.originalPrice})</span></p>
                  </div>
                </div>
                <div className="detail-row">
                  <FaTag className="detail-icon" />
                  <div>
                    <label>Discount</label>
                    <p>{selectedProduct.discount || 0}% off</p>
                  </div>
                </div>
                <div className="detail-row">
                  <FaBoxes className="detail-icon" />
                  <div>
                    <label>Stock</label>
                    <p>{selectedProduct.stock || 0} units</p>
                  </div>
                </div>
                <div className="detail-row">
                  <FaEye className="detail-icon" />
                  <div>
                    <label>Status</label>
                    <p>
                      <span className={`status-badge ${selectedProduct.isActive ? 'active' : 'inactive'}`}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {selectedProduct.isDeleted && (
                        <span className="status-badge deleted">Deleted</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="detail-row full">
                  <div>
                    <label>Description</label>
                    <p>{selectedProduct.description}</p>
                  </div>
                </div>
                {selectedProduct.highlights && selectedProduct.highlights.length > 0 && (
                  <div className="detail-row full">
                    <div>
                      <label>Highlights</label>
                      <ul className="modal-tag-list">
                        {selectedProduct.highlights.map((item, i) => (
                          <li key={i}>● {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {selectedProduct.healthBenefits && selectedProduct.healthBenefits.length > 0 && (
                  <div className="detail-row full">
                    <div>
                      <label>Health Benefits</label>
                      <ul className="modal-tag-list health">
                        {selectedProduct.healthBenefits.map((item, i) => (
                          <li key={i}>◆ {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {selectedProduct.howToUse && (
                  <div className="detail-row full">
                    <div>
                      <label>How to Use</label>
                      <p>{selectedProduct.howToUse}</p>
                    </div>
                  </div>
                )}
                {selectedProduct.whoCanUse && (
                  <div className="detail-row full">
                    <div>
                      <label>Who Can Use</label>
                      <p>{selectedProduct.whoCanUse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
