
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin:Test123@cluster0-msffm.mongodb.net/analogy", { useNewUrlParser: true });

const analogySchema = new mongoose.Schema ({
    num_id: Number,
    sentence: String,
    base: String,
    target: String,
    positive_rating : Number,
    negative_rating : Number,
    review: String
});

var User = require ('./User');

const Analogy = mongoose.model("verify", analogySchema);
var num_id = 0;
var sentence = "";
var base = "";
var target = "";
var label = 0;


module.exports = {
    updateContent : function(c, s, b, t){
        num_id = c;
        sentence = s;
        base = b;
        target = t;
    },

    updateLabel : function(positive_rating, negative_rating, username){
        let new_label;
        if (positive_rating === 1){
            new_label = {positive_rating: 1};
            label = 1;
        }else{
            new_label = {negative_rating : 1};
            label = 0;
        }
        Analogy.find({'num_id' : counter}, function(err, data){
            if (err){
                console.log(err);
                return;
            }else if(data.length === 0){
                new_label = new Analogy({
                    num_id: counter,
                    sentence: sentence,
                    base: base,
                    target: target,
                    positive_rating: positive_rating,
                    negative_rating: negative_rating,
                    review: "Hello there"
                });
                new_label.save();
                console.log("new entry registered");
            }else{
                User.find({'username' : username, 'labelled_sentences.sentence' : sentence}, function(err,userData){
                    if (err){
                        console.log(err);
                        return;
                    }else if (userData.length === 0){
                        User.updateOne({username : username},
                        { $push : {labelled_sentences : {
                            num_id: counter,
                            sentence: sentence,
                            base: base,
                            target: target
                        }}},
                        function(err, temp){
                            if (err) console.log(err);
                            else console.log("Logged into new entry of user");
                        });
                    }else{
                        User.updateOne({'username':username,
                        'labelled_sentences.sentence' : sentence},
                        {$set : {'labelled_sentences.label' : label}}), function(err, temp){
                            if (err) console.log(err);
                            else console.log("Successfully update the user data");
                        }
                    }
                });
                Analogy.updateOne(
                    { sentence: sentence },
                    { $inc : new_label},
                    function(err, data){
                        if (err){
                            console.log(err);
                        }else{
                            console.log("Successfully update the data");
                        }
                    }
                );
            }
        });
    }


}
