import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

const localizer = momentLocalizer(moment);

export default function ScheduleTeacher() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  const formatSchedules = (rawSchedules) => {
    return rawSchedules.map((item) => ({
      id: item._id,
      title: `Subject: ${item.subject.subject_name}, Class: ${item.class.class_text} ${item.class.class_num}`,
      start: new Date(item.startTime),
      end: new Date(item.endTime)
    }));
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${baseAPI}/schedule/teacher`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setSchedules(formatSchedules(response.data.data));
    } catch (err) {
      console.error("Error in fetching schedules", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Teacher Schedule
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
