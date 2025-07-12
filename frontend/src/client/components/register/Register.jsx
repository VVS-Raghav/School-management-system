import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { registerSchema } from '../../../yupSchema/registerSchema';
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';

export default function Register() {
  const [image, setImage] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);

  const addImage = (e) => {
    const file = e.target.files[0];
    setImageUrl(URL.createObjectURL(file));
    setImage(file);
  };


  const fileInputRef = React.useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current)fileInputRef.current.value = null;
    setImage(null);
    setImageUrl(null);
  };

  const initialValues = {
    school_name: '',
    email: '',
    owner_name: '',
    password: '',
    confirm_password: ''
  };
  const formik = useFormik({
  initialValues: initialValues,
  validationSchema: registerSchema,

  onSubmit: (values, { resetForm }) => {
    console.log('Register data', values);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('school_name', values.school_name);
    formData.append('email', values.email);
    formData.append('owner_name', values.owner_name);
    formData.append('password', values.password);

    axios.post('http://localhost:5000/api/school/register', formData)
      .then((response) => {
        console.log('Register response', response.data);
        if (response.data.success) {
          setMessage(response.data.message);
          setMessageType('success');
          resetForm(); 
          handleClearFile();
        } else {
          setMessage(response.data.message);
          setMessageType('error');
        }
      })
      .catch((error) => {
        setMessage(error.response?.data?.message);
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
    <Box sx={{background:'url(https://static.vecteezy.com/system/resources/previews/047/784/019/non_2x/an-illustration-of-online-learning-with-a-group-of-students-using-laptops-and-a-teacher-presenting-a-pie-chart-free-vector.jpg)',backgroundSize:'185vh',textAlign:'center',backgroundRepeat:'no-repeat',height:'83vh', display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
    }}>
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
        padding: 3.5,
        backgroundColor: 'rgba(255, 255, 255)'
      }}
      noValidate
      autoComplete="off"
      onSubmit={formik.handleSubmit}
    >
    <Typography variant='h2' sx={{textAlign:'center',justifyContent:'center',color:'darkblue'}}>Register</Typography>


      <Typography variant='subtitle'>Add school image</Typography>
      <TextField
        type='file'
        inputRef={fileInputRef}
        onChange={(e) => addImage(e)}
      />
      {imageUrl && 
        <Box>
          <CardMedia component={'img'} height={'240px'} image={imageUrl}/>
        </Box>}

      <TextField
        name="school_name"
        label="School Name"
        value={formik.values.school_name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.school_name && formik.errors.school_name ? (<div style={{ color: 'red',margin:0,padding:0 }}>{formik.errors.school_name}</div>) : null}
      
      <TextField
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email ? (<div style={{ color: 'red',margin:0,padding:0 }}>{formik.errors.email}</div>) : null}
      
      <TextField
        name="owner_name"
        label="Owner Name"
        value={formik.values.owner_name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.owner_name && formik.errors.owner_name ? (<div style={{ color: 'red',margin:0,padding:0 }}>{formik.errors.owner_name}</div>) : null}

      <TextField
        type='password'
        name="password"
        label="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password ? (<div style={{ color: 'red',margin:0,padding:0}}>{formik.errors.password}</div>) : null}

      <TextField
        type='password'
        name="confirm_password"
        label="Confirm Password"
        value={formik.values.confirm_password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.confirm_password && formik.errors.confirm_password ? (<div style={{ color: 'red',margin:0,padding:0}}>{formik.errors.confirm_password}</div>) : null}

      <Button type='submit' variant='contained'>Submit</Button>
    </Box>
    </Box>
  );
}