import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { loginSchema } from '../../../yupSchema/loginSchema';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate(); 
  const initialValues = {
    email: '',
    password: ''
  };
  const formik = useFormik({
  initialValues: initialValues,
  validationSchema: loginSchema,

  onSubmit: (values, { resetForm }) => {

    axios.post('http://localhost:5000/api/school/login', {...values})
      .then((response) => {
        const token = response.headers.get('Authorization');
        if(token){
          localStorage.setItem('token', token);
        }
        const user = response.data.user;
        if(user){
          localStorage.setItem('user', JSON.stringify(user));
          login(user);
        }
        if (response.data.success) {
          setMessage(response.data.message);
          setMessageType('success');
          resetForm(); 
          navigate('/school');
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
    <Box sx={{background:'url(https://static.vecteezy.com/system/resources/previews/047/784/019/non_2x/an-illustration-of-online-learning-with-a-group-of-students-using-laptops-and-a-teacher-presenting-a-pie-chart-free-vector.jpg)',backgroundSize:'185vh',textAlign:'center',backgroundRepeat:'no-repeat',height:'90vh', display: 'flex',flexDirection: 'column',alignItems: 'center',
    justifyContent: 'center'}}>
    {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose}/>}
    <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '50ch' },
        display: 'flex',
        flexDirection: 'column',
        width: '32vw',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255)'
      }}
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
    <Typography variant='h2' sx={{textAlign:'center',justifyContent:'center',color:'darkblue'}}>Login</Typography>

      <TextField
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email ? (<div style={{ color: 'red',margin:0,padding:0 }}>{formik.errors.email}</div>) : null}
    

      <TextField
        type='password'
        name="password"
        label="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password ? (<div style={{ color: 'red',margin:0,padding:0}}>{formik.errors.password}</div>) : null}

      <Button type='submit' variant='contained'>Submit</Button>
    </Box>
    </Box>
  );
}