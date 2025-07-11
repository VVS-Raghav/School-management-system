import React, { useEffect, useState } from 'react';
import {
  Box, Paper, MenuItem, Select, InputLabel, FormControl,
  Typography, Table, TableCell, TableRow, TableBody,
  TableHead, TableContainer
} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

export default function ExaminationsTeacher() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [exams, setExams] = useState([]);

  const columns = [
    { id: 'subject_name', label: 'Subject', minWidth: 130 },
    { id: 'class', label: 'Class', minWidth: 80 },
    {
      id: 'examDate', label: 'Exam Date', minWidth: 140,
      format: (value) => new Date(value).toDateString().slice(4)
    },
    { id: 'examType', label: 'Exam Type', minWidth: 140 },
  ];

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/all`, {
        headers: { Authorization: localStorage.getItem('token') },
      });
      setClassList(res.data.data);
    } catch (err) {
      console.error('Error fetching class list:', err);
    }
  };

  const fetchExams = async (classId = '') => {
    try {
      const url = classId ? `${baseAPI}/examination/class/${classId}` : `${baseAPI}/examination/all`;
      const res = await axios.get(url, {
        headers: { Authorization: localStorage.getItem('token') },
      });
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

  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  useEffect(() => {
    fetchExams(selectedClass);
  }, [selectedClass]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} color="primary" mb={2}>
        Examinations
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControl fullWidth sx={{ maxWidth: 175 }}>
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
      </Box>

      <Paper
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 3,
        }}
      >
        <TableContainer sx={{ maxHeight: '66vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      minWidth: column.minWidth,
                      backgroundColor: '#f1f5f9',
                      color: '#1e293b',
                      borderBottom: '2px solid #e2e8f0',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
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
                </TableRow>
              ))}

              {exams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 3, fontStyle: 'italic', color: 'text.secondary' }}
                  >
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
