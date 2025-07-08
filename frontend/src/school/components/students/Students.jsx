import * as React from 'react';
import { Box, TextField, Button, Typography, CardMedia, useMediaQuery, CardContent, CardActionArea, Card, Grid, Tooltip, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import axios from 'axios';
import { baseAPI } from "../../../environment.js";
import { studentSchema } from '../../../yupSchema/studentSchema';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import SchoolIcon from '@mui/icons-material/School';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Students() {
  const [image, setImage] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');
  const [classes, setClasses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [params, setParams] = React.useState([]);
  const [edit, setEdit] = React.useState(false);
  const [editingstudentid, setEditingStudentId] = React.useState(null);

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

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseAPI}/class/all`);
      setClasses(response.data.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      alert("Something went wrong while fetching classes.");
    }
  };

  const handleClass = (e) => {
    setParams((prev) => ({
      ...prev,
      student_class: e.target.value || undefined,
    }))
  }
  const handleSearch = (e) => {
    setParams((prev) => ({
      ...prev,
      search: e.target.value || undefined,
    }))
  }

  const handleEdit = (id) => {
    const student = students.find((s) => s._id === id);
    if (!student) return;
    setEdit(true);
    setEditingStudentId(id);
    setImageUrl(`/images/${student.student_image}`);
    formik.setValues({
      name: student.name,
      email: student.email,
      age: student.age,
      gender: student.gender,
      guardian: student.guardian,
      guardian_phone: student.guardian_phone,
      student_class: student.student_class?._id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit =()=>{
    setEdit(false);
    setEditingStudentId(null);
    setImageUrl(null);
    formik.resetForm();
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const res = await axios.delete(`${baseAPI}/student/delete/${id}`, {
        headers: { Authorization: localStorage.getItem('token') }
      });

      if (res.data.success) {
        setStudents(res.data.students);
        setMessage("Student deleted successfully");
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

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${baseAPI}/student/all`, { params: params });
      setStudents(response.data.students);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      alert("Something went wrong while fetching students.");
    }
  };

  React.useEffect(() => {
    fetchClasses();
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [message, params]);

  const initialValues = {
    name: '',
    email: '',
    age: '',
    gender: '',
    guardian: '',
    guardian_phone: '',
    student_class: '',
    password: '',
    confirm_password: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: studentSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const formData = new FormData();
      formData.append('image', image);
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));

      const url = edit ? `${baseAPI}/student/update/${editingstudentid}` : `${baseAPI}/student/register`;
      const method = edit ? axios.patch : axios.post;

      method(url, formData, {headers: { Authorization: localStorage.getItem('token') }})
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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #e3f2fd, #bbdefb)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
        overflowY: 'auto'
      }}
    >
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}

      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <SchoolIcon sx={{ fontSize: 40, color: '#0d47a1' }} />
        <Typography variant='h4' sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
          {edit ? 'Update Student' : 'Student Registration'}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          width: '95%',
          maxWidth: '750px',
          backgroundColor: 'white',
          p: 4,
          borderRadius: 3,
          boxShadow: 6
        }}
      >
        <Typography sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Upload Student Image
        </Typography>

        <TextField
          type="file"
          inputRef={fileInputRef}
          onChange={addImage}
          fullWidth
        />

        {imageUrl && (
          <CardMedia
            component="img"
            image={imageUrl}
            alt="Preview"
            sx={{
              height: 180,
              width: '100%',
              objectFit: 'cover',
              borderRadius: 2,
              mt: 2,
              mb: 2,
              boxShadow: 3
            }}
          />
        )}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2,
            mt: 2
          }}
        >
          {[{ name: 'name', label: 'Name' }, { name: 'email', label: 'Email' }, { name: 'guardian', label: 'Guardian Name' }, { name: 'guardian_phone', label: 'Guardian Phone' }].map(({ name, label, type = 'text' }) => (
            <Box
              key={name}
              sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}
            >
              <TextField
                name={name}
                label={label}
                type={type}
                {...formik.getFieldProps(name)}
                fullWidth
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
              />
            </Box>
          ))}

          <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}>
            <FormControl fullWidth error={formik.touched.age && Boolean(formik.errors.age)}>
              <InputLabel id="age-label">Age</InputLabel>
              <Select
                labelId="age-label"
                name="age"
                label="Age"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {[...Array(16)].map((_, i) => (
                  <MenuItem key={i + 3} value={(i + 3).toString()}>{i + 3}</MenuItem>
                ))}
              </Select>
              {formik.touched.age && formik.errors.age && (
                <Typography variant="caption" color="error">{formik.errors.age}</Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}>
            <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                label="Gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <Typography variant="caption" color="error">{formik.errors.gender}</Typography>
              )}
            </FormControl>
          </Box>

          <Box sx={{ flex: isMobile ? '1 1 100%' : '1 1 48%' }}>
            <FormControl fullWidth error={formik.touched.student_class && Boolean(formik.errors.student_class)}>
              <InputLabel id="class-label">Class</InputLabel>
              <Select
                labelId="class-label"
                name="student_class"
                label="Class"
                value={formik.values.student_class}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {classes && classes.map(x => {
                  return (<MenuItem key={x._id} value={x._id}>{x.class_text} {x.class_num}</MenuItem>);
                })}

              </Select>
              {formik.touched.student_class && formik.errors.student_class && (
                <Typography variant="caption" color="error">{formik.errors.student_class}</Typography>
              )}
            </FormControl>
          </Box>
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

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            py: 0.6,
            fontSize: '18px',
            backgroundColor: '#1976d2',
            ':hover': {
              backgroundColor: '#115293'
            }
          }}
        >
          {edit ? 'Update' : 'Register'}
        </Button>

        {edit && (
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={cancelEdit}
            sx={{ py: 0.6, fontSize: '18px' ,justifyContent:'center',mt:2, width:'100%'}}
          >
            Cancel
          </Button>
        )}
      </Box>

      <Box
        component="div"
        sx={{
          mt: 4,
          display: 'flex',
          gap: 2,
          width: '100%',
          maxWidth: 600,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          onChange={(e) => { handleSearch(e) }}
          size="small"
          fullWidth
          sx={{ backgroundColor: 'white' }}
        />

        <FormControl fullWidth size="small" sx={{ backgroundColor: 'white' }}>
          <InputLabel id="class-label">Class</InputLabel>
          <Select
            labelId="class-label"
            name="student_class"
            label="Class"
            defaultValue=""
            onChange={(e) => {
              handleClass(e);
            }}
          >
            <MenuItem value="">Any</MenuItem>
            {classes?.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.class_text} {cls.class_num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4, px: 2 ,ml:2.3}}>
        <Grid container spacing={7}>
          {students && students.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: 280 }}>
                <CardActionArea sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={`/images/${s.student_image}`}
                    alt={s.name}
                    sx={{ objectFit: 'cover', height: 250 }}
                  />
                  <CardContent>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      <strong>Name:</strong> {s.name}<br />
                      <strong>Class:</strong> {s.student_class?.class_text} {s.student_class?.class_num}<br />
                      <strong>Age:</strong> {s.age}<br />
                      <strong>Guardian:</strong> {s.guardian}<br />
                      <strong>Guardian Phone:</strong> {s.guardian_phone}<br />
                      <strong>Email:</strong> {s.email}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0, mb: -1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(s._id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(s._id)}
                        >
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