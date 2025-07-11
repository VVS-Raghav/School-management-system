import React, { useEffect, useState } from 'react';
import {Box, Typography, Paper, Table, TableBody,TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import axios from 'axios';
import { baseAPI } from '../../../environment';

export default function NoticeComponent() {
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${baseAPI}/notice/all`, {
        headers: { Authorization: localStorage.getItem('token') }
      });
      setNotices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={2} color="primary">
          Notices
        </Typography>

        <TableContainer sx={{ maxHeight: '65vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '65%' }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Issued On</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {notices.map((notice) => (
                <TableRow hover key={notice._id}>
                  <TableCell>{notice.title}</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-line' }}>{notice.message}</TableCell>
                  <TableCell>
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                </TableRow>
              ))}

              {notices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No notices available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}