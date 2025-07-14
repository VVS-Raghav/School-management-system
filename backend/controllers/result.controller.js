import Result from '../models/result.model.js';

export const uploadResult = async (req, res) => {
  try {
    const { examId, results } = req.body;

    if (!examId || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const existing = await Result.find({ examId});

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Results for this exam and class have already been submitted.',
      });
    }

    const resultDocs = results.map(r => ({
      studentId: r.studentId,
      examId,
      subjectMarks: r.subjectMarks,
      totalMarks: r.totalMarks || 0
    }));

    const insertedResults = await Result.insertMany(resultDocs);

    res.status(201).json({
      success: true,
      message: 'Results uploaded successfully',
      data: insertedResults,
    });

  } catch (error) {
    console.error('Bulk Upload Result Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const examId = req.params.examId;

    if (!examId) {
      return res.status(400).json({ success: false, message: 'Exam ID is required' });
    }

    const result = await Result.findOne({ studentId, examId })
      .populate({
        path: 'examId',
        populate: {
          path: 'subjects.subject',
          model: 'Subject'
        }
      })
      .populate({
        path: 'subjectMarks.subject',
        model: 'Subject'
      })
      .populate('studentId');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found for this exam' });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get Student Result Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Get results for a specific class and exam
// @route   GET /api/results/class/:classId?examType=Final
// @access  Admin/Teacher
// export const getClassResults = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const { examType } = req.query;

//     const query = { classId };
//     if (examType) query.examType = examType;

//     const results = await Result.find(query).populate('studentId', 'name rollNo');

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error('Get Class Results Error:', error.message);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };