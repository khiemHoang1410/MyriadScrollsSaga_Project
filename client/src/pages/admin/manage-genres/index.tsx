import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DataGrid,type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGenres, useCreateGenre, useUpdateGenre, useDeleteGenre, GenreForm } from '@/features/genre';
import type { Genre } from '@/features/genre';

export const ManageGenresPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | undefined>(undefined);

  const { data: genres, isLoading } = useGenres();
  const { mutate: createGenre, isPending: isCreating } = useCreateGenre();
  const { mutate: updateGenre, isPending: isUpdating } = useUpdateGenre();
  const { mutate: deleteGenre } = useDeleteGenre();

  const handleOpenModal = (genre?: Genre) => {
    setSelectedGenre(genre);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedGenre(undefined);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedGenre) {
      updateGenre({ genreId: selectedGenre._id, data });
    } else {
      createGenre(data);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa thể loại này?')) {
      deleteGenre(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Tên Thể Loại', width: 250 },
    { field: 'description', headerName: 'Mô tả', flex: 1 },
    {
      field: 'actions', type: 'actions', width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Sửa" onClick={() => handleOpenModal(params.row as Genre)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Xóa" onClick={() => handleDelete(params.id as string)} />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Quản Lý Thể Loại</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Thêm Thể Loại
        </Button>
      </Box>

      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid
          rows={genres || []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row._id}
        />
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{selectedGenre ? 'Chỉnh Sửa Thể Loại' : 'Tạo Thể Loại Mới'}</DialogTitle>
        <DialogContent>
          <GenreForm
            onSubmit={handleFormSubmit}
            initialData={selectedGenre}
            isPending={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};