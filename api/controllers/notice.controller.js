import Notice from '../models/notice.model.js';

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    const school = req.user.schoolId;
    const { title, message, audience } = req.body;

    const newNotice = new Notice({
      school,
      title,
      message,
      audience,
    });
    
    await newNotice.save();
    res.status(201).json({ message: 'Notice created successfully', data: newNotice });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
};

// Get all notices for a school for a role
export const getAllNotices = async (req, res) => {
  try {
    const school = req.user.schoolId;
    const role = req.user.role;
    const today = new Date();
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));

    const filter = {
      school,
      createdAt: { $gte: sevenDaysAgo }
    };

    if (role !== 'SCHOOL') {
      filter.audience = { $in: ['ALL', role] };
    }

    const notices = await Notice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({message: 'Notices fetched successfully',data: notices});
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
};

// Update a notice by ID
export const updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, message, audience } = req.body;

    const updated = await Notice.findByIdAndUpdate(
      noticeId,
      { title, message, audience },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Notice not found' });
    res.status(200).json({ message: 'Notice updated successfully', data: updated});
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
};

// Delete a notice by ID
export const deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const deleted = await Notice.findByIdAndDelete(noticeId);

    if (!deleted) return res.status(404).json({ error: 'Notice not found' });
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
};