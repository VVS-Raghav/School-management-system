import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useFormik } from 'formik';
import { classSchema } from '../../../yupSchema/classSchema';
import { baseAPI } from "../../../environment.js";
import axios from "axios";
import { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';
import DeleteIcon from '@mui/icons-material/Delete';



export default function Class() {
  const [classes, setClasses] = useState([]);

  const formik = useFormik({
    initialValues: { class_text: "", class_num: "" },
    validationSchema: classSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(`${baseAPI}/class/create`, { ...values });
        if (response.data.success) {
          resetForm();
          setMessage(response.data.message);
          setMessageType('success');
        } else {
          setMessage(error.response?.data?.message);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error in adding class:', error);
        setMessage(error.response?.data?.message);
        setMessageType('error');
      }
    }
  });

  const handleDelete = (id) => {
    axios.delete(`${baseAPI}/class/delete/${id}`).then((resp)=>{
      setMessage(resp.data.message);
      setMessageType('success');
    }).catch(e=>{
      setMessage(e.data.message);
      setMessageType('error');
    })
  }

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const handleClose = () => {
    setMessage('');
  }

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseAPI}/class/all`);
      setClasses(response.data.data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      alert("Something went wrong while fetching classes.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [message]);

  return (
    <>
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose}/>}
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          width: { xs: '90%', sm: '60%', md: '40%' },
          margin: '3rem auto',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#f9f9f9',
        }}
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        <Typography variant='h4' sx={{ textAlign: 'center', mb: 2, color: '#1a237e', fontWeight: 'bold' }}>
          Add new class
        </Typography>

        <TextField
          name="class_text"
          label="Class Text"
          value={formik.values.class_text}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
          variant="outlined"
        />
        {formik.touched.class_text && formik.errors.class_text && (
          <Typography variant="body2" color="error" sx={{ alignSelf: 'flex-start', pl: 1 }}>
            {formik.errors.class_text}
          </Typography>
        )}

        <TextField
          name="class_num"
          label="Class Number"
          value={formik.values.class_num}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          fullWidth
          variant="outlined"
        />
        {formik.touched.class_num && formik.errors.class_num && (
          <Typography variant="body2" color="error" sx={{ alignSelf: 'flex-start', pl: 1 }}>
            {formik.errors.class_num}
          </Typography>
        )}

        <Button type="submit" variant="contained" sx={{ mt: 2, px: 4 }}>
          Submit
        </Button>
      </Box>

      <Box
        component="div"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
          mt: 4,
        }}
      >
        {classes &&
          classes.map((x) => (
            <Box
              key={x._id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                padding: 2,
                minWidth: 220,
                maxWidth: 250,
                backgroundColor: '#fdfdfd',
                boxShadow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3,
                },
              }}
            >
              <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 500 }}>
                Class: {x.class_text} {x.class_num}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(x._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
      </Box>

    </>
  );
}