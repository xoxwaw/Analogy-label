var mongoose = require('mongoose');
const sentenceSchema = new mongoose.Schema({
    corpus: String,
    num_id: Number,
    sentence: String,
    base: [String],
    target : [String],
    label: [{
        user: String,
        label: Number
    }],
    comment: [{
        username: String,
        time: String,
        content: String,
        reply: [{
            username: String,
            time: String,
            content: String
        }]
    }]
});
let Sentence = mongoose.model(
    'sentence',
     sentenceSchema
);
module.exports = Sentence
