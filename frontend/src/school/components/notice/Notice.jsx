import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, TextField, Paper, MenuItem, Select,
  InputLabel, FormControl, IconButton, Modal, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { baseAPI } from '../../../environment';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';


export default function NoticeComponent() {
  const [formData, setFormData] = useState({ title: '', message: '', audience: 'All' });
  const [notices, setNotices] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [createMode, setCreateMode] = useState(false);

  const audiences = ['All', 'Students', 'Teachers'];

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${baseAPI}/notice/all`);
      setNotices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [message]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancel = () => {
    setFormData({ title: '', message: '', audience: 'All' });
    setEditId(null);
    setCreateMode(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.patch(`${baseAPI}/notice/update/${editId}`, formData);
        setMessage('Notice updated successfully');
      } else {
        await axios.post(`${baseAPI}/notice/create`, formData);
        setMessage('Notice created successfully');
      }
      setMessageType('success');
      handleCancel();
    } catch (err) {
      console.error('Error submitting notice:', err);
      setMessage('Something went wrong');
      setMessageType('error');
    }
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      message: notice.message,
      audience: notice.audience
    });
    setEditId(notice._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseAPI}/notice/delete/${id}`);
      setMessage('Notice deleted');
      setMessageType('success');
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('Failed to delete');
      setMessageType('error');
    }
  };

  return (

    <Box sx={{ p: 4 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setCreateMode(true)}
        sx={{ mb: 2 }}
      >
        New Notice
      </Button>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      <Modal
        open={createMode || editId}
        onClose={handleCancel}
        aria-labelledby="schedule-modal-title"
        aria-describedby="schedule-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            width: '90%',
            maxWidth: 600,
          }}
        >
          <Typography variant="h5" mb={3} fontWeight={600}>
            {editId ? 'Edit Notice' : 'Create Notice'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              multiline
              rows={9}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Audience</InputLabel>
              <Select
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                label="Audience"
              >
                {audiences.map((aud) => (
                  <MenuItem key={aud} value={aud}>
                    {aud}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <Button variant="outlined" color="secondary" onClick={handleCancel} fullWidth>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                {editId ? 'Update' : 'Publish'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Paper elevation={3} sx={{ mt: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Notices
        </Typography>

        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell sx={{ fontWeight: 'bold'}}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Issued On</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {notices.map((notice) => (
                <TableRow hover key={notice._id}>
                  <TableCell>{notice.title}</TableCell>
                  <TableCell>{notice.message}</TableCell>
                  <TableCell>
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(notice)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(notice._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {notices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No notices available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

    </Box>
  );
}