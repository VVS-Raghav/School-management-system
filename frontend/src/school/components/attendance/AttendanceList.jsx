import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, MenuItem, Select, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';
import { baseAPI } from '../../../environment';


export default function StudentsAttendanceTable() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [params, setParams] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');

  const handleClass = async (e) => {
    setSelectedClass(e.target.value);
    setParams((prev) => ({
      ...prev,
      student_class: e.target.value || undefined,
    }))

    try {
      const resp = await axios.get(`${baseAPI}/class/${e.target.value}`);
      const teacherId = resp.data.data.class_teacher._id;
      setSelectedTeacher(teacherId || null);
    } catch (error) {
      console.error("Failed to fetch class teacher", error);
      setSelectedTeacher(null);
    }
  }

  const handleSearch = (e) => {
    setParams((prev) => ({
      ...prev,
      search: e.target.value || undefined,
    }))
  }

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/all`);
      setClasses(res.data.data);
    } catch (err) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${baseAPI}/student/all`, { params });
      const studentsWithAttendance = await Promise.all(
        response.data.students.map(async (s) => {
          try {
            const res = await axios.get(`${baseAPI}/attendance/student/${s._id}`);
            const records = res.data.data || [];
            const presentCount = records.filter(r => r.status === 'Present').length;
            const percentage = records.length ? Math.round((presentCount / records.length) * 100) : 0;
            return { ...s, attendancePercentage: percentage };
          } catch {
            return { ...s, attendancePercentage: 0 };
          }
        })
      );
      setStudents(studentsWithAttendance);
    } catch (err) {
      console.error("Failed to fetch students with attendance", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${baseAPI}/teacher/all`, { params });
      setTeachers(response.data.teachers);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  const handleAssignTeacher = async () => {
    try {
      await axios.patch(`${baseAPI}/class/update/${selectedClass}`, { class_teacher: selectedTeacher });
      setMessage("Class teacher assigned successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Failed to assign class teacher", error);
      setMessage("Failed to assign class teacher.Try again");
      setMessageType("error");
    }
  };

  const handleClose = () => {
    setMessage("");
  }

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [params]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e3f2fd, #bbdefb)',
        py: 4,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}
      <Box display="flex" alignItems="center" gap={1} mb={3} justifyContent="center">
        <SchoolIcon sx={{ fontSize: 40, color: '#0d47a1' }} />
        <Typography variant="h4" sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
          Students Attendance
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexGrow: 1 }}>
        <Box
          sx={{
            width: '25%',
            minWidth: 250,
            backgroundColor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
            Filters
          </Typography>
          <TextField
            label="Search"
            variant="outlined"
            onChange={handleSearch}
            size="small"
            fullWidth
          />
          <FormControl fullWidth size="small">
            <InputLabel id="class-label">Class</InputLabel>
            <Select
              labelId="class-label"
              defaultValue=""
              label="Class"
              onChange={handleClass}
            >
              <MenuItem value="">Any</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.class_text} {cls.class_num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedClass &&
            <>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mt: 3 }}>
                {selectedTeacher ? "Change Class Teacher" : "Assign Class Teacher"}
              </Typography>

              <FormControl fullWidth size="small">
                {!selectedTeacher && <InputLabel id="teacher-label">Select Teacher</InputLabel>}
                <Select
                  labelId="teacher-label"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="contained" color="primary" onClick={handleAssignTeacher}>
                Assign
              </Button>
            </>}
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: 'white',
            p: 2,
            borderRadius: 2,
            boxShadow: 2,
            overflow: 'auto',
          }}
        >
          <TableContainer sx={{ maxHeight: '80vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Guardian</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Guardian Phone</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Class</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance (%)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
                  <TableRow hover key={s._id}>
                    <TableCell align="center">{s.name}</TableCell>
                    <TableCell align="center">{s.guardian}</TableCell>
                    <TableCell align="center">{s.guardian_phone}</TableCell>
                    <TableCell align="center">{s.student_class?.class_text} {s.student_class?.class_num}</TableCell>
                    <TableCell align="center">{s.attendancePercentage || 0}%</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" color="primary">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
    </Box>

  );
}