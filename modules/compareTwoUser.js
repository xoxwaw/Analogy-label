var mongoose = require('mongoose');

const compareuserSchema = new mongoose.Schema({
    user1 : String,
    user2 : String,
    agreeNum: Number,
    disagreeNum: Number,
    
});
let CompareTwoUsers = mongoose.model(
    'usercomparison',
     compareuserSchema
);
module.exports = CompareTwoUsers;
