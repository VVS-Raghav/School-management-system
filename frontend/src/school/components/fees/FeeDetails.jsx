import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { baseAPI } from '../../../environment.js';
import MessageSnackbar from '../../../basic_utility/snackbar/MessageSnackbar';

const FEE_TITLES = [
  'Tuition Fee (Term 1)',
  'Tuition Fee (Term 2)',
  'Laboratory Fee',
  'Library Fee',
  'Examination Fee',
  'Transportation Fee',
  'Miscellaneous Charges',
];


const FeeDetails = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [filter, setFilter] = useState('');
  const [newFee, setNewFee] = useState({ title: '', amount: '', dueDate: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    fetchFees();
    fetchClasses();
  }, [selectedClass]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const url = selectedClass ? `${baseAPI}/fees?class=${selectedClass}` : `${baseAPI}/fees`;
      const res = await axios.get(url);
      setFees(res.data.success ? res.data.data : []);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${baseAPI}/class/all`);
      setClasses(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes');
      setClasses([]);
    }
  };

  const assignFeeToClass = async () => {
    const { title, amount, dueDate } = newFee;
    if (!selectedClass || !amount || !dueDate || !title) {
      setMessage('Please fill all fee details.');
      setMessageType('error');
      return;
    }

    try {
      await axios.post(`${baseAPI}/fees/assign`, {
        class: selectedClass,
        title,
        amount: Number(amount),
        dueDate,
      });
      setMessage('Fee assigned successfully');
      setMessageType('success');
      setNewFee({ title: '', amount: '', dueDate: '' });
      fetchFees();
    } catch (err) {
      console.error('Failed to assign fee:', err);
      setMessage('Something went wrong!');
      setMessageType('error');
    }
  };

  const filteredFees = fees.filter((fee) => (filter ? fee.status === filter : true));

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Fee Management
      </Typography>

      {message && (
        <MessageSnackbar
          message={message}
          messageType={messageType}
          handleClose={() => setMessage('')}
        />
      )}

      {/* Assign Fee Section */}
      <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assign Fee to Class
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">
                  <em>Select Class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.class_text} {cls.class_num}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <Select
                value={newFee.title}
                onChange={(e) =>
                  setNewFee((prev) => ({ ...prev, title: e.target.value }))
                }
                displayEmpty
                fullWidth
              >
                <MenuItem value="">
                  <em>Select Fee Title</em>
                </MenuItem>
                {FEE_TITLES.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Amount (₹)"
                type="number"
                value={newFee.amount}
                onChange={(e) =>
                  setNewFee((prev) => ({ ...prev, amount: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={newFee.dueDate}
                onChange={(e) =>
                  setNewFee((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button variant="contained" fullWidth onClick={assignFeeToClass}>
                Assign Fee
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          displayEmpty
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </Select>
      </Box>

      {/* Fee Table */}
      {loading ? (
        <CircularProgress />
      ) : filteredFees.length === 0 ? (
        <Typography>No fees found.</Typography>
      ) : (
        <Paper sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Due Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Paid On</strong></TableCell>
                <TableCell><strong>Receipt</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFees.map((fee) => (
                <TableRow key={fee._id}>
                  <TableCell>{fee.student?.name ?? 'N/A'}</TableCell>
                  <TableCell>
                    {fee.template?.classId
                      ? `${fee.template.classId.class_text} ${fee.template.classId.class_num}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{fee.template?.title ?? 'N/A'}</TableCell>
                  <TableCell>₹{fee.template?.amount ?? '—'}</TableCell>
                  <TableCell>
                    {fee.template?.dueDate
                      ? dayjs(fee.template.dueDate).format('DD MMM YYYY')
                      : '—'}
                  </TableCell>
                  <TableCell sx={{ color: fee.status === 'paid' ? 'green' : 'orange' }}>{fee.status}</TableCell>
                  <TableCell>
                    {fee.paymentDate
                      ? dayjs(fee.paymentDate).format('DD MMM YYYY')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {fee.receiptUrl ? (
                      <a href={fee.receiptUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      '—'
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

export default FeeDetails;