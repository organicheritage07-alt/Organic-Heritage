import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaBox, FaEye, FaClock, FaCheckCircle, FaTruck, 
  FaSearch, FaSyncAlt, FaFilter, FaDownload,
  FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaMoneyBillWave, FaCreditCard, FaCalendarAlt,
  FaArrowLeft, FaArrowRight, FaPrint, FaLeaf,
  FaShoppingBag, FaHashtag, FaRupeeSign, FaStickyNote,
  FaHome, FaCity, FaMapPin, FaInfoCircle,
  FaFilePdf, FaFileExcel, FaFileAlt, FaChevronDown,
  FaTimes, FaCheck, FaExclamationTriangle, FaBoxOpen,
  FaShippingFast, FaBan, FaChartLine, FaCalendarCheck,
  FaClipboardList, FaPercentage, FaArrowUp, FaArrowDown,
  FaSortAmountDown, FaEllipsisH, FaExternalLinkAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Orders.css';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:5000/api/orders';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, revenue: 0
  });
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const downloadMenuRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({ 
        title: 'Error!', 
        text: 'Failed to fetch orders', 
        icon: 'error', 
        confirmButtonColor: '#1a3c2b' 
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const statusLabels = {
      'pending': 'Pending',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };

    const result = await Swal.fire({
      title: 'Update Order Status?',
      html: `Change order status to <strong>${statusLabels[newStatus]}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a3c2b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Update Status',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ 
        title: 'Updating...', 
        text: 'Please wait', 
        icon: 'info', 
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        await axios.put(
          `${API_URL}/admin/${orderId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchOrders();
        Swal.fire({ 
          title: 'Updated!', 
          text: `Order status updated to ${statusLabels[newStatus]}`, 
          icon: 'success',
          confirmButtonColor: '#1a3c2b',
          timer: 2000
        });
      } catch (error) {
        Swal.fire({ 
          title: 'Error!', 
          text: error.response?.data?.message || 'Failed to update status', 
          icon: 'error',
          confirmButtonColor: '#1a3c2b'
        });
      }
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const response = await axios.get(`${API_URL}/admin/${order._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowModal(true);
      }
    } catch (error) {
      setSelectedOrder(order);
      setShowModal(true);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        class: 'status-pending', 
        icon: <FaClock />, 
        color: '#d97706',
        bg: '#fffbeb',
        border: '#f59e0b',
        label: 'Pending'
      },
      'processing': { 
        class: 'status-processing', 
        icon: <FaBoxOpen />, 
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#3b82f6',
        label: 'Processing'
      },
      'shipped': { 
        class: 'status-shipped', 
        icon: <FaShippingFast />, 
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#8b5cf6',
        label: 'Shipped'
      },
      'delivered': { 
        class: 'status-delivered', 
        icon: <FaCheckCircle />, 
        color: '#059669',
        bg: '#ecfdf5',
        border: '#10b981',
        label: 'Delivered'
      },
      'cancelled': { 
        class: 'status-cancelled', 
        icon: <FaBan />, 
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#ef4444',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs['pending'];
  };

  const formatPrice = (price) => {
    return `Rs ${Number(price).toLocaleString('en-PK')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredAndSortedOrders = React.useMemo(() => {
    let filtered = orders.filter(order => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (!searchTerm.trim()) return true;

      const search = searchTerm.toLowerCase().trim();
      const searchableText = [
        order.orderNumber,
        order.shippingAddress?.name,
        order.user?.email,
        order.shippingAddress?.phone,
        order.shippingAddress?.city,
        order.shippingAddress?.address,
        order.status
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(search);
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest': return (b.total || 0) - (a.total || 0);
        case 'lowest': return (a.total || 0) - (b.total || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'processing', label: 'Processing', count: stats.processing },
    { value: 'shipped', label: 'Shipped', count: stats.shipped },
    { value: 'delivered', label: 'Delivered', count: stats.delivered },
    { value: 'cancelled', label: 'Cancelled', count: stats.cancelled }
  ];

  const parseNotes = (notes) => {
    if (!notes) return { email: '', deliveryInstructions: '', other: '' };
    const parts = notes.split(' | ');
    const result = { email: '', deliveryInstructions: '', other: '' };
    parts.forEach(part => {
      if (part.startsWith('Email:')) result.email = part.replace('Email:', '').trim();
      else if (part.startsWith('Delivery Instructions:')) result.deliveryInstructions = part.replace('Delivery Instructions:', '').trim();
      else if (part.startsWith('Apartment:')) result.other += `Apartment: ${part.replace('Apartment:', '').trim()} | `;
      else if (part.startsWith('Postal Code:')) result.other += `Postal Code: ${part.replace('Postal Code:', '').trim()} | `;
    });
    return result;
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 60, 43);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER MANAGEMENT REPORT', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString('en-PK')}`, pageWidth / 2, 28, { align: 'center' });

    doc.setFillColor(245, 250, 247);
    doc.setDrawColor(226, 232, 228);
    doc.rect(10, 42, pageWidth - 20, 28, 'FD');

    doc.setTextColor(26, 60, 43);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', 15, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryX = 15;
    const summaryY = 58;
    const colWidth = (pageWidth - 30) / 6;

    const statItems = [
      { label: 'Total Orders', value: stats.total },
      { label: 'Pending', value: stats.pending },
      { label: 'Processing', value: stats.processing },
      { label: 'Shipped', value: stats.shipped },
      { label: 'Delivered', value: stats.delivered },
      { label: 'Cancelled', value: stats.cancelled }
    ];

    statItems.forEach((item, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(String(item.value), summaryX + (i * colWidth) + (colWidth/2), summaryY, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(item.label.toUpperCase(), summaryX + (i * colWidth) + (colWidth/2), summaryY + 5, { align: 'center' });
    });

    const tableData = getFilteredAndSortedOrders.map(order => [
      order.orderNumber || 'N/A',
      order.shippingAddress?.name || 'N/A',
      order.shippingAddress?.phone || 'N/A',
      order.shippingAddress?.email || order.user?.email || 'N/A',
      order.shippingAddress?.address || 'N/A',
      order.shippingAddress?.city || 'N/A',
      order.shippingAddress?.zipCode || 'N/A',
      order.items?.length || 0,
      formatPrice(order.total),
      order.paymentMethod?.toUpperCase() || 'N/A',
      order.status?.toUpperCase() || 'N/A',
      formatDateShort(order.createdAt)
    ]);

    doc.autoTable({
      startY: 78,
      head: [['Order #', 'Customer', 'Phone', 'Email', 'Address', 'City', 'Zip', 'Items', 'Total', 'Payment', 'Status', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [45, 106, 79],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [74, 107, 90],
        valign: 'middle'
      },
      alternateRowStyles: { fillColor: [250, 252, 251] },
      margin: { left: 10, right: 10 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount} | Organic Store Admin Dashboard`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowDownloadMenu(false);

    Swal.fire({
      title: 'PDF Downloaded!',
      text: `Downloaded ${getFilteredAndSortedOrders.length} orders as PDF`,
      icon: 'success',
      confirmButtonColor: '#1a3c2b',
      timer: 2000
    });
  };

  const downloadExcel = () => {
    const excelData = getFilteredAndSortedOrders.map(order => {
      const parsed = parseNotes(order.notes);
      const itemsList = order.items?.map(item => 
        `${item.name} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}`
      ).join('; ') || 'N/A';

      return {
        'Order Number': order.orderNumber || 'N/A',
        'Customer Name': order.shippingAddress?.name || 'N/A',
        'Phone': order.shippingAddress?.phone || 'N/A',
        'Email': order.shippingAddress?.email || order.user?.email || 'N/A',
        'Address': order.shippingAddress?.address || 'N/A',
        'City': order.shippingAddress?.city || 'N/A',
        'Zip Code': order.shippingAddress?.zipCode || 'N/A',
        'Apartment': parsed.other?.includes('Apartment') ? parsed.other.split('Apartment:')[1]?.split('|')[0]?.trim() : 'N/A',
        'Delivery Instructions': parsed.deliveryInstructions || 'N/A',
        'Items Count': order.items?.length || 0,
        'Items Details': itemsList,
        'Subtotal': order.subtotal || 0,
        'Shipping': order.shipping || 0,
        'Discount': order.discount || 0,
        'Total': order.total || 0,
        'Payment Method': order.paymentMethod?.toUpperCase() || 'N/A',
        'Status': order.status?.toUpperCase() || 'N/A',
        'Order Date': formatDate(order.createdAt),
        'Updated At': order.updatedAt ? formatDate(order.updatedAt) : 'N/A'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 30 },
      { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }
    ];

    const summaryData = [
      { Metric: 'Total Orders', Value: stats.total },
      { Metric: 'Pending Orders', Value: stats.pending },
      { Metric: 'Processing Orders', Value: stats.processing },
      { Metric: 'Shipped Orders', Value: stats.shipped },
      { Metric: 'Delivered Orders', Value: stats.delivered },
      { Metric: 'Cancelled Orders', Value: stats.cancelled },
      { Metric: 'Total Revenue', Value: orders.reduce((sum, o) => sum + (o.total || 0), 0) }
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    triggerDownload(blob, `Orders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowDownloadMenu(false);

    Swal.fire({
      title: 'Excel Downloaded!',
      text: `Downloaded ${getFilteredAndSortedOrders.length} orders as Excel`,
      icon: 'success',
      confirmButtonColor: '#1a3c2b',
      timer: 2000
    });
  };

  const downloadSingleOrderPDF = (order) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    doc.setFillColor(26, 60, 43);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #: ${order.orderNumber}`, margin, 30);
    doc.text(`Date: ${formatDate(order.createdAt)}`, margin, 35);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ORGANIC STORE', pageWidth - margin, 20, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Admin Dashboard', pageWidth - margin, 25, { align: 'right' });
    doc.text(new Date().toLocaleDateString('en-PK'), pageWidth - margin, 30, { align: 'right' });

    const statusConfig = getStatusConfig(order.status);
    const hex = statusConfig.color;
    doc.setFillColor(parseInt(hex.slice(1,3), 16), parseInt(hex.slice(3,5), 16), parseInt(hex.slice(5,7), 16));
    doc.rect(pageWidth - margin - 40, 33, 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(order.status.toUpperCase(), pageWidth - margin - 20, 38, { align: 'center' });

    let yPos = 50;

    doc.setFillColor(245, 250, 247);
    doc.setDrawColor(226, 232, 228);
    doc.rect(margin, yPos, (pageWidth - margin * 2) / 2 - 5, 45, 'FD');

    doc.setTextColor(26, 60, 43);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', margin + 5, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${order.shippingAddress?.name || 'N/A'}`, margin + 5, yPos + 16);
    doc.text(`Email: ${order.user?.email || 'N/A'}`, margin + 5, yPos + 22);
    doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, margin + 5, yPos + 28);

    doc.setFillColor(245, 250, 247);
    doc.rect(margin + (pageWidth - margin * 2) / 2 + 5, yPos, (pageWidth - margin * 2) / 2 - 5, 45, 'FD');

    doc.setTextColor(26, 60, 43);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING ADDRESS', margin + (pageWidth - margin * 2) / 2 + 10, yPos + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${order.shippingAddress?.address || 'N/A'}`, margin + (pageWidth - margin * 2) / 2 + 10, yPos + 16);
    doc.text(`${order.shippingAddress?.city || 'N/A'}${order.shippingAddress?.zipCode ? ', ' + order.shippingAddress.zipCode : ''}`, margin + (pageWidth - margin * 2) / 2 + 10, yPos + 22);

    const parsed = parseNotes(order.notes);
    if (parsed.deliveryInstructions) {
      doc.text(`Instructions: ${parsed.deliveryInstructions.substring(0, 40)}...`, margin + (pageWidth - margin * 2) / 2 + 10, yPos + 28);
    }

    yPos += 55;

    const itemsData = order.items?.map(item => [
      item.name || 'N/A',
      item.quantity || 0,
      formatPrice(item.price),
      formatPrice(item.price * item.quantity)
    ]) || [];

    doc.autoTable({
      startY: yPos,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      theme: 'grid',
      headStyles: {
        fillColor: [45, 106, 79],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [74, 107, 90]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    doc.setFillColor(240, 247, 243);
    doc.setDrawColor(45, 106, 79);
    doc.rect(pageWidth - margin - 80, yPos, 80, 50, 'FD');

    doc.setTextColor(26, 60, 43);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER SUMMARY', pageWidth - margin - 40, yPos + 8, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - margin - 75, yPos + 18);
    doc.text(formatPrice(order.subtotal || 0), pageWidth - margin - 5, yPos + 18, { align: 'right' });

    doc.text('Shipping:', pageWidth - margin - 75, yPos + 25);
    doc.text(order.shipping === 0 ? 'FREE' : formatPrice(order.shipping || 0), pageWidth - margin - 5, yPos + 25, { align: 'right' });

    doc.text('Discount:', pageWidth - margin - 75, yPos + 32);
    doc.text(order.discount === 0 ? 'None' : formatPrice(order.discount || 0), pageWidth - margin - 5, yPos + 32, { align: 'right' });

    doc.setDrawColor(45, 106, 79);
    doc.line(pageWidth - margin - 75, yPos + 36, pageWidth - margin - 5, yPos + 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', pageWidth - margin - 75, yPos + 44);
    doc.setTextColor(45, 106, 79);
    doc.text(formatPrice(order.total || 0), pageWidth - margin - 5, yPos + 44, { align: 'right' });

    doc.setTextColor(107, 120, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}`, margin, yPos + 18);

    doc.setFillColor(26, 60, 43);
    doc.rect(0, doc.internal.pageSize.getHeight() - 15, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Thank you for your business! | Organic Store Admin Dashboard', pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });

    doc.save(`Order_${order.orderNumber}_Invoice.pdf`);

    Swal.fire({
      title: 'Invoice Downloaded!',
      text: `Order ${order.orderNumber} invoice saved as PDF`,
      icon: 'success',
      confirmButtonColor: '#1a3c2b',
      timer: 2000
    });
  };

  return (
    <div className="ord-admin-container">
      {/* ===== HEADER ===== */}
      <div className="ord-header">
        <div className="ord-header-left">
          <div className="ord-breadcrumb">
            <span>Dashboard</span>
            <span>/</span>
            <span className="active">Order Management</span>
          </div>
          <h1><FaClipboardList /> Orders</h1>
          <p>Manage and track all customer orders in real-time</p>
        </div>
        <div className="ord-header-right">
          <button className="ord-btn-refresh" onClick={fetchOrders}>
            <FaSyncAlt /> Refresh
          </button>
          <div className="ord-download-wrap" ref={downloadMenuRef}>
            <button className="ord-btn-export" onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
              <FaDownload /> Export <FaChevronDown />
            </button>
            {showDownloadMenu && (
              <div className="ord-download-menu">
                <button onClick={downloadPDF}>
                  <FaFilePdf /> Download PDF
                </button>
                <button onClick={downloadExcel}>
                  <FaFileExcel /> Download Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="ord-stats-row">
        <div className="ord-stat-card">
          <div className="ord-stat-icon"><FaClipboardList /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{stats.total}</span>
            <span className="ord-stat-label">Total Orders</span>
          </div>
        </div>
        <div className="ord-stat-card pending">
          <div className="ord-stat-icon"><FaClock /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{stats.pending}</span>
            <span className="ord-stat-label">Pending</span>
          </div>
          {stats.pending > 0 && <span className="ord-stat-alert">{stats.pending} NEW</span>}
        </div>
        <div className="ord-stat-card processing">
          <div className="ord-stat-icon"><FaBoxOpen /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{stats.processing}</span>
            <span className="ord-stat-label">Processing</span>
          </div>
        </div>
        <div className="ord-stat-card shipped">
          <div className="ord-stat-icon"><FaShippingFast /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{stats.shipped}</span>
            <span className="ord-stat-label">Shipped</span>
          </div>
        </div>
        <div className="ord-stat-card delivered">
          <div className="ord-stat-icon"><FaCheckCircle /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{stats.delivered}</span>
            <span className="ord-stat-label">Delivered</span>
          </div>
        </div>
        <div className="ord-stat-card revenue">
          <div className="ord-stat-icon"><FaRupeeSign /></div>
          <div className="ord-stat-info">
            <span className="ord-stat-value">{formatPrice(stats.revenue || orders.reduce((s, o) => s + (o.total || 0), 0))}</span>
            <span className="ord-stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* ===== STATUS TABS ===== */}
      <div className="ord-status-tabs">
        {statusOptions.map(opt => {
          const cfg = getStatusConfig(opt.value === 'all' ? 'pending' : opt.value);
          const isActive = filterStatus === opt.value;
          return (
            <button
              key={opt.value}
              className={isActive ? 'active' : ''}
              onClick={() => setFilterStatus(opt.value)}
              style={isActive ? { 
                borderColor: cfg.border,
                background: cfg.bg,
                color: cfg.color
              } : {}}
            >
              {cfg.icon}
              <span>{opt.label}</span>
              <span className="count">{opt.count}</span>
            </button>
          );
        })}
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="ord-toolbar">
        <div className="ord-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search orders by number, customer, email, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="ord-clear" onClick={() => setSearchTerm('')}>
              <FaTimes />
            </button>
          )}
        </div>
        <div className="ord-toolbar-right">
          <div className="ord-sort">
            <FaSortAmountDown />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
          <span className="ord-count"><strong>{getFilteredAndSortedOrders.length}</strong> orders</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      {loading ? (
        <div className="ord-loading">
          <div className="ord-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="ord-table-wrap">
          {getFilteredAndSortedOrders.length === 0 ? (
            <div className="ord-empty">
              <FaBoxOpen />
              <h3>{searchTerm ? `No orders found for "${searchTerm}"` : 'No orders found'}</h3>
              <p>{searchTerm ? 'Try a different search term' : 'There are no orders in this category yet'}</p>
            </div>
          ) : (
            <table className="ord-table">
              <thead>
                <tr>
                  <th>ORDER #</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedOrders.map((order) => {
                  const cfg = getStatusConfig(order.status);
                  return (
                    <tr key={order._id}>
                      <td>
                        <span className="ord-num">#{order.orderNumber}</span>
                      </td>
                      <td>
                        <div className="ord-customer">
                          <div className="ord-avatar">
                            {(order.shippingAddress?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="ord-cust-info">
                            <span className="name">{order.shippingAddress?.name || 'N/A'}</span>
                            <span className="email">{order.user?.email || 'N/A'}</span>
                            <span className="phone">{order.shippingAddress?.phone || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="ord-items">{order.items?.length || 0}</span></td>
                      <td><span className="ord-total">{formatPrice(order.total)}</span></td>
                      <td>
                        <span className={`ord-payment ${order.paymentMethod}`}>
                          {order.paymentMethod === 'cod' ? <FaMoneyBillWave /> : <FaCreditCard />}
                          {order.paymentMethod === 'cod' ? 'COD' : 'CARD'}
                        </span>
                      </td>
                      <td>
                        <span className="ord-status" style={{ 
                          background: cfg.bg, 
                          color: cfg.color,
                          border: `1px solid ${cfg.border}40`
                        }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td>
                        <span className="ord-date">{formatDateShort(order.createdAt)}</span>
                        <span className="ord-time">{new Date(order.createdAt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td>
                        <div className="ord-actions">
                          <button className="view" onClick={() => viewOrderDetails(order)} title="View Details">
                            <FaEye />
                          </button>
                          <button className="print" onClick={() => downloadSingleOrderPDF(order)} title="Download Invoice">
                            <FaFilePdf />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            style={{ borderColor: cfg.color + '50', color: cfg.color }}
                          >
                            {statusOptions.filter(s => s.value !== 'all').map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {showModal && selectedOrder && (
        <div className="ord-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ord-modal-header">
              <div className="ord-modal-header-left">
                <h3><FaHashtag /> Order {selectedOrder.orderNumber}</h3>
                <span className="ord-modal-status" style={{ 
                  background: getStatusConfig(selectedOrder.status).bg,
                  color: getStatusConfig(selectedOrder.status).color
                }}>
                  {getStatusConfig(selectedOrder.status).icon}
                  {selectedOrder.status}
                </span>
              </div>
              <div className="ord-modal-header-right">
                <button onClick={() => downloadSingleOrderPDF(selectedOrder)}>
                  <FaFilePdf /> Invoice
                </button>
                <button className="close" onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="ord-modal-body">
              <div className="ord-modal-row">
                <div className="ord-modal-card">
                  <h4><FaUser /> Customer</h4>
                  <div className="ord-modal-customer">
                    <div className="ord-modal-avatar">
                      {(selectedOrder.shippingAddress?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="ord-modal-cust-details">
                      <p className="name">{selectedOrder.shippingAddress?.name || 'N/A'}</p>
                      <p><FaEnvelope /> {selectedOrder.user?.email || 'N/A'}</p>
                      <p><FaPhone /> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="ord-modal-card">
                  <h4><FaMapMarkerAlt /> Shipping Address</h4>
                  <div className="ord-modal-address">
                    <p><FaHome /> {selectedOrder.shippingAddress?.address || 'N/A'}</p>
                    <p><FaCity /> {selectedOrder.shippingAddress?.city || 'N/A'}{selectedOrder.shippingAddress?.zipCode ? `, ${selectedOrder.shippingAddress.zipCode}` : ''}</p>
                    {(() => {
                      const parsed = parseNotes(selectedOrder.notes);
                      return parsed.deliveryInstructions ? (
                        <p className="instructions"><FaInfoCircle /> {parsed.deliveryInstructions}</p>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>

              <div className="ord-modal-card full">
                <h4><FaShoppingBag /> Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="ord-modal-items">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="ord-modal-item">
                      <img src={item.image || '/placeholder.png'} alt={item.name} />
                      <div className="ord-modal-item-info">
                        <span className="name">{item.name}</span>
                        <span className="meta">Qty: {item.quantity} x {formatPrice(item.price)}</span>
                      </div>
                      <span className="total">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ord-modal-row">
                <div className="ord-modal-card">
                  <h4><FaRupeeSign /> Order Summary</h4>
                  <div className="ord-modal-summary">
                    <div className="line"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                    <div className="line"><span>Shipping</span><span>{selectedOrder.shipping === 0 ? 'FREE' : formatPrice(selectedOrder.shipping)}</span></div>
                    <div className="line"><span>Discount</span><span>{selectedOrder.discount === 0 ? 'None' : formatPrice(selectedOrder.discount)}</span></div>
                    <div className="line total"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
                    <div className="payment"><FaCreditCard /> Paid via {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</div>
                  </div>
                </div>

                <div className="ord-modal-card">
                  <h4><FaBox /> Update Status</h4>
                  <div className="ord-modal-status-update">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setSelectedOrder({...selectedOrder, status: newStatus});
                        updateOrderStatus(selectedOrder._id, newStatus);
                        setShowModal(false);
                      }}
                      style={{ borderColor: getStatusConfig(selectedOrder.status).color }}
                    >
                      {statusOptions.filter(s => s.value !== 'all').map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <p className="desc">
                      {selectedOrder.status === 'delivered' ? 'Order has been delivered to customer' :
                       selectedOrder.status === 'shipped' ? 'Order is on the way to customer' :
                       selectedOrder.status === 'processing' ? 'Order is being prepared' :
                       selectedOrder.status === 'pending' ? 'Waiting for confirmation' :
                       'Order has been cancelled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="ord-modal-card full">
                <h4><FaCalendarCheck /> Order Timeline</h4>
                <div className="ord-timeline">
                  {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                    const stepCfg = getStatusConfig(step);
                    const isDone = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) >= idx;
                    const isCurrent = selectedOrder.status === step;
                    return (
                      <div key={step} className={`step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                        <div className="dot" style={{ 
                          background: isDone ? stepCfg.color : '#f3f4f6',
                          borderColor: isDone ? stepCfg.color : '#d1d5db'
                        }}>
                          {isDone ? stepCfg.icon : <span>{idx + 1}</span>}
                        </div>
                        <span className="label">{stepCfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;