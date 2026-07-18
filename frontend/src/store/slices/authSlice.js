import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Get user from localStorage
const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (user && token) {
            return { user: JSON.parse(user), token };
        }
    } catch (error) {
        console.error('Error reading localStorage:', error);
    }
    return { user: null, token: null };
};

const initialState = {
    user: getUserFromStorage().user,
    token: getUserFromStorage().token,
    isAuthenticated: !!getUserFromStorage().token,
    isLoading: false,
    error: null,
};

// ============================================
// LOGIN USER
// ============================================
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            
            if (response.data.success) {
                const { token, user } = response.data;
                // Save to localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { user, token };
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

// ============================================
// LOGOUT USER
// ============================================
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch(clearError());
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // ✅ FIXED: Added setUser reducer
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { setUser, clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;