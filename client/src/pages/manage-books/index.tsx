// client/src/pages/manage-books/index.tsx

import { Box, Container, Typography } from '@mui/material';
// 1. Đảm bảo không import 'GridValueGetterParams' nữa
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useBooks } from '@/features/book/useBooks';
import type { Book } from '@/features/book/types';

export const ManageBooksPage = () => {
  const { data: booksResponse, isLoading } = useBooks({});

  const columns: GridColDef<Book>[] = [
    {
      field: 'title',
      headerName: 'Tiêu đề',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'author',
      headerName: 'Tác giả',
      width: 180,
      // 2. SỬA LỖI: Thay (params) => params.row... bằng (_, row) => row...
      // Tham số đầu tiên là 'value' (chúng ta không dùng nên đặt là _),
      // tham số thứ hai là 'row'
      valueGetter: (_, row) => row.author?.username || 'N/A',
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 180,
      // 3. SỬA LỖI: Ở đây ta chỉ cần tham số đầu tiên là 'value'
      valueGetter: (value) =>
        value ? new Date(value as string).toLocaleString('vi-VN') : '',
    },
    {
      field: 'viewsCount',
      headerName: 'Lượt xem',
      type: 'number',
      width: 120,
    },
  ];

  const rows = booksResponse?.data || [];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Sách
      </Typography>

      <Box sx={{ height: 600, width: '100%', mt: 3 }}>
        {/* Vẫn giữ <Book> để có type inference tốt nhất */}
        <DataGrid<Book>
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Container>
  );
};