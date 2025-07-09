import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Button, Typography } from '@mui/material';
import { useFormik } from 'formik';
import axios from 'axios';
import { sessionSchema } from '../../../yupSchema/sessionSchema';
import { baseAPI } from '../../../environment';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


export default function ScheduleEvent({ setNewClass, selectedClass, setMessage, setMessageType, edit, setEdit, editEvent }) {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const fetchTeachers = async () => {
        try {
            const res = await axios.get(`${baseAPI}/teacher/all`, {
                headers: { Authorization: localStorage.getItem('token') }
            });
            setTeachers(res.data.teachers);
        } catch (err) {
            console.error("Failed to fetch teachers:", err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${baseAPI}/subject/all`, {
                headers: { Authorization: localStorage.getItem('token') }
            });
            setSubjects(res.data.data);
        } catch (err) {
            console.error("Failed to fetch subjects:", err);
        }
    };

    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (edit && editEvent) {
            axios.get(`${baseAPI}/schedule/fetch-single/${editEvent}`, {
                headers: { Authorization: localStorage.getItem('token') },
            })
                .then((resp) => {
                    const data = resp.data.data;
                    formik.setValues({
                        teacher: data.teacher,
                        subject: data.subject,
                        date: dayjs(data.startTime),
                        startTime: dayjs(data.startTime),
                        endTime: dayjs(data.endTime),
                    });
                })
                .catch((err) => {
                    console.error('Failed to fetch schedule for edit:', err);
                });
        }
    }, [edit, editEvent]);

    const handleDelete = async () => {
        try {
            if(!window.confirm("Are you sure you want to delete this session?"))return;
            await axios.delete(`${baseAPI}/schedule/delete/${editEvent}`, {
                headers: { Authorization: localStorage.getItem('token') }
            });
            setMessage('Schedule deleted successfully');
            setMessageType('success');
            cancelForm();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to delete schedule');
            setMessageType('error');
        }
    };

    const formik = useFormik({
        initialValues: {
            teacher: '',
            subject: '',
            date: dayjs(),
            startTime: dayjs().hour(9).minute(0),
            endTime: dayjs().hour(10).minute(0),
        },
        validationSchema: sessionSchema,
        onSubmit: async (values) => {
            try {
                const { startTime, endTime, date, ...rest } = values;
                const fullStart = dayjs(date).set('hour', dayjs(startTime).hour()).set('minute', dayjs(startTime).minute());
                const fullEnd = dayjs(date).set('hour', dayjs(endTime).hour()).set('minute', dayjs(endTime).minute());

                const payload = {
                    ...rest,
                    selectedClass,
                    startTime: fullStart.toISOString(),
                    endTime: fullEnd.toISOString(),
                };

                const config = { headers: { Authorization: localStorage.getItem('token') } };

                if (edit) {
                    await axios.patch(`${baseAPI}/schedule/update/${editEvent}`, payload, config);
                    setMessage('Session updated successfully');
                } else {
                    await axios.post(`${baseAPI}/schedule/create`, payload, config);
                    setMessage('Session scheduled successfully');
                }
                setMessage('Session scheduled successfully');
                setMessageType('success');
                cancelForm();
            } catch (err) {
                setMessage(err.response?.data?.message || 'Error scheduling session');
                setMessageType('error');
            }
        }
    });

    const cancelForm = () => {
        formik.resetForm();
        setNewClass(false);
        setEdit(false);
    };

    return (
        <Box
            sx={{
                maxWidth: 600,
                mx: 'auto',
                mt: 4,
                p: { xs: 3, sm: 4 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 6,
            }}
        >

            <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}
            >
                {edit ? 'Edit Session' : 'Schedule a Session'}
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="teacher-label">Teacher</InputLabel>
                    <Select
                        labelId="teacher-label"
                        name="teacher"
                        value={formik.values.teacher}
                        label="Teacher"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                    >
                        {teachers.map((t) => (
                            <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                        ))}
                    </Select>
                    {formik.touched.teacher && formik.errors.teacher && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formik.errors.teacher}</Typography>
                    )}
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="subject-label">Subject</InputLabel>
                    <Select
                        labelId="subject-label"
                        name="subject"
                        value={formik.values.subject}
                        label="Subject"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.subject && Boolean(formik.errors.subject)}
                    >
                        {subjects.map((s) => (
                            <MenuItem key={s._id} value={s._id}>{s.subject_name}</MenuItem>
                        ))}
                    </Select>
                    {formik.touched.subject && formik.errors.subject && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>{formik.errors.subject}</Typography>
                    )}
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 2.5 }}>

                        <DatePicker
                            label="Date"
                            value={formik.values.date}
                            onChange={(value) => formik.setFieldValue('date', dayjs(value))}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />

                        <TimePicker
                            label="Start Time"
                            value={formik.values.startTime}
                            onChange={(value) => formik.setFieldValue('startTime', dayjs(value))}
                            minutesStep={30}
                        />

                        <TimePicker
                            label="End Time"
                            value={formik.values.endTime}
                            onChange={(value) => formik.setFieldValue('endTime', dayjs(value))}
                            minutesStep={30}
                        />
                        {formik.touched.endTime && formik.errors.endTime && (
                            <Typography color="error" variant="caption" sx={{ mt: -2 }}>{formik.errors.endTime}</Typography>
                        )}

                    </Box>
                </LocalizationProvider>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ py: 1.3, fontWeight: 'bold', fontSize: '16px', backgroundColor: '#1976d2' }}
                >
                    {edit ? 'Update' : 'Schedule'}
                </Button>

                {edit && (
                    <Button
                        type="button"
                        onClick={handleDelete}
                        variant="outlined"
                        color="error"
                        fullWidth
                        sx={{ py: 1.3, mt: 2, fontWeight: 'bold', fontSize: '16px', borderColor: '#d32f2f', color: '#d32f2f',
                            '&:hover': {
                                backgroundColor: '#fbe9e7',
                                borderColor: '#d32f2f',
                            },
                        }}
                    >
                        Delete
                    </Button>
                )}

                <Button
                    type="button"
                    onClick={cancelForm}
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ py: 1.3, mt: 2, fontWeight: 'bold', fontSize: '16px' }}
                >
                    Cancel
                </Button>
            </form>
        </Box>

    );
}