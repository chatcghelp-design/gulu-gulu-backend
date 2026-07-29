const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/user/account.controller.js');

/**
 * @swagger
 * /user/account/delete:
 *   delete:
 *     summary: Delete user account (soft delete)
 *     description: Marks the user account as deleted. User data is retained but account becomes inaccessible.
 *     tags:
 *       - User Account
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Your account has been deleted. You can no longer access this account."
 *       404:
 *         description: User not found or already deleted
 *       500:
 *         description: Internal server error
 */
router.delete('/delete', accountController.deleteAccount);

module.exports = router;
