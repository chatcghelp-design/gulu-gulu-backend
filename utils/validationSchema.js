const passValidation = 'required|password_pattern';
const sortOrder = 'in:ASC,DESC';
const validationSchema = {
    '/auth/login': {
        schema: {
            identity: 'required',
            loginType: 'required|in:email,quick',
            email: 'required_if:loginType,email|email',
            fcmToken: 'string'
        },
        message: {
            'email.required_if': 'Email is required when loginType is email.',
            'email.email': 'Please enter a valid email address.'
        }
    },
    // '/user/host-request': {
    //     schema: {
    //         languages: 'required|array',
    //         interests: 'required|array'
    //     }
    // },
    '/common/follow-unfollow': {
        schema: {
            id: 'required',
            action: 'required|in:follow,unfollow'
        }
    },
    '/admin/host-request/{requestId}': {
        schema: {
            action: 'required|in:approved,rejected'
        }
    },
    '/admin/gift-category': {
        schema: {
            name: 'required'
        }
    },
    '/admin/gift-category/{id}': {
        schema: {
            name: 'string',
            isActive: 'boolean'
        }
    },
    '/user/profile/update': {
        schema: {
            name: 'string',
            age: 'integer',
            bio: 'string',
            image: 'file'
        },
        message: {
            'name.string': 'Name must be a string',
            'age.integer': 'Age must be a number',
            'bio.string': 'Bio must be a string'
        }
    },
    '/admin/coin-plan/create': {
        schema: {
            name: 'required|string',
            coins: 'required|integer|min:1',
            rupees: 'required|numeric|min:1',
            dollars: 'required|numeric|min:0.01',
            description: 'required|string'
        },
        message: {
            'name.required': 'Plan name is required',
            'name.string': 'Plan name must be a string',
            'coins.required': 'Number of coins is required',
            'coins.integer': 'Coins must be a whole number',
            'coins.min': 'Coins must be at least 1',
            'rupees.required': 'Price in rupees is required',
            'rupees.numeric': 'Rupees must be a number',
            'rupees.min': 'Rupees must be at least 1',
            'dollars.required': 'Price in dollars is required',
            'dollars.numeric': 'Dollars must be a number',
            'dollars.min': 'Dollars must be at least 0.01',
            'description.required': 'Plan description is required',
            'description.string': 'Description must be a string'
        }
    },
    '/admin/coin-plan/update/{id}': {
        schema: {
            name: 'string',
            coins: 'integer|min:1',
            rupees: 'numeric|min:1',
            dollars: 'numeric|min:0.01',
            description: 'string',
            isActive: 'boolean'
        },
        message: {
            'name.string': 'Plan name must be a string',
            'coins.integer': 'Coins must be a whole number',
            'coins.min': 'Coins must be at least 1',
            'rupees.numeric': 'Rupees must be a number',
            'rupees.min': 'Rupees must be at least 1',
            'dollars.numeric': 'Dollars must be a number',
            'dollars.min': 'Dollars must be at least 0.01',
            'description.string': 'Description must be a string',
            'isActive.boolean': 'isActive must be true or false'
        }
    },
    '/common/coin-plans/purchase': {
        schema: {
            planId: 'required|string',
            paymentMethod: 'required|string',
            transactionId: 'required|string'
        },
        message: {
            'planId.required': 'Plan ID is required',
            'planId.string': 'Plan ID must be a string',
            'paymentMethod.required': 'Payment method is required',
            'paymentMethod.string': 'Payment method must be a string',
            'transactionId.required': 'Transaction ID is required',
            'transactionId.string': 'Transaction ID must be a string'
        }
    },
    '/common/complaint/submit': {
        schema: {
            message: 'required|string|min:10',
            contact: 'required|string'
        },
        message: {
            'message.required': 'Complaint message is required',
            'message.string': 'Message must be a string',
            'message.min': 'Message must be at least 10 characters long',
            'contact.required': 'Contact information is required',
            'contact.string': 'Contact must be a string'
        }
    },
    '/admin/complaint/{complaintId}/update-status': {
        schema: {
            status: 'required|in:open,in_progress,resolved,closed'
        },
        message: {
            'status.required': 'Status is required',
            'status.in': 'Status must be one of: open, in_progress, resolved, closed'
        }
    },
    '/admin/history/get': {
        schema: {
            roleType: 'required|in:user,host',
            id: 'required',
            historyType: 'required|in:coinHistory,planHistory,callHistory,giftHistory',
            start: 'integer',
            limit: 'integer'
        }
    }
};

module.exports = {
    passValidation,
    sortOrder,
    validationSchema
};
