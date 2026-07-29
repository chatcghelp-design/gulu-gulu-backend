const { get_message } = require('./message.js');
let RESPONSE = {};

RESPONSE.success = async function (res, status_code = 200, message_code = '', data = '', extra = {}) {
    let response = {};
    response.success = true;
    response.message = get_message(message_code);
    response.data = data;
    if (extra && Object.keys(extra).length > 0) {
        Object.assign(response, extra);
    }
    return res.status(status_code).send(response);
};

RESPONSE.error = async function (res, status_code = 422, message_code = '', error = '', data) {
    let response = {};
    response.success = false;
    response.message = get_message(message_code);
    response.error = error;
    response.data = data;
    return res.status(status_code).send(response);
};

module.exports = RESPONSE;
