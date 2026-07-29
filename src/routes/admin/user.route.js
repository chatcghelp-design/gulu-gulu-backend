const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller.js');


/**
 * @swagger
 * /admin/user/get-user:
 *   get:
 *     summary: Get all users with pagination
 *     description: Retrieve a paginated list of users with optional search functionality.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for pagination (skip count)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to fetch
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, uniqueID, or email
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: "Successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of users matching criteria
 *                     limit:
 *                       type: integer
 *                       description: Limit applied
 *                     start:
 *                       type: integer
 *                       description: Start offset applied
 *                     totalPage:
 *                       type: integer
 *                       description: Total number of pages
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           uniqueId:
 *                             type: string
 *                           isOnline:
 *                             type: boolean
 *                           isDeleted:
 *                             type: boolean
 *                           coins:
 *                             type: number
 *       500:
 *         description: Internal server error
 */
router.get('/get-user', userController.getAllUser);
router.get('/get-user/:userId', userController.getUserById);

/**
 * @swagger
 * /admin/user/coinByAdmin:
 *   put:
 *     summary: Update a user's coin balance by admin
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64dc9f07a12b3f001e5c9d1a
 *         description: The ID of the user
 *       - in: query
 *         name: coins
 *         required: true
 *         schema:
 *           type: integer
 *           example: 50
 *         description: The new coin value to set for the user
 *     responses:
 *       200:
 *         description: Coin balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 1001
 *                 data:
 *                   type: object
 *                   properties:
 *                     coin:
 *                       type: integer
 *                       example: 50
 *                     updatedCoin:
 *                       type: integer
 *                       example: -10
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.put('/coinByAdmin', userController.coinByAdmin);


module.exports = router;
