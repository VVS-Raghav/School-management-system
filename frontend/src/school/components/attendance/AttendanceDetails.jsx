import React, { useEffect, useState } from 'react';
import {Box, Typography, Paper, CircularProgress, List,Card, CardContent, Stack, Chip} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useParams } from 'react-router-dom';
import { baseAPI } from '../../../environment';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const COLORS = ['#4caf50', '#f44336'];

export default function AttendanceDetails() {
  const { id } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [student, setStudent] = useState(null);

  const fetchAttendanceDetails = async () => {
    try {
      const [studentRes, attendanceRes] = await Promise.all([
        axios.get(`${baseAPI}/student/fetch/${id}`),
        axios.get(`${baseAPI}/attendance/student/${id}`)
      ]);
      setStudent(studentRes.data.student);
      setAttendance(attendanceRes.data.data || []);
    } catch (error) {
      console.error("Failed to load student or attendance", error);
    }
  };

  useEffect(() => {
    fetchAttendanceDetails();
  }, [id]);

  if (!student) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  const mockRecords = [
    { date: new Date(), status: 'Present' },
    { date: new Date(Date.now() - 86400000), status: 'Absent' },
    { date: new Date(Date.now() - 2 * 86400000), status: 'Present' },
  ];

  const present = attendance.filter(r => r.status === 'Present').length;
  const absent = attendance.filter(r => r.status === 'Absent').length;

  const pieData = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent }
  ];

  const recentAttendance = attendance.slice(0, 10);

  return (
    <Box sx={{ px: 4, py: 5, minHeight: '100vh', background: '#f1f8ff' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#0d47a1', mb: 2 }}>
        {student.name}'s Attendance Overview
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Left Panel: Details + Chart */}
        <Box sx={{ flex: 1, minWidth: 300, maxWidth: 500 }}>
          <Paper elevation={3} sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.8 }}>
              Student Details
            </Typography>
            <Typography><strong>Guardian:</strong> {student.guardian}</Typography>
            <Typography><strong>Phone:</strong> {student.guardian_phone}</Typography>
            <Typography>
              <strong>Class:</strong> {student.student_class?.class_text} {student.student_class?.class_num}
            </Typography>
            <Typography><strong>Total Days:</strong> {attendance.length}</Typography>
            <Typography><strong>Present:</strong> {present}</Typography>
            <Typography><strong>Absent:</strong> {absent}</Typography>
            <Typography>
              <strong>Attendance %:</strong> {attendance.length ? Math.round((present / attendance.length) * 100) : 0}%
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
              Attendance Chart
            </Typography>

            <PieChart width={450} height={300}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </Paper>

        </Box>

        {/* Right Panel: Attendance History */}
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>
              Attendance History (Last 10 Days)
            </Typography>
            <List>
              <Stack spacing={1}>
                {recentAttendance.map((record, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      px: 1,
                      py: 0.5,
                      bgcolor: '#f9fbfc',
                      boxShadow: 0,
                      borderRadius: 1,
                    }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        '&:last-child': { pb: 1 }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 17 }}>
                        {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                      <Chip
                        size="medium"
                        label={record.status}
                        icon={
                          record.status === 'Present' ? (
                            <CheckCircleIcon fontSize="small" />
                          ) : (
                            <CancelIcon fontSize="small" />
                          )
                        }
                        color={record.status === 'Present' ? 'success' : 'error'}
                        variant="contain"
                      />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
              {recentAttendance.length === 0 && (
                <Typography variant="body2" color="text.secondary">No attendance records available.</Typography>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
