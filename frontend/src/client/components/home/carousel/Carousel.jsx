import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { green } from '@mui/material/colors';

const slides = [
  {
    label: 'Welcome to ClassLinker',
    description: 'A smart education management system for schools and institutes.',
    image: 'https://res.cloudinary.com/dsbfjrerq/image/upload/v1754049323/school_img_p1whgm.png',
  },
  {
    label: 'Easy Class Scheduling',
    description: 'Manage teacher schedules and class timings effortlessly.',
    image: 'https://res.cloudinary.com/dsbfjrerq/image/upload/v1754049155/Header-back-to-school_knddmx.jpg',
  },
  {
    label: 'Student Engagement',
    description: 'Boost student interaction with notes, chat, and assignments.',
    image: 'https://res.cloudinary.com/dsbfjrerq/image/upload/v1754129558/newSch3_qzxgtd.png',
  },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const handleBack = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', mx: 'auto', px: 10,py:2 }}>
      <SwipeableViews index={index} onChangeIndex={(i) => setIndex(i)} enableMouseEvents>
        {slides.map((slide, i) => (
          <Box
            key={i}
            sx={{
              height: 725,
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: '#f5f5f5',
              boxShadow: 3,
            }}
          >
            <img
              src={slide.image}
              alt={slide.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                p: 2,
              }}
            >
              <Typography variant="h6">{slide.label}</Typography>
              <Typography variant="body2">{slide.description}</Typography>
            </Box>
          </Box>
        ))}
      </SwipeableViews>

      <Button
        onClick={handleBack}
        sx={{ position: 'absolute', top: '50%', left: 80, transform: 'translateY(-50%)' ,bgcolor: 'rgba(0, 0, 0, 0.34)',}}
      >
        <ArrowBackIos sx={{color:'orange'}} />
      </Button>
      <Button
        onClick={handleNext}
        sx={{ position: 'absolute', top: '50%', right: 80, transform: 'translateY(-50%)' ,bgcolor: 'rgba(0, 0, 0, 0.34)',}}
      >
        <ArrowForwardIos sx={{color:'orange'}}/>
      </Button>
    </Box>
  );
}
