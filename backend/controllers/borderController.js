const BorderStatus = require('../models/BorderStatus');

exports.getActiveStatuses = async (req, res) => {
  try {
    const statuses = await BorderStatus.find({ is_active: true })
      .sort({ display_order: 1, updated_at: -1 });

    res.json({ success: true, data: statuses });
  } catch (error) {
    console.error('Get border statuses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createStatus = async (req, res) => {
  try {
    const { border_name, status, estimated_wait_time, announcement, display_order } = req.body;

    const newStatus = new BorderStatus({
      border_name,
      status,
      estimated_wait_time,
      announcement,
      display_order: display_order || 0
    });

    await newStatus.save();
    res.json({ success: true, data: newStatus });
  } catch (error) {
    console.error('Create border status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date();

    const updatedStatus = await BorderStatus.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedStatus) {
      return res.status(404).json({ error: 'Border status not found' });
    }

    res.json({ success: true, data: updatedStatus });
  } catch (error) {
    console.error('Update border status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
