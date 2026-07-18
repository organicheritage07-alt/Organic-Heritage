// src/pages/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (token && userParam) {
            try {
                // Parse user data from URL
                const userData = JSON.parse(decodeURIComponent(userParam));
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('userRole', userData.role);

                // Dispatch to Redux
                dispatch(setUser({ user: userData, token }));

                toast.success('Welcome! You have signed in successfully.');

                // Role-based redirect (same as manual login)
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                toast.error('Something went wrong. Please try again.');
                navigate('/login', { replace: true });
            }
        } else {
            // No token or user data
            toast.error('Authentication failed. Please try again.');
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #E5E7EB',
                borderTopColor: '#2D6A4F',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>Signing you in...</p>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AuthCallback;