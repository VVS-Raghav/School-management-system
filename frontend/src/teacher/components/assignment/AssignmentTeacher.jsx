import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { baseAPI } from '../../../environment';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';


export default function AssignmentUpload() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(dayjs().format('YYYY-MM-DD'));
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const fileInputRef = useRef();

  useEffect(() => {
    axios.get(`${baseAPI}/class/all`)
      .then(res => setClasses(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('deadline', deadline);
    formData.append('file', file);
    formData.append('classId', selectedClassId);

    try {
      const res = await axios.post(`${baseAPI}/assignment/upload`, formData);
      setMessage(res.data.message);
      setMessageType('success')
      setTitle('');
      setDeadline(dayjs().format('YYYY-MM-DD'));
      setFile(null);
      setSelectedClassId('');
      fileInputRef.current.value = '';
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Assignment</Typography>
      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Deadline"
          type="date"
          fullWidth
          required
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="class-select-label">Select Class</InputLabel>
          <Select
            labelId="class-select-label"
            value={selectedClassId}
            label="Select Class"
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls._id}>{cls.class_text} {cls.class_num}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
          ref={fileInputRef}
          style={{ marginBottom: 16 }}
        />
        <Button type="submit" variant="contained">Upload</Button>
      </form>
    </Box>
  );
}