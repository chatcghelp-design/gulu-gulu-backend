const { db } = require('../../model/index.js');

// CREATE Banner
exports.createBanner = async (req, res) => {
    try {
        const { title, description, link, isForHost } = req.body;
        const banner = await db.Banner.create({
            title,
            description,
            link,
            isForHost: String(isForHost) === 'true',
            image: req.file ? req.file.path : null
        });
        res.status(200).json({ success: true, message: 'Banner created', data: banner });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// UPDATE Banner
exports.updateBanner = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.isForHost !== undefined) {
            updateData.isForHost = String(updateData.isForHost) === 'true';
        }
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updated = await db.Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.status(200).json({ success: true, message: 'Banner updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LIST Banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await db.Banner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'Banners fetched', data: banners });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE Banner
exports.deleteBanner = async (req, res) => {
    try {
        const deleted = await db.Banner.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Banner not found' });

        res.status(200).json({ success: true, message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
