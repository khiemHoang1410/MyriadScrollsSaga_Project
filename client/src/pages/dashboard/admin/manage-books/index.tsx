// client/src/pages/manage-books/index.tsx

import { useState } from 'react';
import {
  Box, Button, Container, Typography, IconButton, Chip,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Menu, MenuItem // Import thêm Menu và MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';

import { useBooks } from '@/features/book/useBooks';
import { useDeleteBook } from '@/features/book/useDeleteBook';
import { useUpdateBook } from '@/features/book/useUpdateBook'; // Import hook update
import { type Book, BookStatus } from '@/features/book/types'; // Import thêm BookStatus enum

export const ManageBooksPage = () => {
  const { data: booksResponse, isLoading } = useBooks({});
  const { mutate: deleteBookMutate, isPending: isDeleting } = useDeleteBook();
  const { mutate: updateBookMutate, isPending: isUpdating } = useUpdateBook(); // Lấy hàm mutate của update
  const navigate = useNavigate();

  // --- BẮT ĐẦU PHẦN STATE MỚI CHO MENU STATUS ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const menuOpen = Boolean(anchorEl);
  // --- KẾT THÚC PHẦN STATE MỚI ---

  // Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleOpenDeleteDialog = (id: string) => {
    setEditingBookId(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);

  const handleConfirmDelete = () => {
    if (editingBookId) {
      deleteBookMutate(editingBookId, { onSuccess: handleCloseDeleteDialog });
    }
  };

  // --- BẮT ĐẦU CÁC HÀM XỬ LÝ CHO MENU STATUS ---
  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, bookId: string) => {
    setAnchorEl(event.currentTarget);
    setEditingBookId(bookId);
  };

  const handleCloseStatusMenu = () => {
    setAnchorEl(null);
    setEditingBookId(null);
  };

  const handleStatusChange = (newStatus: BookStatus) => {
    if (editingBookId) {
      updateBookMutate({ bookId: editingBookId, bookData: { status: newStatus } });
    }
    handleCloseStatusMenu();
  };
  // --- KẾT THÚC CÁC HÀM XỬ LÝ ---

  const columns: GridColDef<Book>[] = [
    // ... các cột title, author, createdAt ...
    { field: 'title', headerName: 'Tiêu đề', flex: 1, minWidth: 250 },
    { field: 'author', headerName: 'Tác giả', width: 180, valueGetter: (_, row) => row.author?.username || 'N/A' },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150, // Tăng độ rộng 1 chút
      renderCell: (params: GridRenderCellParams<any, Book>) => {
        const status = params.row.status;
        let color: "success" | "info" | "warning" | "default" | "error" = "default";
        if (status === 'published') color = 'success';
        if (status === 'in_review') color = 'info';
        if (status === 'draft') color = 'warning';
        if (status === 'rejected') color = 'error';

        // Biến Chip thành một nút bấm
        return (
          <Chip
            label={status}
            color={color}
            size="small"
            onClick={(e) => handleOpenStatusMenu(e, params.row._id)}
            sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
          />
        );
      },
    },
    { field: 'createdAt', headerName: 'Ngày tạo', width: 180, valueGetter: (value) => value ? new Date(value).toLocaleString('vi-VN') : '' },
    {
      field: 'actions',
      headerName: 'Hành động',
      sortable: false,
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, Book>) => (
        <Box>
          <IconButton aria-label="view" onClick={() => navigate(`/books/${params.row.slug}`)}><VisibilityIcon /></IconButton>
          <IconButton aria-label="edit" onClick={() => navigate(`/dashboard/admin/manage-books/edit/${params.row._id}`)}><EditIcon /></IconButton>
          <IconButton aria-label="delete" color="error" onClick={() => handleOpenDeleteDialog(params.row._id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* ... Phần header của trang giữ nguyên ... */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Quản lý Sách</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/admin/manage-books/add')}>Thêm Sách Mới</Button>
      </Box>

      <Box sx={{ height: 700, width: '100%' }}>
        <DataGrid<Book>
          rows={booksResponse?.data || []}
          columns={columns}
          loading={isLoading || isDeleting || isUpdating} // Thêm isUpdating vào loading
          getRowId={(row) => row._id}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
        />
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa sách</DialogTitle>
        <DialogContent><DialogContentText>Sếp có chắc chắn muốn xóa cuốn sách này không? Hành động này không thể hoàn tác.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MENU ĐỂ THAY ĐỔI STATUS --- */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseStatusMenu}
      >
        {/* Lấy ra các giá trị của BookStatus để tạo MenuItem */}
        {Object.values(BookStatus).map((statusValue) => (
          <MenuItem
            key={statusValue}
            onClick={() => handleStatusChange(statusValue)}
          >
            {statusValue}
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};