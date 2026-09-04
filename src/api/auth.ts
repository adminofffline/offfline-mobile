import api from './client';

export const authApi = {
  login: (data: { phone?: string; email?: string; password: string; role?: string }) =>
    api.post('/auth/login', data),

  demoLogin: (role: string) =>
    api.post('/auth/demo-login', { role }),

  register: (data: {
    fullName?: string;
    ownerName?: string;
    companyName?: string;
    plantName?: string;
    organization?: string;
    phone: string;
    password: string;
    role: string;
    email?: string;
    address?: string;
    isi_registration_number?: string;
    pincode?: string;
    city?: string;
  }) => api.post('/auth/register', data),

  me: () => api.get('/auth/me'),

  updateProfile: (data: any) => api.put('/auth/profile', data),

  changePassword: (data: { current_password?: string; new_password?: string }) =>
    api.post('/auth/change-password', data),

  refresh: (refresh_token: string) =>
    api.post('/auth/refresh-token', { refresh_token }),

  logout: (all = false) =>
    api.post('/auth/logout', { all }),

  sendOtp: (phone: string, role?: string, purpose = 'REGISTER') =>
    api.post('/auth/send-otp', { phone, role, purpose }),

  verifyOtp: (phone: string, code: string, purpose = 'REGISTER') =>
    api.post('/auth/verify-otp', { phone, code, purpose }),

  forgotPassword: (email: string) =>
    api.post('/auth/send-otp', { phone: email, purpose: 'PASSWORD_RESET' }),

  resetPassword: (token: any, password?: any) =>
    api.post('/auth/verify-otp', typeof token === 'object' ? token : { token, password }),
};

export default authApi;
