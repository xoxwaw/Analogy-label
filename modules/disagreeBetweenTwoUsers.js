var mongoose = require('mongoose');

const disagreeSchema = new mongoose.Schema({
    sentence: String,
    num_id : Number,
    base: String,
    target: String,
    user1 : Number,
    user2 : Number
});
let DisagreeBetweenTwoUsers = mongoose.model(
    'disagreement',
     disagreeSchema
);
module.exports = DisagreeBetweenTwoUsers;
