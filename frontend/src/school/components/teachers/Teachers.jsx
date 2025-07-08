import * as React from 'react';
import {
  Box, TextField, Button, Typography, CardMedia, useMediaQuery,
  CardContent, CardActionArea, Card, Grid, Tooltip, IconButton,
  FormControl, InputLabel, MenuItem, Select
} from '@mui/material';
import { useFormik } from 'formik';
import axios from 'axios';
import { baseAPI } from '../../../environment.js';
import { teacherSchema } from '../../../yupSchema/teacherSchema';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Teachers() {
  const [image, setImage] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');
  const [teachers, setTeachers] = React.useState([]);
  const [params, setParams] = React.useState([]);
  const [edit, setEdit] = React.useState(false);
  const [editingTeacherId, setEditingTeacherId] = React.useState(null);

  const fileInputRef = React.useRef(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const handleClose = () => setMessage('');

  const addImage = (e) => {
    const file = e.target.files[0];
    setImageUrl(URL.createObjectURL(file));
    setImage(file);
  };

  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    setImage(null);
    setImageUrl(null);
  };

  const handleSearch = (e) => {
    setParams((prev) => ({ ...prev, search: e.target.value || undefined }));
  };

  const handleEdit = (id) => {
    const teacher = teachers.find((t) => t._id === id);
    if (!teacher) return;
    setEdit(true);
    setEditingTeacherId(id);
    setImageUrl(`/images/${teacher.teacher_image}`);
    formik.setValues({
      name: teacher.name,
      email: teacher.email,
      age: teacher.age,
      gender: teacher.gender,
      qualification: teacher.qualification
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEdit(false);
    setEditingTeacherId(null);
    setImageUrl(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const res = await axios.delete(`${baseAPI}/teacher/delete/${id}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      if (res.data.success) {
        setTeachers(res.data.teachers);
        setMessage("Teacher deleted successfully");
        setMessageType("success");
      } else {
        setMessage(res.data.message || "Deletion failed");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      setMessage("Something went wrong while deleting");
      setMessageType("error");
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${baseAPI}/teacher/all`, { params });
      setTeachers(response.data.teachers);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      alert("Something went wrong while fetching teachers.");
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, [message, params]);

  const initialValues = {
    name: '',
    email: '',
    age: '',
    gender: '',
    qualification: '',
    password: '',
    confirm_password: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: teacherSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('image', image);
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));

      const url = edit ? `${baseAPI}/teacher/update/${editingTeacherId}` : `${baseAPI}/teacher/register`;
      const method = edit ? axios.patch : axios.post;

      method(url, formData, { headers: { Authorization: localStorage.getItem('token') } })
        .then((res) => {
          if (res.data.success) {
            setMessage(res.data.message);
            setMessageType('success');
            handleClearFile();
            cancelEdit();
          } else {
            setMessage(res.data.message);
            setMessageType('error');
          }
        })
        .catch((err) => {
          setMessage(err.response?.data?.message || 'Something went wrong');
          setMessageType('error');
        });
    }
  });

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to right, #e3f2fd, #bbdefb)', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2, overflowY: 'auto' }}>
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}

      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <SchoolIcon sx={{ fontSize: 40, color: '#0d47a1' }} />
        <Typography variant='h4' sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
          {edit ? 'Update Teacher' : 'Teacher Registration'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '95%', maxWidth: '750px', backgroundColor: 'white', p: 4, borderRadius: 3, boxShadow: 6 }}>
        <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>Upload Teacher Image</Typography>
        <TextField type="file" inputRef={fileInputRef} onChange={addImage} fullWidth />

        {imageUrl && (
          <CardMedia component="img" image={imageUrl} alt="Preview" sx={{ height: 180, width: '100%', objectFit: 'cover', borderRadius: 2, mt: 2, mb: 2, boxShadow: 3 }} />
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, mt: 2 }}>
          {[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'qualification', label: 'Qualification' }].map(({ name, label }) => (
            <Box key={name} sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}>
              <TextField
                name={name}
                label={label}
                {...formik.getFieldProps(name)}
                fullWidth
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
              />
            </Box>
          ))}

          {[{
            name: 'age', label: 'Age', options: Array.from({ length: 53 }, (_, i) => i + 18)
          }, {
            name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other']
          }].map(({ name, label, options }) => (
            <Box key={name} sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}>
              <FormControl fullWidth error={formik.touched[name] && Boolean(formik.errors[name])}>
                <InputLabel id={`${name}-label`}>{label}</InputLabel>
                <Select
                  labelId={`${name}-label`}
                  name={name}
                  label={label}
                  value={formik.values[name]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt.toString()}>{opt}</MenuItem>
                  ))}
                </Select>
                {formik.touched[name] && formik.errors[name] && (
                  <Typography variant="caption" color="error">{formik.errors[name]}</Typography>
                )}
              </FormControl>
            </Box>
          ))}
        </Box>

        {!edit && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[{ name: 'password', label: 'Password', type: 'password' }, { name: 'confirm_password', label: 'Confirm Password', type: 'password' }].map(({ name, label, type }) => (
              <TextField
                key={name}
                name={name}
                label={label}
                type={type}
                {...formik.getFieldProps(name)}
                fullWidth
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
              />
            ))}
          </Box>
        )}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 0.6, fontSize: '18px', backgroundColor: '#1976d2', ':hover': { backgroundColor: '#115293' } }}>
          {edit ? 'Update' : 'Register'}
        </Button>

        {edit && (
          <Button type="button" variant="outlined" color="secondary" onClick={cancelEdit} sx={{ py: 0.6, fontSize: '18px', justifyContent: 'center', mt: 2, width: '100%' }}>
            Cancel
          </Button>
        )}
      </Box>

      <Box sx={{ mt: 4, px: 2, ml: 2.3, display: 'flex', gap: 2, width: '100%', maxWidth: 600 }}>
        <TextField label="Search" variant="outlined" onChange={handleSearch} size="small" fullWidth sx={{ backgroundColor: 'white' }} />
      </Box>

      <Box sx={{ mt: 4, px: 2 }}>
        <Grid container spacing={7}>
          {teachers && teachers.map((t) => (
            <Grid item xs={12} sm={6} md={4} key={t._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: 280 }}>
                <CardActionArea sx={{ flexGrow: 1 }}>
                  <CardMedia component="img" height="160" image={`/images/${t.teacher_image}`} alt={t.name} sx={{ objectFit: 'cover', height: 250 }} />
                  <CardContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      <strong>Name:</strong> {t.name}<br />
                      <strong>Email:</strong> {t.email}<br />
                      <strong>Age:</strong> {t.age}<br />
                      <strong>Gender:</strong> {t.gender}<br />
                      <strong>Qualification:</strong> {t.qualification}<br />
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0, mb: -1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(t._id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(t._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}