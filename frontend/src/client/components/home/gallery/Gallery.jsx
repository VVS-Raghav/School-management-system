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
    <Box sx={{ px: 2, py: 4 }}>
      {schools.length > 0 ? (
        <>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 4,
              textAlign: 'center',
              fontWeight: 600,
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Registered Schools
          </Typography>

          <ImageList
            cols={3}
            gap={20}
            sx={{
              width: '100%',
              m: 0,
              '@media (max-width: 900px)': {
                cols: 2,
              },
              '@media (max-width: 600px)': {
                cols: 1,
              },
            }}
          >
            {schools.map((school, index) => (
              <ImageListItem key={index}>
                <img
                  src={school.school_image}
                  alt={school.school_name}
                  loading="lazy"
                  onClick={() => handleOpen(school)}
                  style={{
                    cursor: 'pointer',
                    width: '100%',
                    height: 'auto',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 12,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <ImageListItemBar
                  title={school.school_name}
                  position="below"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                    mt: 1,
                    backgroundColor: 'transparent',
                    color: 'black',
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>

          {/* Modal */}
          <Modal
            open={open && selectedSchool !== null}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 600,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              {selectedSchool && (
                <>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}
                  >
                    {selectedSchool.school_name}
                  </Typography>
                  <img
                    src={selectedSchool.school_image}
                    alt={selectedSchool.school_name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                </>
              )}
            </Box>
          </Modal>
        </>
      ) : (
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mt: 6,
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          No schools have been registered yet.
        </Typography>
      )}
    </Box>

  );
}