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
        background: 'url(https://static.vecteezy.com/system/resources/previews/047/784/019/non_2x/an-illustration-of-online-learning-with-a-group-of-students-using-laptops-and-a-teacher-presenting-a-pie-chart-free-vector.jpg)',
        backgroundSize: '185vh',
        textAlign: 'center',
        backgroundRepeat: 'no-repeat',
        height: '83vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
      }}
    >
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}

      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '50ch' },
          display: 'flex',
          flexDirection: 'column',
          width: '32vw',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 3,
          padding: 3.5,
          backgroundColor: 'rgba(255, 255, 255)',
        }}
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        <Typography variant="h2" sx={{ textAlign: 'center', color: 'darkblue' }}>
          Login
        </Typography>

        <FormControl
          required
          size="small"
          sx={{ maxWidth: 110, mt: 2, alignSelf: 'flex-start' }}
        >
          <InputLabel id="role-label" sx={{ fontSize: '0.95rem' }}>Login As</InputLabel>
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
            <MenuItem value="school">Admin</MenuItem>
          </Select>
        </FormControl>


        <TextField
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <div style={{ color: 'red', margin: 0, padding: 0 }}>{formik.errors.email}</div>
        )}

        <TextField
          type="password"
          name="password"
          label="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password && (
          <div style={{ color: 'red', margin: 0, padding: 0 }}>{formik.errors.password}</div>
        )}

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Box>
    </Box>

  );
}