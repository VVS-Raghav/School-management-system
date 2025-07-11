import React, { useEffect, useState } from 'react';
import { Box, Paper, MenuItem, Select, InputLabel, FormControl, Typography, Table, TableCell, TableRow, TableBody, TableHead, TableContainer, Button, TextField, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import { baseAPI } from '../../../environment';
import Modal from '@mui/material/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


export default function Examinations() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectList, setSubjectList] = useState([]);
  const [exams, setExams] = useState([]);
  const [addExam, setAddExam] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [formData, setFormData] = useState({ subject: '', examType: '', examDate: new Date().toISOString().split('T')[0] });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const columns = [
    { id: 'subject_name', label: 'Subject', minWidth: 130 },
    { id: 'class', label: 'Class', minWidth: 80 },
    {
      id: 'examDate', label: 'Exam Date', minWidth: 140,
      format: (value) => new Date(value).toDateString().slice(4)
    },
    { id: 'examType', label: 'Exam Type', minWidth: 140 },
  ];

  const examTypes = ['Midterm', 'Final', 'Class Test', 'Weekly Test'];

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/all`);
      setClassList(res.data.data);
    } catch (err) {
      console.error('Error fetching class list:', err);
    }
  };

  const fetchExams = async (classId = '') => {
    try {
      const url = classId ? `${baseAPI}/examination/class/${classId}` : `${baseAPI}/examination/all`;
      const res = await axios.get(url);
      const formatted = res.data.exams.map((exam) => ({
        ...exam,
        subject_name: exam.subject.subject_name,
        class: `${exam.class.class_text} ${exam.class.class_num}`,
      }));
      setExams(formatted);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${baseAPI}/subject/all`);
      setSubjectList(res.data.data);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExam) {
        await axios.patch(`${baseAPI}/examination/update/${editExam._id}`, {
          ...formData,
          classId: selectedClass,
        });
        setMessage("Exam updated successfully");
        setMessageType("success");
      } else {
        await axios.post(`${baseAPI}/examination/create`, {
          ...formData,
          classId: selectedClass,
        });
        setMessage("Exam created successfully");
        setMessageType("success");
      }
      handleCancel();
    } catch (err) {
      console.error('Error submitting exam:', err);
      setMessage(editExam ? "Exam update failed. Try again" : "Exam creation failed. Try again");
      setMessageType("error");
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({ ...prev, subject: '', examType: '' }));
    setAddExam(false);
    setEditExam(null);
  }

  const handleEdit = (exam) => {
    setEditExam(exam);
    setFormData({
      examDate: exam.examDate.split('T')[0],
      subject: exam.subject._id,
      examType: exam.examType
    });
  };

  const handleDelete = async (examId) => {
    const confirm = window.confirm('Are you sure you want to delete this examination?');
    if (!confirm) return;
    try {
      const res = await axios.delete(`${baseAPI}/examination/delete/${examId}`);
      setMessage("Exam deleted successfully");
      setMessageType("success");
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage("Exam deletion failed.Try again");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchExams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchExams(selectedClass);
  }, [selectedClass, message]);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Examinations
      </Typography>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            label="Select Class"
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            {classList.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.class_text} {cls.class_num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedClass &&
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setAddExam(true);
            }}
          >
            Add Exam
          </Button>
        }
        {<Modal
          open={addExam || editExam}
          onClose={handleCancel}
          aria-labelledby="schedule-modal-title"
          aria-describedby="schedule-modal-description"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
          >
            <Paper elevation={4} sx={{ p: 4, width: '100%', maxWidth: 480, borderRadius: 3 }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
                {!editExam?"Create New Exam":"Update Exam"}
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}
              >
                <TextField
                  label="Exam Date"
                  name="examDate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.examDate}
                  onChange={handleChange}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    label="Subject"
                  >
                    {subjectList.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.subject_name || s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    label="Exam Type"
                  >
                    {examTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" justifyContent="space-between" gap={2} mt={1}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    sx={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    sx={{ flex: 1 }}
                  >
                    {editExam?"Update":"Submit"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Modal>
        }
      </Box>

      <Paper elevation={3} sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer sx={{ maxHeight: '70vh', borderRadius: 2 }}>
          <Table stickyHeader aria-label="examination table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="center"
                    sx={{
                      minWidth: column.minWidth,
                      fontWeight: 'bold',
                      backgroundColor: '#f1f5f9',
                      color: '#1e293b',
                      borderBottom: '2px solid #e2e8f0',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#f1f5f9',
                    color: '#1e293b',
                    borderBottom: '2px solid #e2e8f0',
                    minWidth: 100,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {exams.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{
                    '&:hover': { backgroundColor: '#f9fafb' },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align="center" sx={{ py: 1.5 }}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton color="primary" onClick={() => handleEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(row._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                    No examinations found
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