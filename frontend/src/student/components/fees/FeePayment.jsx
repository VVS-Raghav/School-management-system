import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { baseAPI } from '../../../environment.js';
import { loadStripe } from '@stripe/stripe-js';

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const FeePayment = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (student) fetchFees();
  }, [student]);

  const fetchStudentData = async () => {
    try {
      const res = await axios.get(`${baseAPI}/student/fetch-single`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStudent(res.data.student);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseAPI}/fees/my-fees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFees(res.data.data);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeId) => {
    try {
      const stripe = await loadStripe(stripePk);
      if (!stripe) throw new Error('Stripe failed to initialize.');

      const { data } = await axios.post(
        `${baseAPI}/fees/create-checkout-session`,
        { feeId, email: student.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (result.error) {
        console.error('Stripe redirect failed:', result.error.message);
        alert('Could not redirect to Stripe Checkout.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment could not be initiated. Try again later.');
    }
  };

  const renderStatusChip = (status) => {
    if (status === 'paid') {
      return <Chip label="Paid" color="success" variant="outlined" />;
    }
    return <Chip label="Pending" color="warning" variant="outlined" />;
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        My Fee Payments
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : fees.length === 0 ? (
        <Typography mt={3} align="center" color="text.secondary">
          No fees assigned yet.
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Action / Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee._id} hover>
                  <TableCell>{fee.template?.title || 'N/A'}</TableCell>
                  <TableCell>
                    ₹{fee.template?.amount != null ? fee.template.amount : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {fee.template?.dueDate
                      ? dayjs(fee.template.dueDate).format('DD MMM YYYY')
                      : '—'}
                  </TableCell>
                  <TableCell>{renderStatusChip(fee.status)}</TableCell>
                  <TableCell>
                    {fee.paymentDate
                      ? dayjs(fee.paymentDate).format('DD MMM YYYY')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {fee.status === 'pending' ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePayment(fee._id)}
                      >
                        Pay Now
                      </Button>
                    ) : fee.receiptUrl ? (
                      <Button
                        size="small"
                        variant="outlined"
                        href={fee.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Receipt
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Paid
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default FeePayment;