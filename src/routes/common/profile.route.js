const express = require('express');
const router = express.Router();
const commonController = require('../../controllers/common/userHost.controller');
const upload = require('../../../middleware/multer');


/**
 * @swagger
 * /common/profile/update:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               age:
 *                 type: integer
 *                 example: 25
 *               bio:
 *                 type: string
 *                 example: Love to travel and meet new people.
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *               fcmToken:
 *                 type: string
 *               videoCallCharge:
 *                 type: number
 *                 example: 50
 *               audioCallCharge:
 *                 type: number
 *                 example: 30
 *               chatCharge:
 *                 type: number
 *                 example: 10
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "Spanish"]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Singing", "Dancing"]
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Upload single avatar image
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload multiple gallery images
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input or minimum charge requirement not met
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put(
    '/update',
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "image", maxCount: 10 }
    ]),
    commonController.updateProfile
  );
  
/**
 * @swagger
 * /common/profile/get-all-user-host:
 *   get:
 *     summary: Get all users or hosts excluding the logged-in user
 *     tags:
 *       - Common
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by name, email, or uniqueId
 *       - in: query
 *         name: laungageSearch
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by language (hostProfile.languages)
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *         required: false
 *         description: Pagination start index
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: false
 *         description: Number of records to return
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users or hosts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f6f4d8c45a5e001e8c3e6a"
 *                       name:
 *                         type: string
 *                         example: "Jane Doe"
 *                       email:
 *                         type: string
 *                         example: "jane@example.com"
 *                       uniqueId:
 *                         type: string
 *                         example: "USER123456"
 *                       isHost:
 *                         type: boolean
 *                         example: false
 *                       isFollow:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get('/get-all-user-host', commonController.getAllUserHost);

/**
 * @swagger
 * /common/profile/get-other-profile-by-id:
 *   get:
 *     summary: Get other user's or host's profile by ID
 *     tags:
 *       - Common
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user or host to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60f6f4d8c45a5e001e8c3e6a"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     isHost:
 *                       type: boolean
 *                       example: true
 *                     isFollow:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/get-other-profile-by-id', commonController.getOtherProfileById);

/**
 * @swagger
 * /common/profile/get-profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/get-profile', commonController.getProfile);

// saveFcmToken
/**
 * @swagger
 * /common/profile/save-fcm-token:
 *   post:
 *     summary: Save FCM token
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: "fcmToken"
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *       500:
 *         description: Server error
 */
router.post('/save-fcm-token', commonController.saveFcmToken);

/**
 * @swagger
 * /common/profile/delete-account:
 *   delete:
 *     summary: Delete account
 *     description: Deletes the currently authenticated user's account.
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized. User not logged in or invalid token.
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-account', commonController.deleteAccount);

/**
 * @swagger
 * /common/profile/delete-image/{imageId}:
 *   delete:
 *     summary: Delete a user image
 *     description: Soft delete an image by setting isDeleted to true. Only the image owner can delete their own images.
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB _id of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Image deleted successfully"
 *                     imageId:
 *                       type: string
 *       400:
 *         description: Image ID is required
 *       404:
 *         description: Image not found or already deleted
 *       401:
 *         description: Unauthorized. User not logged in or invalid token.
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-image/:imageId', commonController.deleteImage);


/**
 * @swagger
 * /common/profile/get-all-levels:
 *   get:
 *     tags:
 *       - Level
 *     summary: Get all levels (Common)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   level:
 *                     type: number
 *                   coinRequirement:
 *                     type: number
 *                   image:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/get-all-levels', commonController.getLevels);

/**
 * @swagger
 * /common/profile/get-fake-hosts:
 *   get:
 *     summary: Get only fake hosts list
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fake hosts fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/get-fake-hosts', commonController.getFakeHosts);

module.exports = router;
