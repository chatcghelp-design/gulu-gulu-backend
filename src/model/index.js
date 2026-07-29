const db = {};

db.User = require('./user.model.js');
// ==
db.DummyUser = require('./dummyUser.model.js');
db.Gift = require('./gift.model.js');
db.HostRequest = require('./hostRequest.model.js');
db.History = require('./history.model.js');
db.Setting = require('./setting.model.js');
db.Follower = require('./follower.model.js');
db.GiftCategory = require('./giftCategory.model.js');
db.Agency = require('./agency.model.js');
db.CoinPlan = require('./coinPlan.model.js');
db.Admin = require('./admin.model.js');
db.Language = require('./language.model.js');
db.Level = require('./level.model.js');
db.Image = require('./image.model.js');
db.Banner = require('./banner.model.js');
db.Complaint = require('./complaint.model.js');
db.Block = require('./block.model.js');
db.WithdrawRequest = require('./withdrawRequest.model.js');
db.Call = require('./call.model.js').Call;
db.WithdrawPayment = require('./withdrawPayment.model.js');
db.ScheduledNotification = require('./scheduledNotification.model.js');

module.exports = { db };
