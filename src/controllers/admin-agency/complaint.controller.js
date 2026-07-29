const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getAllComplains = async (req, res) => {
    try {
        const { role } = req;
        if (role !== 'admin' && role !== 'agency') {
            return RESPONSE.error(res, 403,'', 'Access denied');
        }

        const { status, page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const complaintFilter = {};
        const userFilter = {};

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { uniqueId: { $regex: search, $options: 'i' } }
            ];
        }

        if (role === 'agency') {
            userFilter.isHost = true;
            userFilter['hostProfile.agencyId'] = req.agency.id;
        }
        const users = await db.User.find(userFilter).select('_id');
        const userIds = users.map(u => u._id);

        if (role === 'agency' || search) {
            if (userIds.length === 0) {
                return RESPONSE.success(res, 200, 'complaint.list', {
                    total: 0,
                    page: Number(page),
                    limit: Number(limit),
                    complaints: []
                });
            }
            complaintFilter.userId = { $in: userIds };
        }

        if (status) {
            complaintFilter.status = status;
        }
        const complaints = await db.Complaint.find(complaintFilter)
            .populate('userId', 'name avatar uniqueId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await db.Complaint.countDocuments(complaintFilter);

        const data = complaints.map(c => ({
            id: c._id,
            contact: c.contact,
            message: c.message,
            status: c.status,
            adminResponse: c.adminResponse,
            image: c.image,
            createdAt: c.createdAt,
            user: {
                id: c.userId?._id,
                name: c.userId?.name || '',
                avatar: c.userId?.avatar || '',
                uniqueId: c.userId?.uniqueId || ''
            }
        }));

        return RESPONSE.success(res, 200, 'complaint.list', {
            total,
            page: Number(page),
            limit: Number(limit),
            complaints: data
        });
    } catch (err) {
        console.error('Error fetching complaints:', err);
        return RESPONSE.error(res, 500, 'common.internal_server_error', err.message);
    }
};

exports.resolveComplaint = async (req, res) => {
    try {
        const { complainId } = req.params;
        const { status, adminResponse } = req.body;

        if (!status || !['open', 'closed'].includes(status)) {
            return res.status(400).json({ status: false, message: 'Invalid or missing status' });
        }

        const complaint = await db.Complaint.findById(complainId);
        if (!complaint) {
            return res.status(404).json({ status: false, message: 'Complaint not found' });
        }
        let resolvedBy;
        let resolvedByRole;

        if (req.admin) {
            resolvedBy = req.admin.id;
            resolvedByRole = 'admin';
        } else if (req.agency) {
            resolvedBy = req.agency.id;
            resolvedByRole = 'agency';
        } else {
            return res.status(403).json({ status: false, message: 'Access denied' });
        }
        // Update only allowed fields
        complaint.status = status;
        complaint.adminResponse = adminResponse;
        complaint.resolvedBy = resolvedBy;
        complaint.resolvedByRole = resolvedByRole;
        complaint.modifyDateAt = new Date();

        await complaint.save();

        res.status(200).json({ status: true, message: 'Complaint updated successfully', data: complaint });
    } catch (err) {
        console.error('resolveComplaint error:', err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
