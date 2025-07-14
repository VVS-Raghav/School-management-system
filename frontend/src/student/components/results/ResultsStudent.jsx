import React, { useEffect, useState } from 'react';
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem,
    Paper, Table, TableContainer, TableHead, TableRow, TableCell,
    TableBody, Divider
} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
};

const ResultsStudent = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [result, setResult] = useState(null);

    const fetchStudent = async () => {
        try {
            const res = await axios.get(`${baseAPI}/student/fetch-single`, {
                headers: { Authorization: localStorage.getItem('token') },
            });
            const studentData = res.data.student;

            const examRes = await axios.get(`${baseAPI}/examination/class/${studentData.student_class._id}`);
            setExams(examRes.data.exams);
        } catch (err) {
            console.error('Error fetching student or exams:', err);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, []);

    const fetchResult = async () => {
        try {
            const res = await axios.get(`${baseAPI}/result/student/${selectedExamId}`, {
                headers: { Authorization: localStorage.getItem('token') }
            });
            setResult(res.data.data || null);
        } catch (err) {
            console.error('Error fetching result:', err);
            setResult(null);
        }
    };


    useEffect(() => {
        if (selectedExamId) fetchResult();
    }, [selectedExamId]);

    const chartData = result?.subjectMarks.map(mark => ({
        name: mark.subject.subject_name,
        Marks: mark.marksObtained,
    })) || [];

    let grade, percentage, status;

    return (
        <Box sx={{ p: 4 }}>
  <Typography variant="h5" fontWeight={600} gutterBottom>
    Exam Results
  </Typography>

  <FormControl fullWidth sx={{ maxWidth: 400, mb: 3 }}>
    <InputLabel>Select Exam</InputLabel>
    <Select
      value={selectedExamId}
      label="Select Exam"
      onChange={(e) => setSelectedExamId(e.target.value)}
    >
      {exams.map(exam => (
        <MenuItem key={exam._id} value={exam._id}>
          {exam.examType} - {exam.examSession}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  {result ? (
    <>
      {/* ====== MARKS TABLE ====== */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>Marks Table</Typography>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Subject</strong></TableCell>
                <TableCell align="center"><strong>Marks Obtained</strong></TableCell>
                <TableCell align="center"><strong>Out of</strong></TableCell>
                <TableCell align="center"><strong>Percentage</strong></TableCell>
                <TableCell align="center"><strong>Grade</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {result.subjectMarks.map(({ subject, marksObtained }) => {
                const subjectPercentage = Math.round((marksObtained / result.totalMarks) * 100);
                const subjectGrade = getGrade(subjectPercentage);

                return (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.subject_name}</TableCell>
                    <TableCell align="center">{marksObtained}</TableCell>
                    <TableCell align="center">{result.totalMarks}</TableCell>
                    <TableCell align="center">{subjectPercentage}%</TableCell>
                    <TableCell align="center">{subjectGrade}</TableCell>
                  </TableRow>
                );
              })}

              {/* ====== OVERALL ROW ====== */}
              {(() => {
                const totalSubjects = result.subjectMarks.length;
                const totalObtained = result.subjectMarks.reduce((sum, s) => sum + s.marksObtained, 0);
                const maxPossible = result.totalMarks * totalSubjects;
                const overallPercentage = Math.round((totalObtained / maxPossible) * 100);
                const overallGrade = getGrade(overallPercentage);
                percentage = overallPercentage;
                grade = overallGrade;
                status = overallPercentage >= 40 ? "Pass" : "Fail";

                return (
                  <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableCell><strong>Overall</strong></TableCell>
                    <TableCell align="center"><strong>{totalObtained}</strong></TableCell>
                    <TableCell align="center"><strong>{maxPossible}</strong></TableCell>
                    <TableCell align="center"><strong>{overallPercentage}%</strong></TableCell>
                    <TableCell align="center"><strong>{overallGrade}</strong></TableCell>
                  </TableRow>
                );
              })()}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={4}>
          <Typography>Percentage: <strong>{percentage}%</strong></Typography>
          <Typography>Grade: <strong>{grade}</strong></Typography>
          <Typography>
            Status:{" "}
            <strong style={{ color: status === 'Pass' ? 'green' : 'red' }}>
              {status}
            </strong>
          </Typography>
        </Box>
      </Paper>

      {/* ====== BAR CHART ====== */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Subject-wise Performance
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Marks" fill="#1976d2" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* ====== REMARKS ====== */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" mb={2}>
          Remarks
        </Typography>
        {(() => {
          const subjectStats = result.subjectMarks.map(({ subject, marksObtained }) => ({
            name: subject.subject_name,
            percentage: Math.round((marksObtained / result.totalMarks) * 100),
          }));

          const lowSubjects = [...subjectStats]
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 2)
            .map(s => s.name);

          const hasTopScore = subjectStats.some(s => s.percentage >= 90);

          return (
            <Box>
              {hasTopScore && (
                <Typography gutterBottom sx={{ color: 'green', fontWeight: 500 }}>
                  🎉 Great job! You've scored an A+ in at least one subject. Keep up the excellent work!
                </Typography>
              )}
              {lowSubjects.length > 0 && (
                <Typography sx={{ color: '#ff3e3eff', fontWeight: 500 }}>
                  📘 Try to focus more on{" "}
                  <strong>{lowSubjects.join(" and ")}</strong> to improve your overall performance.
                </Typography>
              )}
            </Box>
          );
        })()}
      </Paper>
    </>
  ) : (
    selectedExamId && (
      <Typography color="text.secondary" mt={3}>
        Results not yet published for this exam.
      </Typography>
    )
  )}
</Box>
    );
};

export default ResultsStudent;
