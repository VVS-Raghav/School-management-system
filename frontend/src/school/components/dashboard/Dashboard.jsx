import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { baseAPI } from "../../../environment.js";
import { Box, Typography, Button, TextField, CardMedia, Modal } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import MessageSnackbar from "../../../basic_utility/snackbar/MessageSnackbar.jsx";
import SchoolDetails from "./SchoolDetails.jsx";
import SchoolStats from "./SchoolStats.jsx";

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
    })
      .catch((error) => {
        setMessage(error.response?.data?.message);
        setMessageType('error');
      });
  }

  return (
    <>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: 'center',
          mb: 4,
          background: 'linear-gradient(90deg, #004aad, #00b4d8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        School Dashboard
      </Typography>


      {message && <MessageSnackbar message={message} messageType={messageType} handleClose={handleClose} />}
      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        aria-labelledby="schedule-modal-title"
        aria-describedby="schedule-modal-description"
      >
        <Box
          component="form"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '& > :not(style)': { m: 1, width: '100%' }
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
          <Button onClick={handleClearFile} variant="outlined">Cancel</Button>

        </Box>
      </Modal>

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
            mb:6
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: '100%',
              background: `url("${school.school_image}") center center / cover no-repeat`,
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
                color: '#ffffff',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 2,
                textShadow: `
                  0px 0px 6px rgba(0,0,0,0.7),
                  0px 0px 12px rgba(0,0,0,0.5)
                `,
                maxWidth: '100%',
                wordWrap: 'break-word'
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
      <SchoolDetails />
      <SchoolStats/>
    </>
  );
}