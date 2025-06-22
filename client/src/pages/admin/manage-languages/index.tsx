import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DataGrid,type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLanguages, useCreateLanguage, useUpdateLanguage, useDeleteLanguage, LanguageForm } from '@/features/language';
import type { Language } from '@/features/language';

export const ManageLanguagesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | undefined>(undefined);

  const { data: languages, isLoading } = useLanguages();
  const { mutate: createLanguage, isPending: isCreating } = useCreateLanguage();
  const { mutate: updateLanguage, isPending: isUpdating } = useUpdateLanguage();
  const { mutate: deleteLanguage } = useDeleteLanguage();

  const handleOpenModal = (lang?: Language) => { setSelectedLanguage(lang); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setSelectedLanguage(undefined); };
  const handleFormSubmit = (data: any) => {
    if (selectedLanguage) {
      updateLanguage({ languageId: selectedLanguage._id, data });
    } else {
      createLanguage(data);
    }
    handleCloseModal();
  };
  const handleDelete = (id: string) => { if (window.confirm('Bạn có chắc muốn xóa ngôn ngữ này?')) { deleteLanguage(id); } };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Tên Ngôn Ngữ', width: 200 },
    { field: 'code', headerName: 'Mã (Code)', width: 100 },
    { field: 'description', headerName: 'Mô tả', flex: 1 },
    {
      field: 'actions', type: 'actions', width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Sửa" onClick={() => handleOpenModal(params.row as Language)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Xóa" onClick={() => handleDelete(params.id as string)} />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Quản Lý Ngôn Ngữ</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Thêm Ngôn Ngữ</Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid rows={languages || []} columns={columns} loading={isLoading} getRowId={(row) => row._id}/>
      </Box>
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{selectedLanguage ? 'Chỉnh Sửa Ngôn Ngữ' : 'Tạo Ngôn Ngữ Mới'}</DialogTitle>
        <DialogContent>
          <LanguageForm onSubmit={handleFormSubmit} initialData={selectedLanguage} isPending={isCreating || isUpdating}/>
        </DialogContent>
      </Dialog>
    </Box>
  );
};