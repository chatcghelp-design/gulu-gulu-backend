const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.submitComplaint = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message, contact } = req.body;

        console.log('Submit complaint body:', req.body);
        console.log('Submit complaint file:', req.file);

        if (!message || typeof message !== 'string' || message.trim().length < 10) {
            return RESPONSE.error(res, 400, '', 'Message must be at least 10 characters long');
        }

        if (!contact || typeof contact !== 'string') {
            return RESPONSE.error(res, 400, '', 'Contact information is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

        if (!emailRegex.test(contact) && !phoneRegex.test(contact.replace(/\s/g, ''))) {
            return RESPONSE.error(res, 400, '', 'Please provide a valid email or phone number');
        }

        const complaintData = {
            userId,
            message: message.trim(),
            contact: contact.trim(),
            status: 'open'
        };

        if (req.file && req.file.path) {
            complaintData.image = req.file.path;
        }

        const complaint = new db.Complaint(complaintData);
        await complaint.save();

        return RESPONSE.success(res, 201, 7001, {
            id: complaint._id,
            message: complaint.message,
            contact: complaint.contact,
            status: complaint.status,
            adminResponse: complaint.adminResponse,
            image: complaint.image,
            createdAt: complaint.createdAt
        });
    } catch (err) {
        console.error('Error submitting complaint:', err);
        return RESPONSE.error(res, 500, 'error', err.message);
    }
};

exports.updateComplaintByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { complaintId } = req.params;
        const { message, contact } = req.body;

        const complaint = await db.Complaint.findOne({ _id: complaintId, userId });
        if (!complaint) {
            return RESPONSE.error(res, 404, 7002);
        }

        if (complaint.status === 'closed') {
            return RESPONSE.error(res, 400,'', 'You cannot edit a closed complaint');
        }
        if (message && message.trim().length < 10) {
            return RESPONSE.error(res, 400, '', 'Message must be at least 10 characters long');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (contact && !emailRegex.test(contact) && !phoneRegex.test(contact.replace(/\s/g, ''))) {
            return RESPONSE.error(res, 400, '', 'Please provide a valid email or phone number');
        }

        if (message) complaint.message = message.trim();
        if (contact) complaint.contact = contact.trim();
        if (req.file && req.file.path) {
            complaint.image = req.file.path;
        }

        complaint.modifyDateAt = new Date();
        await complaint.save();

        return RESPONSE.success(res, 200, 1001, {
            id: complaint._id,
            message: complaint.message,
            contact: complaint.contact,
            image: complaint.image,
            status: complaint.status,
            adminResponse: complaint.adminResponse,
            updatedAt: complaint.modifyDateAt
        });
    } catch (err) {
        console.error('Error updating complaint:', err);
        return RESPONSE.error(res, 500, err.message);
    }
};

exports.getComplaintDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const complaint = await db.Complaint.find({ userId }).sort({ createdAt: -1 });
        return RESPONSE.success(res, 200, 1001, complaint);
    } catch (err) {
        console.error('Error getting complaint details:', err);
        return RESPONSE.error(res, 500, err.message);
    }
};
