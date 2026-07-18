// src/components/admin/tabs/settings/Settings.jsx
import { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaSave, 
  FaEye, FaEyeSlash, FaUserCircle, FaKey,
  FaInfoCircle, FaShieldAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import './Settings.css';

const API_URL = 'http://localhost:5000/api/auth';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Admin Profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProfile({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    }
  };

  // Update Profile
  const handleUpdateProfile = async () => {
    if (!profile.name.trim()) {
      Swal.fire('Error!', 'Name is required', 'error');
      return;
    }

    setLoading(true);
    Swal.fire({
      title: 'Updating Profile...',
      text: 'Please wait',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/update-profile`,
        {
          name: profile.name,
          phone: profile.phone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.name = profile.name;
        userData.phone = profile.phone;
        localStorage.setItem('user', JSON.stringify(userData));
        
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update profile',
        icon: 'error',
        confirmButtonColor: '#2D5A27'
      });
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      Swal.fire('Error!', 'Current password is required', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire('Error!', 'New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire('Error!', 'New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    Swal.fire({
      title: 'Changing Password...',
      text: 'Please wait',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        Swal.fire({
          title: 'Password Changed!',
          text: 'Your password has been updated successfully',
          icon: 'success',
          confirmButtonColor: '#2D5A27',
          timer: 2000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to change password',
        icon: 'error',
        confirmButtonColor: '#2D5A27'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  return (
    <div className="settings-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <span className="breadcrumb-home">Dashboard</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Settings</span>
        </div>
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your profile and security settings</p>
      </div>

      <div className="settings-grid">
        {/* Profile Settings Card */}
        <div className="settings-card">
          <div className="card-header">
            <FaUserCircle className="card-icon" />
            <h3>Profile Information</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>
                <FaUser /> Full Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={profile.name} 
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>
                <FaEnvelope /> Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={profile.email} 
                disabled
                className="disabled-input"
              />
              <span className="field-note">
                <FaInfoCircle /> Email cannot be changed
              </span>
            </div>
            <div className="form-group">
              <label>
                <FaPhone /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={profile.phone} 
                onChange={handleProfileChange}
                placeholder="+92 300 1234567"
              />
            </div>
            <button className="btn-primary" onClick={handleUpdateProfile} disabled={loading}>
              <FaSave /> Update Profile
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="settings-card">
          <div className="card-header">
            <FaShieldAlt className="card-icon" />
            <h3>Security Settings</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>
                <FaKey /> Current Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  name="currentPassword" 
                  value={passwordData.currentPassword} 
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>
                <FaLock /> New Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  name="newPassword" 
                  value={passwordData.newPassword} 
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 6 characters)"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>
                <FaLock /> Confirm New Password
              </label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={passwordData.confirmPassword} 
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button className="btn-primary" onClick={handleChangePassword} disabled={loading}>
              <FaLock /> Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;