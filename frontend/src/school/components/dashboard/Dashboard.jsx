import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { baseAPI } from "../../../environment.js";
import { Box, Typography, Button, TextField, CardMedia } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import MessageSnackbar from "../../../basic_utility/snackbar/MessageSnackbar.jsx";

export default function Dashboard() {

  const [school, setSchool] = useState(null);
  const [schoolName, setSchoolName] = useState(null);
  const [edit, setEdit] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const fetchSchool = () => {
    axios.get(`${baseAPI}/school/fetch-single`).then((resp) => {
      setSchool(resp.data.school);
      setSchoolName(resp.data.school.school_name);
    }).catch((e) => {
      console.log("Error occured:", e);
    });
  }

  useEffect(() => {
    fetchSchool();
  }, [message]);


  // image handling

  const addImage = (e) => {
    const file = e.target.files[0];
    setImageUrl(URL.createObjectURL(file));
    setImage(file);
  };


  const fileInputRef = useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    setImage(null);
    setImageUrl(null);
    setEdit(false);
  };

  const handleClose = () => {
    setMessage('');
  }

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append('school_name', schoolName);
    if (image) fd.append('image', image);

    axios.patch(`${baseAPI}/school/update`, fd).then((resp) => {
      setMessage(resp.data.message);
      setMessageType('success');
      handleClearFile();
    })
      .catch((error) => {
        setMessage(error.response?.data?.message);
        setMessageType('error');
      });
  }

  return (
    <>
      <h2>Dashboard</h2>
      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}
      {edit &&

        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '50ch' },
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 3,
            padding: 5,
            backgroundColor: 'rgba(255, 255, 255)'
          }}
          noValidate
          autoComplete="off"
        >

          <Typography>Add school picture</Typography>
          <TextField
            type='file'
            inputRef={fileInputRef}
            onChange={(e) => addImage(e)}
          />
          {imageUrl &&
            <Box>
              <CardMedia component={'img'} height={'240px'} image={imageUrl} />
            </Box>}

          <TextField
            label="School Name"
            value={schoolName}
            onChange={(e) => {
              setSchoolName(e.target.value);
            }}
          />

          <Button onClick={handleSubmit} variant="contained">Submit</Button>
          <Button onClick={handleClearFile} variant="contained" sx={{ background: 'white', color: 'black' }}>Cancel</Button>

        </Box>

      }
      {school && (
        <Box
          sx={{
            height: '80vh',
            width: '100%',
            maxWidth: '1000px',
            margin: 'auto',
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: 4,
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: '100%',
              background: `url("/images/${school.school_image}") center center / cover no-repeat`,
              filter: 'brightness(0.9)',
              transition: 'all 0.3s ease-in-out',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: 2,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {school.school_name}
            </Typography>

            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
              }}
            >
              <Button
                variant="contained"
                onClick={() => setEdit(true)}
                sx={{
                  minWidth: 'auto',
                  padding: 1,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  color: 'black',
                  boxShadow: 2,
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                <EditIcon />
              </Button>
            </Box>
          </Box>
        </Box>
      )}

    </>
  );
}