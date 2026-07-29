const mongoose = require('mongoose');

const dummyUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    image: [{ type: String, default: '' }]
});

const dummyUsersContainerSchema = new mongoose.Schema({
    users: [dummyUserSchema] // Array of dummy user objects
});

module.exports = mongoose.model('DummyUser', dummyUserSchema);
