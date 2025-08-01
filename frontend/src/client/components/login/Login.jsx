import * as React from 'react';
import { Box, TextField, Button, Typography, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import { loginSchema } from '../../../yupSchema/loginSchema';
import axios from 'axios';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { baseAPI } from '../../../environment';


export default function Login() {
  const { login } = React.useContext(AuthContext);
  const [role, setRole] = React.useState("");
  const navigate = useNavigate();
  const initialValues = {
    email: '',
    password: ''
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: loginSchema,

    onSubmit: (values, { resetForm }) => {

      axios.post(`${baseAPI}/${role}/login`, { ...values })
        .then((response) => {
          const token = response.headers.get('Authorization');
          if (token) {
            localStorage.setItem('token', token);
          }
          const user = response.data.user;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            login(user);
          }
          if (response.data.success) {
            setMessage(response.data.message);
            setMessageType('success');
            resetForm();
            navigate(`/${role}`);
          } else {
            setMessage(response.data.message);
            setMessageType('error');
          }
        })
        .catch((error) => {
          setMessage(error.response?.data?.message || 'Login failed.Please try again.');
          setMessageType('error');
        });
    }
  });

  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');
  const handleClose = () => {
    setMessage('');
  }

  return (
    <Box
  sx={{
    background: 'url(https://res.cloudinary.com/dsbfjrerq/image/upload/v1754052015/temp4_dzfeow.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
  }}
>
  {message && (
    <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />
  )}

  <Box
    component="form"
    onSubmit={formik.handleSubmit}
    sx={{
      width: { xs: '100%', sm: '400px' },
      bgcolor: 'rgba(255, 255, 255, 0.95)',
      p: 4,
      borderRadius: 3,
      boxShadow: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Typography
      variant="h4"
      textAlign="center"
      fontWeight={600}
      color="primary"
      sx={{ mb: 1 }}
    >
      Login
    </Typography>

    <FormControl required size="small" fullWidth>
      <InputLabel id="role-label">Login As</InputLabel>
      <Select
        labelId="role-label"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        onBlur={formik.handleBlur}
        label="Login As"
      >
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="teacher">Teacher</MenuItem>
        <MenuItem value="school">School Admin</MenuItem>
      </Select>
    </FormControl>

    <TextField
      fullWidth
      name="email"
      label="Email"
      value={formik.values.email}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.email && Boolean(formik.errors.email)}
      helperText={formik.touched.email && formik.errors.email}
    />

    <TextField
      fullWidth
      type="password"
      name="password"
      label="Password"
      value={formik.values.password}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.password && Boolean(formik.errors.password)}
      helperText={formik.touched.password && formik.errors.password}
    />

    <Button type="submit" variant="contained" size="large" fullWidth>
      Submit
    </Button>
  </Box>
</Box>

  );
}