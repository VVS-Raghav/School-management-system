import Exam from '../models/examination.model.js';

// ✅ Create a new Exam (with multiple subjects)
export const newExamination = async (req, res) => {
  try {
    const { classId, examType, examSession, subjects } = req.body; // subjects: [{ subject, examDate }]
    const school = req.user.schoolId;

    if (!classId || !examType || !examSession || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or subjects array' });
    }

    const exam = new Exam({
      school,
      class: classId,
      examType,
      examSession,
      subjects
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};



// ✅ Get all Exams for the current school
export const getAllExaminations = async (req, res) => {
  try {
    const school = req.user.schoolId;

    const exams = await Exam.find({ school })
      .populate('class', 'class_text class_num')
      .populate('subjects.subject', 'subject_name')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Exams fetched successfully', exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};


// ✅ Get Exams by Class
export const getExaminationsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const school = req.user.schoolId;

    const exams = await Exam.find({ class: classId, school })
      .populate('class', 'class_text class_num')
      .populate('subjects.subject', 'subject_name')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Exams fetched successfully', exams });
  } catch (error) {
    console.error('Error fetching exams by class:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};


// Get Exam by Id
export const getExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const school = req.user.schoolId; // optional, if you're using auth

    const exam = await Exam.findOne({ _id: examId, school })
      .populate('class', 'class_text class_num')
      .populate('subjects.subject', 'subject_name');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error('Error fetching exam by ID:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ✅ Update Exam by ID
export const updateExaminationById = async (req, res) => {
  try {
    const { examId } = req.params;
    const updatedData = req.body;

    const updatedExam = await Exam.findByIdAndUpdate(examId, updatedData, {
      new: true,
      runValidators: true
    });

    if (!updatedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json({ message: 'Exam updated successfully', updatedExam });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};


// ✅ Delete Exam by ID
export const deleteExaminationById = async (req, res) => {
  try {
    const { examId } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};