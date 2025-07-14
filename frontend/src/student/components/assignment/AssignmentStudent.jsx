import React, { useEffect, useState } from 'react';
import {Box,Card,CardContent,Typography,Grid,CardActions,Button,Divider} from '@mui/material';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import axios from 'axios';
import dayjs from 'dayjs';
import { baseAPI } from '../../../environment';

const AssignmentStudent = () => {
  const [assignments, setAssignments] = useState([]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${baseAPI}/assignment/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAssignments(res.data.data || []);
    } catch (err) {
      console.log("Error in fetching assignments", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: 'center', fontWeight: 600, color: '#0a1d56' }}
      >
        📚 Your Class Assignments
      </Typography>

      {assignments.length === 0 ? (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No assignments found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => {
            const deadline = dayjs(assignment.deadline);
            const daysLeft = deadline.diff(dayjs(), 'day');

            let bgColor = '#c2ffd4ff';
            if (daysLeft <= 3 && daysLeft > 0) bgColor = '#fff1c4ff';
            else if (daysLeft <= 0) bgColor = '#ffcbcbff';

            return (
              <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: bgColor,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ color: '#004aad', fontWeight: 'bold', mb: 1 }}
                    >
                      {assignment.title}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Deadline: <strong>{deadline.format('DD MMM YYYY')}</strong>
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<FileOpenIcon />}
                      href={`${baseAPI}/../files/${assignment.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default AssignmentStudent;