import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" color="error.main" gutterBottom>
        Payment Cancelled
      </Typography>
      <Typography variant="body1">
        Your payment was not completed. You can try again anytime.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/student/fees')}>
        Back to My Fees
      </Button>
    </Box>
  );
};

export default CancelPage;