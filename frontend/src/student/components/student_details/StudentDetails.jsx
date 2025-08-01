import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableRow, CardMedia } from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

export default function StudentDetails() {
  const [student, setStudent] = useState(null);

  const fetchStudentData = async () => {
    try {
      const res = await axios.get(`${baseAPI}/student/fetch-single`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStudent(res.data.student);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (!student) {
    return (
      <Typography variant="h6" align="center" color="error" mt={4}>
        Failed to load student data.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        px: 3,
        py: 5,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
      }}
    >
      <Typography
        variant="h4"
        fontWeight={700}
        color="primary"
        sx={{
          mb: 3,
          textAlign: 'center',
          background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 1,
        }}
      >
        Student Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, width: '100%', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5 }}>
          <CardMedia
            component="img"
            image={`${student.student_image}`}
            alt={student.name}
            sx={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #1976d2',
              mb: 2,
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: '40%' }}>Name</TableCell>
                <TableCell align="right">{student.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell align="right">
                  {student.student_class.class_text} {student.student_class.class_num}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell align="right">{student.gender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                <TableCell align="right">{student.age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell align="right">{student.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Guardian Name</TableCell>
                <TableCell align="right">{student.guardian}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Guardian Phone</TableCell>
                <TableCell align="right">{student.guardian_phone}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Admitted On</TableCell>
                <TableCell align="right">
                  {new Date(student.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}