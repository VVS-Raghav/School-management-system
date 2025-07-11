import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

const localizer = momentLocalizer(moment);

export default function ScheduleStudent() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  const formatSchedules = (rawSchedules) => {
    return rawSchedules.map((item) => ({
      id: item._id,
      title: `Subject: ${item.subject.subject_name}, Teacher: ${item.teacher.name}`,
      start: new Date(item.startTime),
      end: new Date(item.endTime)
    }));
  };

  const fetchStudentClassSchedules = async () => {
    try {
      const studentRes = await axios.get(`${baseAPI}/student/fetch-single`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const classId = studentRes.data.student.student_class._id;

      const scheduleRes = await axios.get(`${baseAPI}/schedule/all/${classId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSchedules(formatSchedules(scheduleRes.data.data));
    } catch (err) {
      console.error("Error fetching student schedules", err);
    }
  };

  useEffect(() => {
    fetchStudentClassSchedules();
  }, []);

  return (
    <Box sx={{ px: 3, py: 5 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Your Class Schedule
      </Typography>

      <Calendar
        localizer={localizer}
        events={schedules}
        startAccessor="start"
        endAccessor="end"
        views={['week', 'day', 'agenda']}
        view={view}
        onView={setView}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        style={{ height: 600, border: '1px solid #ccc', borderRadius: '8px' }}
        min={new Date(1970, 1, 1, 8, 0)}
        max={new Date(1970, 1, 1, 19, 0)}
        step={30}
        timeslots={1}
      />
    </Box>
  );
}