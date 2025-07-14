import React, { useEffect, useState } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button
} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';


const ResultsTeacher = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [students, setStudents] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [totalMarksData, setTotalMarksData] = useState({});
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

  // Fetch all classes on mount
  useEffect(() => {
    axios.get(`${baseAPI}/class/all`)
      .then(res => setClasses(res.data.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch exams for selected class
  useEffect(() => {
    if (selectedClass) {
      axios.get(`${baseAPI}/examination/class/${selectedClass}`)
        .then(res => setExams(res.data.exams))
        .catch(err => console.error(err));
    }
  }, [selectedClass]);

  // Fetch students and exam subject info on exam change
  useEffect(() => {
    if (selectedExam && selectedClass) {
      Promise.all([
        axios.get(`${baseAPI}/student/all`, { params: { student_class: selectedClass } }),
        axios.get(`${baseAPI}/examination/id/${selectedExam}`)
      ])
        .then(([studentsRes, examRes]) => {
          setStudents(studentsRes.data.students);
          setExamSubjects(examRes.data.exam.subjects || []);
        })
        .catch(err => console.error('Error fetching students/exam:', err));
    }
  }, [selectedExam]);

  const handleMarksChange = (studentId, subjectId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: Number(value),
      }
    }));
  };

  const handleTotalMarksChange = (studentId, value) => {
    setTotalMarksData(prev => ({
      ...prev,
      [studentId]: Number(value)
    }));
  };

  const handleSubmit = async () => {
    const resultPayload = {
      examId: selectedExam,
      results: students.map(student => ({
        studentId: student._id,
        subjectMarks: examSubjects.map(({ subject }) => ({
          subject: subject._id,
          marksObtained: Number(marksData?.[student._id]?.[subject._id]) || 0
        })),
        totalMarks: Number(totalMarksData?.[student._id]) || 0
      }))
    };

    try {
      await axios.post(`${baseAPI}/result/upload`, resultPayload);
      setMessage("Results uploaded successfully");
      setMessageType("success");
    } catch (err) {
      console.error('Error uploading results:', err);
      setMessage(err.response.data.message);
      setMessageType("error");
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Upload Exam Results
      </Typography>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      <Box display="flex" gap={3} mb={4}>
        <FormControl fullWidth>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={e => {
              setSelectedClass(e.target.value);
              setSelectedExam('');
              setStudents([]);
              setMarksData({});
              setExamSubjects([]);
              setTotalMarksData({});
            }}
          >
            {classes.map(cls => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.class_text} {cls.class_num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedClass}>
          <InputLabel>Exam</InputLabel>
          <Select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
            {exams.map(exam => (
              <MenuItem key={exam._id} value={exam._id}>
                {`${exam.examType} - ${exam.examSession}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedExam && students.length > 0 && examSubjects.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  {examSubjects.map(({ subject }) => (
                    <TableCell key={subject._id}>{subject.subject_name}</TableCell>
                  ))}
                  <TableCell>Total Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    {examSubjects.map(({ subject }) => (
                      <TableCell key={subject._id}>
                        <TextField
                          size="small"
                          type="number"
                          value={marksData?.[student._id]?.[subject._id] || ''}
                          onChange={e =>
                            handleMarksChange(student._id, subject._id, e.target.value)
                          }
                          placeholder="Marks"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={totalMarksData?.[student._id] || ''}
                        onChange={e =>
                          handleTotalMarksChange(student._id, e.target.value)
                        }
                        placeholder="Total"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3} textAlign="right">
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Submit Results
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ResultsTeacher;