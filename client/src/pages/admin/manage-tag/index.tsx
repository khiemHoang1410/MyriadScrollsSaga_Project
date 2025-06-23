import { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DataGrid,type GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, TagForm } from '@/features/tag';
import type { Tag } from '@/features/tag';

export const ManageTagsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  const { data: tags, isLoading } = useTags();
  const { mutate: createTag, isPending: isCreating } = useCreateTag();
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();
  const { mutate: deleteTag } = useDeleteTag();

  const handleOpenModal = (tag?: Tag) => { setSelectedTag(tag); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setSelectedTag(undefined); };
  const handleFormSubmit = (data: any) => {
    if (selectedTag) {
      updateTag({ tagId: selectedTag._id, data });
    } else {
      createTag(data);
    }
    handleCloseModal();
  };
  const handleDelete = (id: string) => { if (window.confirm('Bạn có chắc muốn xóa thẻ này?')) { deleteTag(id); } };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Tên Thẻ', width: 250 },
    { field: 'description', headerName: 'Mô tả', flex: 1 },
    {
      field: 'actions', type: 'actions', width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Sửa" onClick={() => handleOpenModal(params.row as Tag)} />,
        <GridActionsCellItem icon={<DeleteIcon />} label="Xóa" onClick={() => handleDelete(params.id as string)} />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Quản Lý Thẻ (Tags)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Thêm Thẻ</Button>
      </Box>
      <Box sx={{ height: '70vh', width: '100%' }}>
        <DataGrid rows={tags || []} columns={columns} loading={isLoading} getRowId={(row) => row._id}/>
      </Box>
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{selectedTag ? 'Chỉnh Sửa Thẻ' : 'Tạo Thẻ Mới'}</DialogTitle>
        <DialogContent>
          <TagForm onSubmit={handleFormSubmit} initialData={selectedTag} isPending={isCreating || isUpdating}/>
        </DialogContent>
      </Dialog>
    </Box>
  );
};