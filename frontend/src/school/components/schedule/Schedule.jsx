import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ScheduleEvent from './ScheduleEvent';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import { baseAPI } from '../../../environment';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';


const localizer = momentLocalizer(moment);

export default function Schedule() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newClass, setNewClass] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [schedules, setSchedules] = useState([]);
  const [edit,setEdit] = useState(false);
  const [editEvent,setEditEvent] = useState(null);

  const fetchAllClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/all`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setClasses(res.data.data);
      setSelectedClass(res.data.data[0]._id);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const formatSchedules = (rawSchedules) => {
    return rawSchedules.map((item) => ({
      id: item._id,
      title: `Sub:${item.subject.subject_name} , Teacher:${item.teacher.name}`,
      start: new Date(item.startTime),
      end: new Date(item.endTime)
    }));
  };

  const fetchSchedules = async () => {
    try {
      if (selectedClass) {
        const response = await axios.get(`${baseAPI}/schedule/all/${selectedClass}`);
        setSchedules(formatSchedules(response.data.data));
      }
    } catch (err) {
      console.log("Error in fetching schedules");
    }
  };

  const handleSelectEvent= (e)=>{
    setEdit(true);
    setEditEvent(e.id);
  }

  useEffect(() => {
    fetchAllClasses();
  }, [])

  useEffect(() => {
    fetchSchedules();
  }, [message, selectedClass]);

  return (
    <div style={{ padding: 20, paddingTop: 0 }}>
      <h2 style={{ marginBottom: '10px', color: '#1976d2' }}>Teacher Schedule</h2>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
        <InputLabel id="class-label" shrink>Class</InputLabel>
        <Select
          name="class"
          label="Class"
          onChange={(e) => {
            setSelectedClass(e.target.value);
          }}
          value={selectedClass}
        >
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.class_text} {cls.class_num}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        onClick={() => setNewClass(true)}
        variant="contained"
        color="primary"
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '15px',
          px: 2,
          py: 1,
          mb: 2,
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: '#1976d2',
          ':hover': {
            backgroundColor: '#115293'
          }
        }}
      >
        Add New Session
      </Button>

      {<Modal
        open={newClass || edit}
        onClose={() => setNewClass(false)}
        aria-labelledby="schedule-modal-title"
        aria-describedby="schedule-modal-description"
      >
        <Box>
          <ScheduleEvent setNewClass={setNewClass} selectedClass={selectedClass} setMessageType={setMessageType} setMessage={setMessage} edit={edit} editEvent={editEvent} setEdit={setEdit}/>
        </Box>
      </Modal>

      }
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
        onSelectEvent={handleSelectEvent}
        style={{ height: 600, border: '1px solid #ccc', borderRadius: '8px' }}
        min={new Date(1970, 1, 1, 8, 0)}
        max={new Date(1970, 1, 1, 19, 0)}
      />
    </div>
  );
}
