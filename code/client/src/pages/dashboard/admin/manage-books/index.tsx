// client/src/pages/manage-books/index.tsx

import { useState } from 'react';
import {
  Box, Button, Container, Typography, IconButton, Chip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem
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
  type GridRowParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  type GridRowId
} from '@mui/x-data-grid';

import { useBooks } from '@/features/book/useBooks';
import { useDeleteBook } from '@/features/book/useDeleteBook';
import { useUpdateBook } from '@/features/book/useUpdateBook';
import { type Book, BookStatus } from '@/features/book/types';
import { BookPreviewPane } from '@/widgets/BookPreviewPane';

// =================================================================
// 1. CUSTOM TOOLBAR CHO DATAGRID
// =================================================================
/**
 * Toolbar tùy chỉnh để thêm nút "Xóa mục đã chọn".
 * @param props - Props được DataGrid tự động truyền vào, cộng thêm các props tùy chỉnh của ta.
 */
interface CustomToolbarProps {
  onDeleteClick: () => void;
  selectedCount: number;
}

const CustomToolbar = (props: CustomToolbarProps) => {
  return (
    <GridToolbarContainer>
      {/* Các nút mặc định hữu ích của DataGrid */}
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {/* Nút xóa hàng loạt tùy chỉnh, chỉ hiện khi có item được chọn */}
      {props.selectedCount > 0 && (
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={props.onDeleteClick}
          sx={{ ml: 1 }}
        >
          Xóa ({props.selectedCount}) mục
        </Button>
      )}
    </GridToolbarContainer>
  );
}

// =================================================================
// 2. COMPONENT CHÍNH CỦA TRANG
// =================================================================
export const ManageBooksPage = () => {
  // --- A. HOOKS & STATE ---
  const navigate = useNavigate();
  
  // Data fetching hooks
  const { data: booksResponse, isLoading } = useBooks({});
  const { mutate: deleteBookMutate, isPending: isDeleting } = useDeleteBook();
  const { mutate: updateBookMutate, isPending: isUpdating } = useUpdateBook();

  // State cho Master-Detail Layout
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // State cho việc chọn nhiều dòng để xóa
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

  // State cho Menu thay đổi status
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editingBookIdForStatus, setEditingBookIdForStatus] = useState<string | null>(null);
  const isStatusMenuOpen = Boolean(anchorEl);

  // State cho Dialog xác nhận xóa
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookIdToDelete, setBookIdToDelete] = useState<string | null>(null);

  // --- B. HÀM XỬ LÝ SỰ KIỆN ---

  const handleOpenDeleteDialog = (id: string | null) => {
    // Nếu có id, là xóa đơn. Nếu không, là xóa hàng loạt.
    setBookIdToDelete(id);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBookIdToDelete(null);
  };

  const handleConfirmDelete = () => {
    const idsToDelete = selectionModel.length > 0 ? selectionModel : (bookIdToDelete ? [bookIdToDelete] : []);
    if (idsToDelete.length > 0) {
      Promise.all(idsToDelete.map(id => deleteBookMutate(id as string)))
        .then(() => {
          handleCloseDeleteDialog();
          setSelectionModel([]); // Reset selection sau khi xóa thành công
          setSelectedBook(null); // Reset preview
        })
        .catch(console.error);
    }
  };
  
  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, bookId: string) => {
    setAnchorEl(event.currentTarget);
    setEditingBookIdForStatus(bookId);
  };

  const handleCloseStatusMenu = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: BookStatus) => {
    if (editingBookIdForStatus) {
      updateBookMutate({ bookId: editingBookIdForStatus, bookData: { status: newStatus } });
    }
    handleCloseStatusMenu();
  };

  // --- C. ĐỊNH NGHĨA CÁC CỘT CHO DATAGRID ---
  const columns: GridColDef<Book>[] = [
    { field: 'title', headerName: 'Tiêu đề', flex: 1, minWidth: 250 },
    { field: 'author', headerName: 'Tác giả', width: 180, valueGetter: (_, row) => row.author?.username || 'N/A' },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params: GridRenderCellParams<any, Book>) => {
        const status = params.row.status;
        let color: 'success' | 'info' | 'warning' | 'default' | 'error' = 'default';
        if (status === BookStatus.PUBLISHED) color = 'success';
        if (status === BookStatus.IN_REVIEW) color = 'info';
        if (status === BookStatus.DRAFT) color = 'warning';
        if (status === BookStatus.REJECTED) color = 'error';
        return <Chip label={status} color={color} size="small" onClick={(e) => handleOpenStatusMenu(e, params.row._id)} sx={{ cursor: 'pointer', textTransform: 'capitalize' }} />;
      },
    },
    { field: 'createdAt', headerName: 'Ngày tạo', width: 180, valueGetter: (value) => value ? new Date(value as string).toLocaleString('vi-VN') : '' },
    {
      field: 'actions',
      headerName: 'Hành động',
      sortable: false,
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<any, Book>) => (
        <Box>
          <IconButton aria-label="view" title="Xem trang public" onClick={() => navigate(`/books/${params.row.slug}`)}><VisibilityIcon /></IconButton>
          <IconButton aria-label="edit" title="Chỉnh sửa" onClick={() => navigate(`/dashboard/admin/manage-books/edit/${params.row._id}`)}><EditIcon /></IconButton>
          <IconButton aria-label="delete" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(params.row._id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ];

  // --- D. RENDER GIAO DIỆN ---
  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, lg: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Quản lý Sách</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/admin/manage-books/add')}>Thêm Sách Mới</Button>
      </Box>

      <Grid container spacing={3} sx={{ height: { md: 'calc(100vh - 220px)' } }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid<Book>
              rows={booksResponse?.data || []}
              columns={columns}
              loading={isLoading || isDeleting || isUpdating}
              getRowId={(row) => row._id}
              checkboxSelection
              onRowSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
              }}
              rowSelectionModel={selectionModel}
              onRowClick={(params: GridRowParams<Book>) => setSelectedBook(params.row)}
              slots={{ toolbar: CustomToolbar }}
              slotProps={{
                toolbar: {
                  selectedCount: selectionModel.length,
                  onDeleteClick: () => handleOpenDeleteDialog(null),
                },
              }}
              sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <BookPreviewPane book={selectedBook} />
        </Grid>
      </Grid>
      
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sếp có chắc chắn muốn xóa {selectionModel.length > 0 ? `${selectionModel.length} mục này` : 'cuốn sách này'} không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Menu anchorEl={anchorEl} open={isStatusMenuOpen} onClose={handleCloseStatusMenu}>
        {Object.values(BookStatus).map((statusValue) => (
          <MenuItem key={statusValue} onClick={() => handleStatusChange(statusValue)}>
            {statusValue}
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};