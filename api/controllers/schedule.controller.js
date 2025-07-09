import Schedule from "../models/schedule.model.js";
import Teacher from "../models/teacher.model.js";
import Subject from "../models/subject.model.js";
import Class from "../models/class.model.js";

// CREATE schedule
export const createSchedule = async (req, res) => {
    try {
        const { teacher, subject, selectedClass, startTime, endTime } = req.body;

        const isOverlapping = await Schedule.findOne({
            class: selectedClass,
            school: req.user.schoolId,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });

        if (isOverlapping) {
            return res.status(400).json({
                success: false,
                message: 'This time slot overlaps with an existing session.',
            });
        }

        const newSchedule = new Schedule({
            school: req.user.schoolId,
            teacher,
            subject,
            class: selectedClass,
            startTime,
            endTime
        });
        await newSchedule.save();

        return res.status(200).json({
            success: true,
            message: "Schedule created successfully"
        });
    } catch (err) {
        console.error("Error creating schedule:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET all schedules for a school
export const getAllSchedules = async (req, res) => {
    try {
        const classId = req.params.id;
        const schoolId = req.user.schoolId;
        const schedules = await Schedule.find({ school: schoolId, class: classId }).populate(['teacher', 'subject']);

        return res.status(200).json({
            success: true,
            message: "Schedules fetched successfully",
            data: schedules
        });
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// GET single schedule by ID
export const getSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findById(id)

        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json({ success: true, data: schedule });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Server error while fetching schedule' });
    }
};

// UPDATE schedule
export const updateSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const schoolId = req.user.schoolId;
        const { selectedClass, startTime, endTime } = req.body;

        const isOverlapping = await Schedule.findOne({
            _id: { $ne: scheduleId },
            class: selectedClass,
            school: schoolId,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });

        if (isOverlapping) {
            return res.status(400).json({
                success: false,
                message: 'This time slot overlaps with another existing session.',
            });
        }

        const updated = await Schedule.findOneAndUpdate({ _id: scheduleId, school: schoolId }, { ...req.body }, { new: true });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found or unauthorized to update"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            data: updated
        });

    } catch (error) {
        console.error("Error updating schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// DELETE schedule
export const deleteSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const schoolId = req.user.schoolId;

        await Schedule.findOneAndDelete({ _id: scheduleId, school: schoolId });
        return res.status(200).json({
            success: true,
            message: "Schedule deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
