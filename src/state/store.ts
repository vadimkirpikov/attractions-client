import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<string>) => {
            localStorage.setItem('token', action.payload);
            state.isAuthenticated = true;
        },
        logout: (state) => {
            localStorage.removeItem('token');
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;