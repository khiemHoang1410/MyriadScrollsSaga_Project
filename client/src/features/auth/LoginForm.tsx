// src/features/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/shared/ui/Button';
import { Stack, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { AxiosError } from 'axios'; // <-- 1. IMPORT AXIOSERROR

import { login } from './api.auth';
import { useAuthStore } from '@/shared/store/authStore';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const { mutate, isPending, isError, error } = useMutation({ // Lấy ra các state từ useMutation
    mutationFn: login,
    onSuccess: (data) => {
      console.log('Login success:', data);
      setAuth(data.token, data.data);
      alert('Đăng nhập thành công!');
      // Điều hướng về trang chủ sau khi đăng nhập thành công
      window.location.href = '/';
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  // 2. XỬ LÝ LỖI MỘT CÁCH AN TOÀN
  const getErrorMessage = () => {
    if (!isError) return null;

    if (error instanceof AxiosError) {
      // Nếu là lỗi từ axios, ta có thể an toàn truy cập `error.response`
      return error.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
    }

    // Đối với các loại lỗi khác
    return error.message || 'Đã có lỗi xảy ra.';
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      spacing={2}
      sx={{ padding: 4, border: '1px solid #ddd', borderRadius: 2, width: '100%', maxWidth: '400px', backgroundColor: 'white' }}
    >
      <Typography variant="h5" component="h1" textAlign="center">
        Login
      </Typography>

      {/* Hiển thị lỗi nếu có */}
      {isError && (
        <Alert severity="error">
          {getErrorMessage()}
        </Alert>
      )}

      <TextField
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isPending}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isPending}
      />
      <Button
        variant="contained"
        type="submit"
        size="large"
        disabled={isPending}
      >
        {isPending ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>
    </Stack>
  );
};