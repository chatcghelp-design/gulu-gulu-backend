const route = require('express').Router();
const hostController = require('../../controllers/admin/host.controller.js');
const upload = require('../../../middleware/multer.js');

/**
 * @swagger
 * /admin/host/fake:
 *   post:
 *     summary: Create a fake host (used for testing or seeding)
 *     tags:
 *       - Host
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Name of the host"
 *               email:
 *                 type: string
 *                 description: "Email of the host"
 *               age:
 *                 type: integer
 *                 description: "Age of the host"
 *               bio:
 *                 type: string
 *                 description: "Short biography"
 *               avatar:
 *                 type: string
 *                 description: "Avatar URL (used if imageType = 2)"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Interests of the host"
 *               imageType:
 *                 type: integer
 *                 enum: [1, 2]
 *                 default: 1
 *                 description: "1 = image file upload, 2 = avatar URL"
 *               videoType:
 *                 type: integer
 *                 enum: [1, 2]
 *                 default: 1
 *                 description: "1 = video file upload, 2 = video URL"
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Multiple image files (used if imageType = 1). First image will be used as avatar."
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: "Video file (used if videoType = 1). For videoType = 2, send video URL as string in 'video' field."
 *               countryCode:
 *                 type: string
 *                 description: "Country code of the host"
 *               country:
 *                 type: string
 *                 description: "Country of the host"
 *     responses:
 *       200:
 *         description: Fake host created successfully
 *       400:
 *         description: Validation or duplicate error
 *       500:
 *         description: Server error
 */

route.post('/fake', upload.fields([{ name: 'image' }, { name: 'video' }]), hostController.createFakeHost);

route.put('/fake/:id', upload.fields([{ name: 'image' }, { name: 'video' }]), hostController.updateFakeHost);

module.exports = route;
