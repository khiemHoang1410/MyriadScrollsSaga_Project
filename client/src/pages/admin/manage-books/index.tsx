// client/src/pages/dashboard/admin/manage-books/index.tsx

import { useState } from 'react';
import {
  Box, Button, Typography, IconButton, Chip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams
} from '@mui/x-data-grid';

import { useBooks } from '@/features/book/useBooks';
import { useDeleteBook } from '@/features/book/useDeleteBook';
import { useUpdateBook } from '@/features/book/useUpdateBook';
import { type Book, BookStatus } from '@/features/book/types';
import { BookPreviewPane } from '@/widgets/BookPreviewPane';
import { paths } from '@/shared/config/paths';
import { useSmoothLoading } from '@/shared/hooks';

// =================================================================
// COMPONENT CHÍNH CỦA TRANG - PHIÊN BẢN TINH GỌN
// =================================================================
export const ManageBooksPage = () => {
  // --- A. HOOKS & STATE ---
  const navigate = useNavigate();
  const { data: booksResponse, isLoading: isFetchingBooks } = useBooks({});
  const { mutate: deleteBookMutate, isPending: isDeleting } = useDeleteBook();
  const { mutate: updateBookMutate, isPending: isUpdating } = useUpdateBook();

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isStatusMenuOpen = Boolean(statusMenuAnchorEl);

  // --- B. HÀM XỬ LÝ SỰ KIỆN ---

  const handleOpenDeleteDialog = (id: string) => {
    setActiveBookId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setActiveBookId(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (activeBookId) {
      deleteBookMutate(activeBookId, {
        onSuccess: () => {
          handleCloseDeleteDialog();
          setSelectedBook(null); // Reset preview nếu sách đang được preview bị xóa
        },
      });
    }
  };

  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, bookId: string) => {
    setStatusMenuAnchorEl(event.currentTarget);
    setActiveBookId(bookId);
  };

  const handleCloseStatusMenu = () => setStatusMenuAnchorEl(null);


  const handleStatusChange = (newStatus: BookStatus) => {
    if (activeBookId) {
      updateBookMutate({ bookId: activeBookId, bookData: { status: newStatus } });
    }
    handleCloseStatusMenu();
  };

  // STEP 2: Gom tất cả các trạng thái loading lại
  const isDataLoading = isFetchingBooks || isDeleting || isUpdating;
  // Dùng hook mới để tạo ra trạng thái loading "mượt"
  const showSmoothLoading = useSmoothLoading(isDataLoading, 600); // 600ms

  // --- C. ĐỊNH NGHĨA CÁC CỘT CHO DATAGRID ---
  const columns: GridColDef<Book>[] = [
    { field: 'title', headerName: 'Tiêu đề', flex: 1, minWidth: 250 },
    { field: 'author', headerName: 'Tác giả', width: 180, valueGetter: (_, row) => row.author?.username || 'N/A' },
    {
      field: 'status', headerName: 'Trạng thái', width: 150,
      renderCell: (params: GridRenderCellParams<Book, BookStatus>) => {
        const status = params.row.status;
        let color: 'success' | 'info' | 'warning' | 'default' | 'error' = 'default';
        if (status === BookStatus.PUBLISHED) color = 'success';
        if (status === BookStatus.IN_REVIEW) color = 'info';
        if (status === BookStatus.DRAFT) color = 'warning';
        if (status === BookStatus.REJECTED) color = 'error';
        return <Chip label={status} color={color} size="small" onClick={(e) => handleOpenStatusMenu(e, params.row._id)} sx={{ cursor: 'pointer', textTransform: 'capitalize' }} />;
      },
    },
    { field: 'createdAt', headerName: 'Ngày tạo', width: 180, type: 'dateTime', valueGetter: (value) => value ? new Date(value as string) : null },
    {
      field: 'actions', headerName: 'Hành động', sortable: false, width: 150, align: 'center', headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Book>) => (
        <Box>
          <IconButton aria-label="view" title="Xem trang public" onClick={() => navigate(`/books/${params.row.slug}`)}><VisibilityIcon /></IconButton>
          <IconButton aria-label="edit" title="Chỉnh sửa" onClick={() => navigate(paths.admin.editBook(params.row._id))}><EditIcon /></IconButton>
          <IconButton aria-label="delete" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(params.row._id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ];

  // --- D. RENDER GIAO DIỆN ---
  return (
    <Box>


      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Quản lý Sách</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(paths.admin.addBook)}>Thêm Sách Mới</Button>
      </Box>

      <Grid container spacing={3} sx={{ height: { md: 'calc(100vh - 220px)' } }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid<Book>
              rows={booksResponse?.data || []}
              columns={columns}
              loading={showSmoothLoading || isDeleting || isUpdating}
              getRowId={(row) => row._id}
              onRowClick={(params: GridRowParams<Book>) => setSelectedBook(params.row)}
              sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
              slotProps={{
                loadingOverlay: {
                  variant: 'linear-progress',
                  noRowsVariant: 'linear-progress',
                },
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <BookPreviewPane book={selectedBook} />
        </Grid>
      </Grid>

      {/* Dialog và Menu vẫn giữ nguyên */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent><DialogContentText>
          Sếp có chắc chắn muốn xóa cuốn sách này không? Hành động này không thể hoàn tác.
        </DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>
      <Menu anchorEl={statusMenuAnchorEl} open={isStatusMenuOpen} onClose={handleCloseStatusMenu}>
        {Object.values(BookStatus).map((statusValue) => (
          <MenuItem key={statusValue} onClick={() => handleStatusChange(statusValue)}>
            {statusValue}
          </MenuItem>
        ))}
      </Menu>

    </Box>

  );
};