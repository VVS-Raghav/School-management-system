import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';


export default function SuccessPage() {
    const navigate = useNavigate();
    const { width, height } = useWindowSize();
    const AnimatedBox = animated(Box);

  const springProps = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 170, friction: 14 },
  });

  return (
    <AnimatedBox
      sx={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        px: 2,
        textAlign: 'center',
        color: 'success.main',
      }}
      style={springProps}
    >
      <Confetti width={width} height={height} numberOfPieces={60} />
      <CheckCircleOutlineIcon sx={{ fontSize: 80, mb: 1 }} />
      <Typography variant="h4" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ maxWidth: 400 }}>
        Thank you for your payment. Your transaction has been completed successfully.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/student/fees')}
        sx={{ mt: 2 }}
      >
        Go to My Fees
      </Button>
    </AnimatedBox>
  );
}