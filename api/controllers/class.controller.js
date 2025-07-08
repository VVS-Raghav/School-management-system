import Class from "../models/class.model.js";
import Student from "../models/student.model.js";
import Exam from "../models/examination.model.js";
import Schedule from "../models/schedule.model.js";

export const createClass = async (req, res) => {
    try {
        const newClass = new Class({
            school: req.user.schoolId,
            class_text: req.body.class_text,
            class_num: req.body.class_num
        })
        await newClass.save();
        res.status(200).json({ success: true, message: "Successfully created the class" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error in creating class" });
    }
}

export const deleteClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const schoolId = req.user.schoolId;

        const isStudentLinked = await Student.exists({ student_class: classId, school: schoolId });
        const isExamLinked = await Exam.exists({ class: classId, school: schoolId });
        const isScheduleLinked = await Schedule.exists({ class: classId, school: schoolId });

        if (isStudentLinked || isExamLinked || isScheduleLinked) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete. Class is in use by students, exams, or schedules.",
            });
        }

        await Class.findOneAndDelete({ _id: classId, school: schoolId });

        return res.status(200).json({
            success: true,
            message: "Class deleted successfully",
        });

    } catch (error) {
        console.error("Error deleting class:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllClasses = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const classes = await Class.find({ school: schoolId });
        return res.status(200).json({
            success: true,
            message: "Classes fetched successfully",
            data: classes,
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
