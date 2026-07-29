const jwt = require('jsonwebtoken');
const RESPONSE = require('../../utils/response.js');
const { db } = require('../../src/model/index.js');

exports.user_auth = async (req, res, next) => {
    try {
        const exclude_employee_auth_routes = ['/auth'];
        req.request_url = req.url?.split('/')?.[1] || null;
        if (exclude_employee_auth_routes.includes(`/${req.request_url}`)) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return RESPONSE.error(res, 401, 3001, 'No token provided');
        }
        const currentPath = req.path || '';
        const roleRouteAccess = {
            admin: ['/admin', '/admin-agency', '/agency'],
            agency: ['/admin-agency', '/agency'],
            user: ['/user', '/common', '/host']
        };
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.role = decoded.role;
            const allowedRoutes = roleRouteAccess[req.role] || [];
            const isAllowed = allowedRoutes.some(prefix => currentPath.startsWith(prefix));

            if (!isAllowed) {
                return RESPONSE.error(res, 403, 4444);
            }

            if (decoded.role == 'user') {
                const user = await db.User.findOne({ _id: decoded.id, isDeleted: false });
                if (!user || user.isDeleted) {
                    return RESPONSE.error(res, 500, 3002, null);
                } else if (user.isBlocked) {
                    return RESPONSE.error(res, 500, 3003, null);
                }
                req.user = decoded;
                req.user.isHost = user.isHost;
                next();
            } else if (decoded.role == 'admin') {
                const admin = await db.Admin.findById(decoded.id);
                if (!admin) {
                    return RESPONSE.error(res, 500, 3002, null);
                }
                req.admin = decoded;
                next();
            } else if (decoded.role == 'agency') {
                if (globalSetting.isAgency == false) {
                    return RESPONSE.error(res, 500, 'You Blocked By Admin');
                }
                const agency = await db.Agency.findById(decoded.id);
                if (!agency) {
                    return RESPONSE.error(res, 500, 3002, null);
                }
                req.agency = decoded;
                next();
            } else {
                return RESPONSE.error(res, 500, 3003, null); // @todo
            }
        } catch (err) {
            console.log('------------Error verifying token:', err);
            if (err.name === 'TokenExpiredError') {
                return RESPONSE.error(res, 401, 3001, 'Token Expired');
            }
            return RESPONSE.error(res, 401, 3001, 'Invalid Token');
        }
    } catch (e) {
        console.log('error in user auth', e);
        return RESPONSE.error(res, 500, 9999, e.message);
    }
};

exports.verifyToken = async token => {
    try {
        let userObj = {};
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('token', decoded, process.env.JWT_SECRET, token);

        const user = await db.User.findById(decoded.id);
        if (!user || user.isDeleted) {
            throw new Error('User not found');
        } else if (user.isBlocked) {
            throw new Error('User is blocked');
        }
        userObj = decoded;
        userObj.isHost = user.isHost;
        return userObj;
    } catch (err) {
        console.log('err :>> ', err);
        throw new Error('Invalid token');
    }
};
