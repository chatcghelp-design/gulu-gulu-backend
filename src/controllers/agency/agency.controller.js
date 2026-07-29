const { db } = require('../../model/index.js');
const jwt = require('jsonwebtoken');
const RESPONSE = require('../../../utils/response.js');
const { generateCodeForAgency } = require('../../../utils/function.js');

exports.createAgency = async (req, res) => {
    try {
        const { password, name, email, mobileNo } = req.body;

        if (!password || !name || !mobileNo) {
            return res.status(400).json({ status: false, message: 'code, password, name, and mobileNo are required' });
        }
        const code = await generateCodeForAgency(4);
        // Save password as plain text
        const agency = await db.Agency.create({
            code,
            password,
            name,
            email,
            mobileNo
        });
        res.status(201).json({ status: true, data: agency });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.agencyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'email and password are required' });
        }

        const agency = await db.Agency.findOne({ email });
        if (!agency) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // Compare plain text passwords
        if (password !== agency.password) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // JWT token
        const token = jwt.sign(
            { id: agency._id, name: agency.name, code: agency.code, role: 'agency' },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({ status: true, token, agency });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.updateAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, password, name, approveDate, email, isDisable, mobileNo, totalBalance, tax } = req.body;

        const agency = await db.Agency.findById(id);
        if (!agency) {
            return RESPONSE.error(res, 404, 'Agency not found');
        }

        if (code !== undefined) agency.code = code;
        if (password !== undefined) agency.password = password;
        if (name !== undefined) agency.name = name;
        if (approveDate !== undefined) agency.approveDate = approveDate;
        if (email !== undefined) agency.email = email;
        if (isDisable !== undefined) agency.isDisable = isDisable;
        if (mobileNo !== undefined) agency.mobileNo = mobileNo;
        if (totalBalance !== undefined) agency.totalBalance = totalBalance;
        
        if (tax !== undefined) {
            if (req.role !== 'admin') {
                return RESPONSE.error(res, 403, '', 'Only admin can update commission (tax)');
            }
            agency.tax = tax;
        }

        await agency.save();

        return RESPONSE.success(res, 200, 'agency.updated', agency);
    } catch (err) {
        console.error('Error updating agency:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};

exports.getAgencyProfile = async (req, res) => {
    try {
        const { role } = req;
        const { id } = req.agency;
        if (role !== 'agency') {
            return RESPONSE.error(res, 403, '', 'Access denied');
        }
        const agency = await db.Agency.findById(id).select('-password');
        if (!agency) {
            return RESPONSE.error(res, 404, 'Agency not found');
        }
        return RESPONSE.success(res, 200, 'agency.profile.found', agency);
    } catch (err) {
        console.error('Error fetching agency profile:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};

exports.deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;

        const agency = await db.Agency.findById(id);
        if (!agency) {
            return RESPONSE.error(res, 404, 'Agency not found');
        }

        // Soft delete: set isDeleted to true instead of removing from database
        agency.isDeleted = true;
        await agency.save();

        return RESPONSE.success(res, 200, 'agency.deleted', {
            message: 'Agency deleted successfully',
            isDeleted: true
        });
    } catch (err) {
        console.error('Error deleting agency:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};
