var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    number_of_sent : Number,
    labelled_sentences : [{
        num_id : Number,
        sentence: String,
        base: String,
        target: String,
        label: Number}]
});
let User = mongoose.model(
    'user',
     userSchema
);
module.exports = User;
