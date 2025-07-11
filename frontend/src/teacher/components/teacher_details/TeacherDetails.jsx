import React, { useEffect, useState } from 'react';
import {Box,Paper,Typography,Table,TableBody,TableCell,TableContainer,TableRow,CardMedia} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

export default function TeacherDetails() {
  const [teacher, setTeacher] = useState(null);

  const fetchTeacherData = async () => {
    try {
      const res = await axios.get(`${baseAPI}/teacher/fetch-single`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTeacher(res.data.data);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  if (!teacher) {
    return (
      <Typography variant="h6" align="center" color="error" mt={4}>
        Failed to load teacher data.
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
        Teacher Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, width: '100%', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5 }}>
          <CardMedia
            component="img"
            image={`/images/${teacher.teacher_image}`}
            alt={teacher.name}
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
                <TableCell align="left" sx={{ fontWeight: 600, width: '40%' }}>Name</TableCell>
                <TableCell align="right">{teacher.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell align="right">{teacher.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Qualification</TableCell>
                <TableCell align="right">{teacher.qualification}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell align="right">{teacher.gender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Age</TableCell>
                <TableCell align="right">{teacher.age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 600 }}>Joined On</TableCell>
                <TableCell align="right">
                  {new Date(teacher.createdAt).toLocaleDateString('en-IN', {
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