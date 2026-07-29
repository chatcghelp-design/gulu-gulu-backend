const { db } = require('../../model/index.js');

exports.addDummyUsers = async (req, res) => {
    try {
        const { name, bio } = req.body;

        if (!name || !bio || !req.files || req.files.length === 0) {
            return res.status(400).json({ status: false, error: 'name, bio, and at least one image are required' });
        }

        // Ensure name and bio are strings (handles if frontend sends them as arrays)
        const finalName = Array.isArray(name) ? name[0] : name;
        const finalBio = Array.isArray(bio) ? bio[0] : bio;

        // First image is avatar, and all images go to gallery
        const avatar = req.files[0].path;
        const images = req.files.map(file => file.path);

        // Create a single dummy user persona
        const dummyUser = {
            name: finalName,
            bio: finalBio,
            avatar,
            image: images
        };

        // Insert a single document with array fields
        const result = await db.DummyUser.create(dummyUser);

        res.status(201).json({ status: true, data: result });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.updateDummyUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio } = req.body;

        const dummyUser = await db.DummyUser.findById(id);

        if (!dummyUser) {
            return res.status(404).json({ status: false, error: 'Dummy User not found' });
        }

        if (name) {
            dummyUser.name = Array.isArray(name) ? name[0] : name;
        }
        if (bio) {
            dummyUser.bio = Array.isArray(bio) ? bio[0] : bio;
        }
        if (req.files && req.files.length > 0) {
            dummyUser.avatar = req.files[0].path;
            dummyUser.image = req.files.map(file => file.path);
        }

        await dummyUser.save();

        res.status(200).json({ status: true, data: dummyUser });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.getDummyUsers = async (req, res) => {
    try {
        const dummyUsers = await db.DummyUser.find();
        res.status(200).json({ status: true, data: dummyUsers });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.getDummyUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const dummyUser = await db.DummyUser.findById(id);

        if (!dummyUser) {
            return res.status(404).json({ status: false, error: 'Dummy User not found' });
        }

        res.status(200).json({ status: true, data: dummyUser });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};
