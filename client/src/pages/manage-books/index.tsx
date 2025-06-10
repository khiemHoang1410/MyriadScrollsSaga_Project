import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

import { useBooks } from '@/features/book/useBooks';
import { type Book } from '@/features/book/types';

export const ManageBooksPage = () => {
  const { data: booksResponse, isLoading } = useBooks({});
  const navigate = useNavigate();

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
      valueGetter: (value) =>
        value ? new Date(value as string).toLocaleString('vi-VN') : '',
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      sortable: false,
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Book>) => (
        <IconButton
          aria-label="edit"
          onClick={() => navigate(`/dashboard/manage-books/edit/${params.row._id}`)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const rows = booksResponse?.data || [];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý Sách
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/manage-books/add')}
        >
          Thêm Sách Mới
        </Button>
      </Box>

      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid<Book>
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row: Book) => row._id}
          
          /* --- Bắt đầu khối phân trang --- */
          
          // initialState sẽ cài đặt giá trị ban đầu, sau đó component tự quản lý
          initialState={{
            pagination: {
              // Cài đặt số dòng mặc định cho mỗi trang là 10
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          // Cung cấp các tùy chọn để người dùng thay đổi
          pageSizeOptions={[5, 10, 25]} 

          /* --- Kết thúc khối phân trang --- */
          
          checkboxSelection
          // Bỏ thuộc tính này nếu nó gây ra xung đột không mong muốn
          // disableRowSelectionOnClick 
        />
      </Box>
    </Container>
  );
};