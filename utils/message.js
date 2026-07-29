const MESSAGES = {
    // Basic
    1001: 'Success',

    // Login
    2001: 'Login successfully',
    2002: 'Invalid token',
    2003: 'Email alredy exists',

    // User/Host/Common
    3001: 'Invalid token',
    3002: 'User or host does not exist',
    3003: 'You have been blocked by the admin',
    3004: 'Only female users can send host requests',
    3005: 'Host request already exists or is approved',
    3006: 'Invalid agency code',
    3007: 'Host request sent to admin',
    3008: 'Image is required',
    3009: 'Host request not found',
    3010: 'User not found',
    3011: 'User profile not found',
    3012: 'Host profile not found',
    3013: 'email alredy exists',
    3014: 'User is busy with someone else !!',

    // Follow
    4001: 'Already following',
    4002: 'Followed successfully',
    4003: 'Unfollowed successfully',
    4004: 'Invalid request',
    4005: 'Cannot follow/unfollow yourself',

    // Gifts
    5001: 'Category already exists',

    // Coin Plans
    6001: 'Coin plan created successfully',
    6002: 'Coin plan updated successfully',
    6003: 'Coin plan not found',
    6004: 'All fields are required',
    6005: 'Coins, rupees and dollars must be greater than 0',
    6006: 'Invalid coin plan data',
    6007: 'All coin plans retrieved successfully',
    6008: 'Active coin plans retrieved successfully',
    6009: 'Plan ID, payment method and transaction ID are required',
    6010: 'Plan purchased successfully',

    // Complaint
    7001: 'Complaint submitted successfully',
    7002: 'Complaint not found',
    7003: 'Complaint status updated',
    7004: 'Response submitted successfully',

    // block
    8001: 'Already Blocked',
    8002: 'Blocked successfully',
    8003: 'UnBlocked successfully',
    8004: 'Inavlid request',
    8005: 'Oops !! user or host is not blocked',
    8006: 'You blocked this user or host',
    8007: 'You blocked by that user or host',
    8008: 'Block list get successfully',

    // hostrequest
    9001: 'Host request not found',
    9002: 'Host request already exists or is approved',
    9003: 'Host request sent to admin',
    9004: 'Host request appoved',
    9005: 'Host request rejected',

    // agency
    1101: 'Agency Not found',
    1102: 'Agency Code is required',
    1103: 'Agency Already Disabled',

    // withdraw request
    1201: 'Withdraw request created successfully',
    1202: 'Withdraw request not found',
    1203: 'Withdraw request already exists or is approved',
    1204: 'Withdraw request sent successfully',
    1205: 'Withdraw request appoved',
    1206: 'Withdraw request declined',
    1207: 'Your coins is not enough',
    1208: 'Withdraw ID is required',
    1209: 'get withdraw list successfully',

    // ads
    1301: 'Ads limit reached for today',
    // api error
    9999: 'Something went wrong !!',
    4444: 'Access denied for this route'
};

const get_message = message_code => {
    if (isNaN(message_code)) {
        return message_code;
    }
    return message_code ? MESSAGES[message_code] : message_code;
};

module.exports = { get_message };
