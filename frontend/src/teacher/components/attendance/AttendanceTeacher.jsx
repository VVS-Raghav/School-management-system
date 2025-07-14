import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';


export default function AttendanceTeacher() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isMarked, setIsMarked] = useState('false');

  const fetchAssignedClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/class-teacher`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      const result = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      setClasses(result);
      if (result.length > 0) setSelectedClassId(result[0]._id);
    } catch (err) {
      console.error('Error fetching assigned classes:', err);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const res = await axios.get(`${baseAPI}/student/all`, {
        params: { student_class: classId },
        headers: { Authorization: localStorage.getItem('token') }
      });
      const studentList = res.data.students || [];
      setStudents(studentList);
      const defaultAttendance = {};
      studentList.forEach((s) => {
        defaultAttendance[s._id] = 'Present';
      });
      setAttendance(defaultAttendance);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const attendanceTaken = async (classId) => {
    try {
      const res = await axios.get(`${baseAPI}/attendance/check/${classId}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });

      return res.data.attendanceTaken;
    } catch (err) {
      console.error('Error fetching students:', err);
      return false;
    }
  };

  const handleAttendanceToggle = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClassId) return;
    const attendanceList = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status
    }));
    const payload = {
      date: new Date(),
      attendance: attendanceList
    };
    try {
      const resp = await axios.post(`${baseAPI}/attendance/mark-attendance/${selectedClassId}`, payload, {
        headers: { Authorization: localStorage.getItem('token') },
      });
      setMessageType('success');
      setMessage(resp.data.message);
      setIsMarked(true);
    }
    catch (err) {
      console.error('Error submitting attendance:', err);
      setMessageType('error');
      setMessage('Error submitting attendance.Try again');
    }
  };

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    (async () => {
      const alreadyTaken = await attendanceTaken(selectedClassId);
      if (alreadyTaken) {
        setIsMarked(true);
        setMessage("Attendance already taken for this class");
        setMessageType("warning");
        setStudents([]);
      } else {
        setIsMarked(false);
        fetchStudents(selectedClassId);
      }
    })();
  }, [selectedClassId]);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={600} color="primary" mb={2}>
        Mark Attendance
      </Typography>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      <FormControl sx={{ minWidth: 240, mb: 3 }}>
        <InputLabel>Select Class</InputLabel>
        <Select
          value={selectedClassId}
          label="Select Class"
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.class_text} {cls.class_num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell align="center">
                    <ToggleButtonGroup
                      value={attendance[student._id]}
                      exclusive
                      onChange={(_, newStatus) =>
                        newStatus && handleAttendanceToggle(student._id, newStatus)
                      }
                      size="small"
                      sx={{
                        borderRadius: '1000px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        backgroundColor: attendance[student._id] === 'Present' ? '#9cffa1ff' : '#ff9797ff'
                      }}
                    >
                      <ToggleButton
                        value="Present"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          backgroundColor: attendance[student._id] === 'Present' ? '#2e7d32' : '#ffffffff',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: '#c8e6c9',
                          },
                          borderRadius: 0,
                          px: 3,
                        }}
                      >
                        Present
                      </ToggleButton>

                      <ToggleButton
                        value="Absent"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          backgroundColor: attendance[student._id] === 'Absent' ? '#c62828' : '#fefefeff',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: '#ffcdd2',
                          },
                          borderRadius: 0,
                          px: 3,
                        }}
                      >
                        Absent
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    {isMarked ? "Attendance already taken for today" : "No students found in this class."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <button
          onClick={handleSubmitAttendance}
          style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
          disabled={isMarked}
        >
          Submit Attendance
        </button>
      </Box>
    </Box>
  );
}