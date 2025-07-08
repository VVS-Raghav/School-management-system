import Subject from "../models/subject.model.js";
import Exam from "../models/examination.model.js";
import Schedule from "../models/schedule.model.js";

export const createSubject = async (req, res) => {
    try {
        const newSubject = new Subject({
            school: req.user.schoolId,
            subject_name: req.body.subject_name,
            subject_code: req.body.subject_code
        })
        await newSubject.save();
        res.status(200).json({ success: true, message: "Successfully created the subject" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error in creating subject" });
    }
}

export const deleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const schoolId = req.user.schoolId;

        const isExamLinked = await Exam.exists({ subject: subjectId, school: schoolId });
        const isScheduleLinked = await Schedule.exists({ subject: subjectId, school: schoolId });

        if (isExamLinked || isScheduleLinked) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete. Subject is in use by exams or schedules.",
            });
        }

        await Subject.findOneAndDelete({ _id: subjectId, school: schoolId });

        return res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllSubjects = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const subjects = await Subject.find({ school: schoolId });
        return res.status(200).json({
            success: true,
            message: "Subjects fetched successfully",
            data: subjects,
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
