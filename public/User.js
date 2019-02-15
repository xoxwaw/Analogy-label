var mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: String,
    labels : [{
        corpus: String,
        sent_id: [],
        favorite_id : []
    }]
});
let UserInfo = mongoose.model(
    'label',
    userSchema
);
module.exports = UserInfo
