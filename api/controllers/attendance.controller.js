import Attendance from '../models/attendance.model.js';
import dayjs from 'dayjs';

// Mark student attendance
export const toggleAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status } = req.body;
    const schoolId = req.user.schoolId;

    const formattedDate = dayjs(date).startOf('day').toDate();

    const existing = await Attendance.findOne({
      student: studentId,
      class: classId,
      school: schoolId,
      date: formattedDate,
    });

    if (existing) {
      existing.status = status;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Attendance updated', data: existing });
    }

    const newAttendance = new Attendance({
      student: studentId,
      class: classId,
      school: schoolId,
      date: formattedDate,
      status,
    });

    await newAttendance.save();
    return res.status(201).json({ success: true, message: 'Attendance marked', data: newAttendance });
  } catch (err) {
    console.error('Error toggling attendance:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET student attendance
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;

    const records = await Attendance.find({ student: studentId, school: schoolId })
      .populate('student')
      .sort({ date: -1 });

    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// check if attendance taken
export const isAttendanceTaken = async (req, res) => {
  try {
    const {classId} = req.params;
    const schoolId = req.user.schoolId;

    const today = dayjs().startOf('day');

    const recordExists = await Attendance.findOne({
      class: classId,
      school: schoolId,
      date: {
        $gte:today.toDate(),
        $lte:dayjs(today).endOf('day').toDate()
      }
    });

    if(recordExists)
        return res.status(200).json({attendanceTaken:true,message:"Attendance already taken for today"});
    else
        return res.status(200).json({attendanceTaken:false,message:"Attendance not taken yet for today"});
  } catch (err) {
    console.error('Error checking attendance status:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
