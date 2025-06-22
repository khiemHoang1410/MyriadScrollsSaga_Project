// client/src/features/auth/LoginForm.tsx
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Stack, TextField, Typography, Link, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

import { login } from './api.auth';
import type { LoginInput, AuthResponse } from './types';
import { useAuthStore } from '@/shared/store/authStore';
import { paths } from '@/shared/config/paths';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending, error } = useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: login,
    onSuccess: (data) => {
      // FIX Ở ĐÂY: Lấy user từ data.data
      const { token, data: user } = data;
      setAuth(token, user); // Giờ thì user không thể nào là null/undefined được nữa
      toast.success('Đăng nhập thành công!');
      navigate(paths.home, { replace: true });
    },
  });

  const onSubmit: SubmitHandler<LoginInput> = (data) => {
    mutate(data);
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error instanceof AxiosError) {
      return error.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
    }
    return 'Đã có lỗi xảy ra.';
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ p: 4, width: '100%', maxWidth: '450px' }}>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Đăng Nhập
        </Typography>
        {error && <Alert severity="error">{getErrorMessage()}</Alert>}
        <TextField {...register('email')} required fullWidth autoFocus label="Địa chỉ Email" type="email" error={!!errors.email} helperText={errors.email?.message} disabled={isPending}/>
        <TextField {...register('password')} required fullWidth label="Mật khẩu" type="password" error={!!errors.password} helperText={errors.password?.message} disabled={isPending}/>
        <LoadingButton type="submit" fullWidth variant="contained" size="large" loading={isPending}>
          <span>Đăng Nhập</span>
        </LoadingButton>
        <Typography align="center" sx={{ mt: 2 }}>
          Chưa có tài khoản?{' '}
          <Link component={RouterLink} to={paths.register}>
            Đăng ký ngay
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};