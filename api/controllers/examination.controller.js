import Exam from '../models/examination.model.js';

// Create a new examination
export const newExamination = async (req, res) => {
  try {
    const { classId, subject, examDate, examType } = req.body;
    const school = req.user.schoolId;
    const exam = new Exam({
      school,
      class:classId,
      subject,
      examDate,
      examType
    });

    await exam.save();
    res.status(201).json({ message: 'Examination created successfully', exam });
  } catch (error) {
    console.error('Error in creating examination:', error);
    res.status(500).json({ error: 'Failed to create examination' });
  }
};

// Get all examinations
export const getAllExaminations = async (req, res) => {
  try {
    const school = req.user.schoolId;
    const exams = await Exam.find({ school })
      .populate('class', 'class_text class_num')
      .populate('subject', 'subject_name')
      .sort({ examDate: 1 });

    res.status(200).json({ message: "Exams fetched successfully", exams });
  } catch (error) {
    console.error('Error fetching examinations:', error);
    res.status(500).json({ error: 'Failed to fetch examinations' });
  }
};

// Get examination by class id
export const getExaminationsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const school = req.user.schoolId;
    const exams = await Exam.find({ class: classId, school })
      .populate('class', 'class_text class_num')
      .populate('subject', 'subject_name')
      .sort({ examDate: 1 });

    res.status(200).json({ message: "Exams fetched successfully", exams });
  } catch (error) {
    console.error('Error fetching exams by class:', error);
    res.status(500).json({ error: 'Failed to fetch exams for class' });
  }
};


// Update examination by ID
export const updateExaminationById = async (req, res) => {
  try {
    const { examId } = req.params;
    const updatedData = req.body;

    const updatedExam = await Exam.findByIdAndUpdate(examId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedExam) {
      return res.status(404).json({ error: 'Examination not found' });
    }
    res.status(200).json({ message: 'Examination updated successfully', updatedExam });
  } catch (error) {
    console.error('Error in updating examination:', error);
    res.status(500).json({ error: 'Failed to update examination' });
  }
};

// Delete examination by ID
export const deleteExaminationById = async (req, res) => {
  try {
    const { examId } = req.params;
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) return res.status(404).json({ error: 'Examination not found' });

    res.status(200).json({ message: 'Examination deleted successfully' });
  } catch (error) {
    console.error('Error in deleting examination:', error);
    res.status(500).json({ error: 'Failed to delete examination' });
  }
};