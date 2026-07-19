import { useState, useEffect } from 'react';
import { 
  FaSearch, FaTrash, FaUserShield, FaUserCheck, FaUsers, 
  FaSyncAlt, FaLeaf, FaFilePdf, FaFileExcel, FaTrashRestore,
  FaEye, FaTimes, FaEnvelope, FaCalendarAlt, FaClock, FaUserCircle,
  FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import './users.css';

const API_URL = 'http://localhost:5000/api/auth';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, deleted: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
      setDeletedUsers(response.data.deletedUsers || []);
      setStats(response.data.stats || { total: 0, admins: 0, users: 0, deleted: 0 });
    } catch (error) {
      Swal.fire({ title: 'Error!', text: 'Failed to fetch users', icon: 'error', confirmButtonColor: '#2D5A27' });
    } finally {
      setLoading(false);
    }
  };

  // ========== PDF EXPORT ==========
  const exportToPDF = () => {
    const currentUsers = showDeleted ? deletedUsers : users;

    if (currentUsers.length === 0) {
      Swal.fire({ title: 'No Data', text: 'No users to export', icon: 'info', confirmButtonColor: '#2D5A27' });
      return;
    }

    Swal.fire({
      title: 'Generating PDF...',
      text: 'Please wait',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const generatePDFWithLogo = (logoData) => {
        try {
          doc.setFillColor(45, 90, 39);
          doc.rect(0, 0, 297, 45, 'F');

          if (logoData) {
            const imgWidth = 12, imgHeight = 12, x = 14, y = 16;
            doc.addImage(logoData, 'PNG', x, y, imgWidth, imgHeight);
            doc.setDrawColor(196, 151, 58);
            doc.setLineWidth(0.5);
            doc.circle(x + imgWidth/2, y + imgHeight/2, imgWidth/2 + 0.5);

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Organic Heritage', 32, 25);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Users Management Report', 32, 34);
          } else {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Organic Heritage', 14, 25);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Users Management Report', 14, 34);
          }

          doc.setTextColor(100, 100, 100);
          doc.setFontSize(9);
          doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 55);

          doc.setFillColor(245, 245, 245);
          doc.rect(14, 62, 85, 20, 'F');
          doc.rect(104, 62, 85, 20, 'F');
          doc.rect(194, 62, 85, 20, 'F');

          doc.setTextColor(45, 90, 39);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total Users: ${currentUsers.length}`, 18, 74);
          doc.text(`Admins: ${currentUsers.filter(u => u.role === 'admin').length}`, 108, 74);
          doc.text(`Regular: ${currentUsers.filter(u => u.role === 'user').length}`, 198, 74);

          const tableColumn = ['#', 'Name', 'Email', 'Role', 'Joined Date'];
          const tableRows = [];

          currentUsers.forEach((user, index) => {
            tableRows.push([
              index + 1,
              user.name || 'N/A',
              user.email,
              user.role.toUpperCase(),
              new Date(user.createdAt).toLocaleDateString()
            ]);
          });

          doc.autoTable({
            startY: 90,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: {
              fillColor: [45, 90, 39],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 9,
              halign: 'left'
            },
            bodyStyles: { fontSize: 9, cellPadding: 5 },
            alternateRowStyles: { fillColor: [248, 245, 238] },
            margin: { left: 14, right: 14 }
          });

          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
              `Organic Heritage - Confidential Report | Page ${i} of ${pageCount}`,
              doc.internal.pageSize.getWidth() / 2,
              doc.internal.pageSize.getHeight() - 10,
              { align: 'center' }
            );
          }

          doc.save(`organic-heritage-users-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);

          Swal.fire({
            title: 'PDF Downloaded!',
            html: `Successfully exported ${currentUsers.length} users.`,
            icon: 'success',
            confirmButtonColor: '#2D5A27',
            timer: 2000,
            showConfirmButton: true
          });
        } catch (err) {
          console.error('PDF Generation Error:', err);
          Swal.fire({ title: 'Error!', text: 'Failed to generate PDF', icon: 'error', confirmButtonColor: '#2D5A27' });
        }
      };

      const img = new Image();
      img.src = '/logo.png';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        generatePDFWithLogo(dataURL);
      };
      img.onerror = () => { generatePDFWithLogo(null); };

    } catch (error) {
      console.error('PDF Error:', error);
      Swal.fire({ title: 'Error!', text: 'Failed to generate PDF. Please try again.', icon: 'error', confirmButtonColor: '#2D5A27' });
    }
  };

  // ========== EXCEL EXPORT ==========
  const exportToExcel = () => {
    const currentUsers = showDeleted ? deletedUsers : users;

    if (currentUsers.length === 0) {
      Swal.fire({ title: 'No Data', text: 'No users to export', icon: 'info', confirmButtonColor: '#2D5A27' });
      return;
    }

    Swal.fire({
      title: 'Generating Excel...',
      text: 'Please wait',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const worksheetData = currentUsers.map((user, index) => ({
        'S.No': index + 1,
        'Name': user.name || 'N/A',
        'Email': user.email,
        'Role': user.role.toUpperCase(),
        'Joined Date': new Date(user.createdAt).toLocaleDateString(),
        'User ID': user._id
      }));

      const ws = XLSX.utils.json_to_sheet(worksheetData);
      ws['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 15 }, { wch: 30 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Organic Heritage Users');

      XLSX.writeFile(wb, `organic-heritage-users-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`);

      Swal.fire({
        title: 'Excel Downloaded!',
        html: `Successfully exported ${currentUsers.length} users.`,
        icon: 'success',
        confirmButtonColor: '#2D5A27',
        timer: 2000,
        showConfirmButton: true
      });

    } catch (error) {
      console.error('Excel Error:', error);
      Swal.fire({ title: 'Error!', text: 'Failed to generate Excel file', icon: 'error', confirmButtonColor: '#2D5A27' });
    }
  };

  const handleSoftDelete = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Move to Trash?', 
      html: `Move <strong>${userName}</strong> to trash?`, 
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
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        await fetchUsers();
        Swal.fire({ title: 'Moved to Trash!', text: `${userName} moved to trash.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  const handleRestoreUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Restore User?', 
      html: `Restore <strong>${userName}</strong>?`, 
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
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/admin/users/${userId}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
        await fetchUsers();
        Swal.fire({ title: 'Restored!', text: `${userName} restored.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  const handlePermanentDelete = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Permanently Delete?', 
      html: `This cannot be undone! Delete <strong>${userName}</strong> permanently?`, 
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
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/users/${userId}/permanent`, { headers: { Authorization: `Bearer ${token}` } });
        await fetchUsers();
        Swal.fire({ title: 'Deleted!', text: `${userName} permanently deleted.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      }
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    setUpdatingUserId(userId);
    const result = await Swal.fire({
      title: `Change to ${newRole === 'admin' ? 'Admin' : 'User'}?`, 
      html: `Make <strong>${userName}</strong> ${newRole === 'admin' ? 'an Admin' : 'a User'}?`, 
      icon: 'question',
      showCancelButton: true, 
      confirmButtonColor: '#2D5A27', 
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Yes, make ${newRole === 'admin' ? 'Admin' : 'User'}`, 
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'Updating...', text: 'Please wait', icon: 'info', showConfirmButton: false, didOpen: () => Swal.showLoading() });
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
        await fetchUsers();
        Swal.fire({ title: 'Role Updated!', text: `${userName} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}.`, icon: 'success', confirmButtonColor: '#2D5A27', timer: 2000 });
      } catch (error) {
        Swal.fire({ title: 'Error!', text: error.response?.data?.message, icon: 'error', confirmButtonColor: '#2D5A27' });
      } finally {
        setUpdatingUserId(null);
      }
    } else {
      setUpdatingUserId(null);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = (showDeleted ? deletedUsers : users).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-container">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-home">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Users Management</span>
        </div>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all registered users, their roles and permissions</p>
      </div>

      {/* ===== STATS CARDS - UNIQUE CLASS NAMES ===== */}
      <div className="usr-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #E5E7EB' }}>

        <div className="usr-stat-box" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: '#ffffff', borderRight: '1px solid #E5E7EB', minHeight: '80px' }}>
          <div style={{ width: '44px', height: '44px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#2D5A27' }}>
            <FaUsers />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Total Users</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2D5A27' }}>{stats.total || 0}</span>
          </div>
        </div>

        <div className="usr-stat-box" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: '#ffffff', borderRight: '1px solid #E5E7EB', minHeight: '80px' }}>
          <div style={{ width: '44px', height: '44px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#C4973A' }}>
            <FaUserShield />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Administrators</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2D5A27' }}>{stats.admins || 0}</span>
          </div>
        </div>

        <div className="usr-stat-box" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: '#ffffff', borderRight: '1px solid #E5E7EB', minHeight: '80px' }}>
          <div style={{ width: '44px', height: '44px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#2D5A27' }}>
            <FaUserCheck />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Regular Users</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2D5A27' }}>{stats.users || 0}</span>
          </div>
        </div>

        <div className="usr-stat-box" onClick={() => setShowDeleted(!showDeleted)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: '#ffffff', minHeight: '80px', cursor: 'pointer' }}>
          <div style={{ width: '44px', height: '44px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#DC2626' }}>
            <FaTrash />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Deleted Users</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2D5A27' }}>{stats.deleted || 0}</span>
          </div>
          {showDeleted && (
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 600, background: '#DC2626', color: 'white', padding: '3px 8px' }}>Viewing</span>
          )}
        </div>

      </div>

      {/* ===== ACTION BAR ===== */}
      <div className="action-bar">
        <div className="action-bar-left">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="action-bar-right">
          <button className="btn-refresh" onClick={fetchUsers}>
            <FaSyncAlt /> Refresh
          </button>
          <button className="btn-pdf" onClick={exportToPDF}>
            <FaFilePdf /> PDF Report
          </button>
          <button className="btn-excel" onClick={exportToExcel}>
            <FaFileExcel /> Excel Report
          </button>
          {showDeleted && (
            <button className="btn-back" onClick={() => setShowDeleted(false)}>
              <FaArrowLeft /> Active Users
            </button>
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Joined Date</th>
                {showDeleted && <th>Deleted Date</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={showDeleted ? 7 : 6} className="empty-state">
                    <FaLeaf size={48} />
                    <h3>No users found</h3>
                    <p>Try adjusting your search or refresh the page</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-info" onClick={() => viewUserDetails(u)}>
                        <div className="user-avatar">
                          {u.name?.charAt(0) || u.email?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{u.name || 'N/A'}</span>
                          <span className="user-id">ID: {u._id.slice(-8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="user-email">{u.email}</td>
                    <td>
                      {!showDeleted ? (
                        <select 
                          className={`role-badge-select ${u.role}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                          disabled={updatingUserId === u._id}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    {showDeleted && (
                      <td>{u.deletedAt ? new Date(u.deletedAt).toLocaleDateString() : 'N/A'}</td>
                    )}
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => viewUserDetails(u)} title="View Details">
                          <FaEye />
                        </button>
                        {!showDeleted ? (
                          <button className="action-btn delete" onClick={() => handleSoftDelete(u._id, u.name)} title="Move to Trash">
                            <FaTrash />
                          </button>
                        ) : (
                          <>
                            <button className="action-btn restore" onClick={() => handleRestoreUser(u._id, u.name)} title="Restore User">
                              <FaTrashRestore />
                            </button>
                            <button className="action-btn permanent" onClick={() => handlePermanentDelete(u._id, u.name)} title="Permanently Delete">
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

      {!loading && filteredUsers.length > 0 && (
        <div className="table-footer">
          <div className="footer-stats">
            <span className="footer-stat">
              <FaUsers /> Total: {filteredUsers.length}
            </span>
            {!showDeleted && (
              <>
                <span className="footer-stat admin">
                  <FaUserShield /> Admins: {filteredUsers.filter(u => u.role === 'admin').length}
                </span>
                <span className="footer-stat user">
                  <FaUserCheck /> Regular: {filteredUsers.filter(u => u.role === 'user').length}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-profile">
                <div className="user-profile-avatar">
                  {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0) || 'U'}
                </div>
                <div className="user-profile-info">
                  <h4>{selectedUser.name || 'N/A'}</h4>
                  <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                </div>
              </div>
              <div className="user-details-list">
                <div className="detail-row">
                  <FaEnvelope className="detail-icon" />
                  <div>
                    <label>Email Address</label>
                    <p>{selectedUser.email}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <FaCalendarAlt className="detail-icon" />
                  <div>
                    <label>Joined Date</label>
                    <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedUser.deletedAt && (
                  <div className="detail-row">
                    <FaClock className="detail-icon" />
                    <div>
                      <label>Deleted Date</label>
                      <p>{new Date(selectedUser.deletedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <div className="detail-row">
                  <FaUserCircle className="detail-icon" />
                  <div>
                    <label>User ID</label>
                    <p>{selectedUser._id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;