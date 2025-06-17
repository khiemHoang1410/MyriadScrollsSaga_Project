// client/src/features/auth/RegisterForm.tsx
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { Paper, Stack, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { Button } from '@/shared/ui/Button';
import { register } from './api.auth';

// Định nghĩa "luật chơi" bằng Zod, thêm confirmPassword
const registerFormSchema = z
  .object({
    username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'], // Gán lỗi vào trường confirmPassword
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const RegisterForm = () => {
  const navigate = useNavigate();

  const {
    register: formRegister, // Đổi tên để không trùng với hàm register API
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      // alert('Đăng ký thành công! Vui lòng đăng nhập.'); // Dùng alert hoặc toast/snackbar
      navigate('/login'); // Chuyển hướng tới trang login
    },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    mutate(data);
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error instanceof AxiosError && error.response?.data?.message) {
      return error.response.data.message;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  };

  return (
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: '450px', borderRadius: 2 }}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
        <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
          Tạo tài khoản
        </Typography>

        {error && <Alert severity="error">{getErrorMessage()}</Alert>}

        <TextField
          {...formRegister('username')}
          label="Tên người dùng"
          fullWidth
          required
          error={!!errors.username}
          helperText={errors.username?.message}
          disabled={isPending}
        />
        <TextField
          {...formRegister('email')}
          label="Email"
          type="email"
          fullWidth
          required
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isPending}
        />
        <TextField
          {...formRegister('password')}
          label="Mật khẩu"
          type="password"
          fullWidth
          required
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isPending}
        />
        <TextField
          {...formRegister('confirmPassword')}
          label="Xác nhận mật khẩu"
          type="password"
          fullWidth
          required
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          disabled={isPending}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isPending}
          sx={{ mt: 2 }}
        >
          {isPending ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
        </Button>
      </Stack>
    </Paper>
  );
};