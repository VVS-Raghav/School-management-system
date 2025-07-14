import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import axios from 'axios';
import { baseAPI } from '../../../environment';

const SchoolStats = () => {
    const [studentCount, setStudentCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [classwiseData, setClasswiseData] = useState([]);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 6;
    const totalPages = Math.ceil(classwiseData.length / ITEMS_PER_PAGE);


    const fetchData = async () => {
        try {
            const [studentsRes, teachersRes, classesRes] = await Promise.all([
                axios.get(`${baseAPI}/student/all`),
                axios.get(`${baseAPI}/teacher/all`),
                axios.get(`${baseAPI}/class/all`)
            ]);

            const students = studentsRes.data.students;
            const teachers = teachersRes.data.teachers;
            const classes = classesRes.data.data;

            setStudentCount(students.length);
            setTeacherCount(teachers.length);

            const classCounts = classes.map(cls => {
                const count = students.filter(s => s.student_class._id === cls._id).length;
                return {
                    class: `${cls.class_text} ${cls.class_num}`,
                    count
                };
            });

            setClasswiseData(classCounts);
        } catch (err) {
            console.error('Error fetching data for charts', err);
        }
    };

    const paginatedData = classwiseData.slice(
        page * ITEMS_PER_PAGE,
        (page + 1) * ITEMS_PER_PAGE
    );

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box sx={{ px: 3, py: 5 }}>
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
                }}
            >
                📈 School Statistics
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 4,
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        flex: '1 1 380px',
                        maxWidth: 600,
                        minWidth: 300,
                        p: 4,
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h6" gutterBottom textAlign="center">
                        Students vs Teachers
                    </Typography>
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart
                            data={[{ label: 'Counts', Students: studentCount, Teachers: teacherCount }]}
                            barGap={85}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Students" fill="#1976d2" barSize={60} />
                            <Bar dataKey="Teachers" fill="#f50057" barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper
                    elevation={4}
                    sx={{
                        flex: '1 1 380px',
                        maxWidth: 600,
                        minWidth: 300,
                        p: 4,
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h6" gutterBottom textAlign="center">
                        Students in Each Class (Page {page + 1} of {totalPages})
                    </Typography>
                    <ResponsiveContainer width="100%" height={362}>
                        <BarChart data={paginatedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="class" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#00b894" barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            disabled={page === 0}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default SchoolStats;