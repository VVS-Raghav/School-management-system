import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import {baseAPI} from '../../../../environment'


export default function Gallery() {
  const [open, setOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState(null);
  const [schools, setSchools] = React.useState([]);

  const handleOpen = (school) =>{
    setOpen(true);
    setSelectedSchool(school);
  }
  const handleClose = () =>{
    setOpen(false);
    setSelectedSchool(null);
  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3
  };

  React.useEffect(() => {
    axios.get(`${baseAPI}/school/all`)
      .then((response) => {
        setSchools(response.data.schools);
      })
      .catch((error) => {
        console.error('Error fetching schools:', error);
      });
  },[]);

  return (
    <Box>
        <Typography variant="h4" component="h2" sx={{ mb: 2 ,textAlign: 'center',marginTop: '30px',marginBottom: '20px'}}>
            Registered Schools
        </Typography>
        <ImageList sx={{ width: '100%', height: 'auto' }}>
            {schools.map((school,index) => (
                <ImageListItem key={index} >
                <img
                    srcSet={`./images/${school.school_image}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    src={`./images/${school.school_image}?w=248&fit=crop&auto=format`}
                    alt={'alt'}
                    loading="lazy"
                    onClick={()=>handleOpen(school)}
                    style={{ cursor: 'pointer', width: '100%', height: 'auto',maxHeight: '400px' }}
                />
                <ImageListItemBar
                    title={school.school_name}
                    position="below"
                    sx={{ textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                />
                </ImageListItem>
            ))}
        </ImageList>
        <div>
            <Modal
                open={open && selectedSchool !== null}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                    {selectedSchool ? selectedSchool.school_name : ''}
                </Typography>
                {selectedSchool && (
                <img
                    src={`/images/${selectedSchool.school_image}`}
                    alt="alt"
                    style={{ width: '100%', maxHeight: '500px' }}
                />
                )}
            </Box>
            </Modal>
        </div>
    </Box>
  );
}