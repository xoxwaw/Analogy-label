
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

function userUpdate(username,data){
    User.find({'username' : username,
    'labelled_sentences' : {
        $elemMatch : {'sentence': data.sentence}} },function(err,result){
            if (err){
                console.log(err);
                return;
            }else if (result.length === 0){
                User.updateOne({'username': username}, {
                    $push: {'labelled_sentences' : data},
                    $set: {'number_of_sent' : data.num_id}
                },function(err,result){
                    if (err) throw err;
                    console.log("Created successfully for this user");
                });
            }else{
                console.log(result);
                User.updateOne({'username': username,
                    'labelled_sentences': {$elemMatch : {'sentence': data.sentence} }
                },
                {$set: {'labelled_sentences.$.label' : data.label, 'number_of_sent' : data.num_id} },function(err,result){
                    if (err) throw err;
                    console.log("Update successfully for this user");
                });
            }
        })
}

function poolUpdate(data){
    var new_label;
    var positive_rating;
    var negative_rating;
    if (data.label == 1){
        new_label = {positive_rating : 1};
        positive_rating = 1;
    }else if (data.label == 0){
        new_label = {negative_rating : 1};
        negative_rating = 1;
    }

    Analogy.find({'num_id' : data.num_id},function(err,result){
        if (err){
            console.log(err);
            return;
        }else if (result.length===0){
            new_label = new Analogy({
                num_id: data.num_id,
                sentence: data.sentence,
                base: data.base,
                target: data.target,
                positive_rating: positive_rating,
                negative_rating: negative_rating,
            });
            new_label.save();
            console.log("new entry registered");
        }else{
            Analogy.updateOne({'num_id' : data.num_id}, {$inc : {'label' : data.label}}, function(err,result){
                if (err) throw err;
                console.log("new entry updated!");
            });
        }
    })
}

module.exports = {
    updateLabel : function(data, username){
        userUpdate(username,data);
        poolUpdate(data);
    }


}
