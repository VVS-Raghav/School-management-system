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
import { baseAPI } from "../../../environment.js";

export default function Register() {
  const [image, setImage] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState('success');

  const fileInputRef = React.useRef(null);

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

  const handleClose = () => {
    setMessage('');
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage('Please enter OTP');
      setMessageType('error');
      return;
    }

    try {
      const res = await axios.post(`${baseAPI}/school/verify-otp`, {
        email: formik.values.email,
        otp: otp
      });
      if (res.data.success) {
        setEmailVerified(true);
        setMessage('Email verified successfully');
        setMessageType('success');
      } else {
        setMessage(res.data.message);
        setMessageType('error');
      }
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || 'OTP verification failed');
      setMessageType('error');
    }
  };

  const initialValues = {
    school_name: '',
    email: '',
    owner_name: '',
    password: '',
    confirm_password: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!image) {
        setMessage('Please upload an image');
        setMessageType('error');
        return;
      }

      if (!otpSent || !emailVerified) {
        try {
          const res = await axios.post(`${baseAPI}/school/send-otp`, {
            email: values.email
          });
          setMessage(res.data.message);
          setMessageType('success');
          setOtpSent(true);
        } catch (err) {
          setMessage(err.response?.data?.message || 'Failed to send OTP');
          setMessageType('error');
        }
        return;
      }

      const formData = new FormData();
      formData.append('image', image);
      formData.append('school_name', values.school_name);
      formData.append('email', values.email);
      formData.append('owner_name', values.owner_name);
      formData.append('password', values.password);
      formData.append('otp', otp);

      axios
        .post(`${baseAPI}/school/register`, formData)
        .then((response) => {
          if (response.data.success) {
            setMessage(response.data.message);
            setMessageType('success');
            resetForm();
            handleClearFile();
            setOtp('');
            setOtpSent(false);
            setEmailVerified(false);
          } else {
            setMessage(response.data.message);
            setMessageType('error');
          }
        })
        .catch((error) => {
          setMessage(error.response?.data?.message || 'Registration failed');
          setMessageType('error');
        });
    }
  });

  return (
   <Box
  sx={{
    background:
      'url(https://static.vecteezy.com/system/resources/previews/047/784/019/non_2x/an-illustration-of-online-learning-with-a-group-of-students-using-laptops-and-a-teacher-presenting-a-pie-chart-free-vector.jpg)',
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
      width: { xs: '100%', sm: '500px' },
      bgcolor: 'rgba(255, 255, 255, 0.95)',
      p: 4,
      borderRadius: 3,
      boxShadow: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Typography variant="h4" color="primary" textAlign="center" fontWeight={600}>
      Register Your School
    </Typography>

    <Box textAlign="center">
      <Typography variant="subtitle2" fontWeight={500} mb={1}>
        Upload School Image
      </Typography>
      <TextField type="file" inputRef={fileInputRef} onChange={addImage} fullWidth />
      {imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          sx={{ mt: 2, borderRadius: 2 }}
        />
      )}
    </Box>

    <TextField
      name="school_name"
      label="School Name"
      value={formik.values.school_name}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.school_name && Boolean(formik.errors.school_name)}
      helperText={formik.touched.school_name && formik.errors.school_name}
    />
    <TextField
      name="email"
      label="Email"
      value={formik.values.email}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.email && Boolean(formik.errors.email)}
      helperText={formik.touched.email && formik.errors.email}
    />
    <TextField
      name="owner_name"
      label="Owner Name"
      value={formik.values.owner_name}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.owner_name && Boolean(formik.errors.owner_name)}
      helperText={formik.touched.owner_name && formik.errors.owner_name}
    />
    <TextField
      type="password"
      name="password"
      label="Password"
      value={formik.values.password}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.password && Boolean(formik.errors.password)}
      helperText={formik.touched.password && formik.errors.password}
    />
    <TextField
      type="password"
      name="confirm_password"
      label="Confirm Password"
      value={formik.values.confirm_password}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
      helperText={formik.touched.confirm_password && formik.errors.confirm_password}
    />

    {otpSent && !emailVerified && (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1}}>
        <TextField
          name="otp"
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button variant="outlined" onClick={handleVerifyOtp} fullWidth sx={{mt:2}}>
          Verify OTP
        </Button>
      </Box>
    )}

    <Button type="submit" variant="contained" size="large" fullWidth>
      {!otpSent ? 'Send OTP' : !emailVerified ? 'Resend OTP' : 'Submit'}
    </Button>
  </Box>
</Box>

  );
}
