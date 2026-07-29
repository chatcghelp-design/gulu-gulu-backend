require('dotenv').config();
require('./middleware/database/connectDatabase');
const { db } = require('./src/model/index.js');

setTimeout(async () => {
    try {
        const userFilter = { isDeleted: false, isHost: true };
        const raw = await db.User.aggregate([
            { $match: userFilter },
            { $limit: 20 }
        ]);

        const users = await db.User.populate(raw, { path: 'hostProfile.agencyId', select: 'name' });
        console.log('Populated length:', users.length);
        console.log('Sample users[0]:', users[0]);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}, 2000);
