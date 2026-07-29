const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getAdminProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const adminProfile = await db.Admin.findById(adminId).select('-password');

        if (!adminProfile) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ success: true, data: adminProfile });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
