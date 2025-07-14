import React, { useEffect, useState } from 'react';
import {Box,Typography,Table,TableBody,TableCell,TableContainer,TableRow,Paper} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

const SchoolDetails = () => {
    const [school, setSchool] = useState(null);
    const [studentCount, setStudentCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schoolRes, studentsRes, teachersRes] = await Promise.all([
                    axios.get(`${baseAPI}/school/fetch-single`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                    axios.get(`${baseAPI}/student/all`),
                    axios.get(`${baseAPI}/teacher/all`),
                ]);

                setSchool(schoolRes.data.school);
                setStudentCount(studentsRes.data.students.length || 0);
                setTeacherCount(teachersRes.data.teachers.length || 0);
            } catch (err) {
                console.error('Failed to load school details', err);
            }
        };

        fetchData();
    }, []);

    if (!school) return <Typography>Loading...</Typography>;

    return (
        <>
            <Typography
                variant="h4"
                textAlign="center"
                fontWeight={700}
                mb={5}
                sx={{
                    background: 'linear-gradient(to right, #004aad, #00bcd4)',
                    color: 'white',
                    py: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    letterSpacing: 1.2
                }}
            >
                🏫 School Details
            </Typography>

            <Box sx={{ px: 3, py: 1, mx: 'auto', mb: '2rem', maxWidth: 800 }}>
                <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
                    <Table>
                        <TableBody>
                            <TableRow sx={{ bgcolor: '#f5faff' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>School Name</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>{school.school_name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Owner Name</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>{school.owner_name}</TableCell>
                            </TableRow>
                            <TableRow sx={{ bgcolor: '#f5faff' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Total Students</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>{studentCount}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Total Teachers</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>{teacherCount}</TableCell>
                            </TableRow>
                            <TableRow sx={{ bgcolor: '#f5faff' }}>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Email</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>{school.email}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '1rem' }}>Registered On</TableCell>
                                <TableCell align="right" sx={{ fontSize: '1rem' }}>
                                    {new Date(school.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </>
    );
};

export default SchoolDetails;