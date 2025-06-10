// client/src/pages/manage-books/index.tsx

import { Box, Container, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid'; // 1. Import DataGrid
import { useBooks } from '@/features/book/useBooks'; // Import hook lấy danh sách sách

export const ManageBooksPage = () => {
  // 2. Lấy dữ liệu tất cả các sách bằng cách truyền object rỗng
  const { data: booksResponse, isLoading } = useBooks({});

  // 3. Định nghĩa các cột cho bảng DataGrid
  const columns: GridColDef[] = [
    { 
      field: 'title', 
      headerName: 'Tiêu đề', 
      flex: 1, // Chiếm phần lớn không gian
      minWidth: 250 
    },
    { 
      field: 'author', 
      headerName: 'Tác giả', 
      width: 180,
      // Dùng valueGetter để lấy và hiển thị tên tác giả từ object lồng nhau
      valueGetter: (params) => params.row.author?.username || 'N/A',
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 130 
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 180,
      // Dùng valueGetter để định dạng lại ngày tháng
      valueGetter: (params) => new Date(params.value).toLocaleString('vi-VN'),
    },
    {
      field: 'viewsCount',
      headerName: 'Lượt xem',
      type: 'number',
      width: 120,
    }
  ];

  // Nếu booksResponse chưa có dữ liệu, dùng một mảng rỗng để tránh lỗi
  const rows = booksResponse?.data || [];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý Sách
      </Typography>
      
      {/* 4. Hiển thị DataGrid */}
      <Box sx={{ height: 600, width: '100%', mt: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row._id} // Chỉ cho DataGrid biết ID của mỗi hàng là trường `_id`
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