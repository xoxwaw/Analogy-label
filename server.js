const express = require('express');
var   login = require(__dirname + '/routes/login');
var compare = require(__dirname + '/routes/compare');
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;


var url = "mongodb+srv://admin:Test123@cluster0-msffm.mongodb.net/analogy";
var app = express();


var multer = require('multer'),
    upload = multer(),
    session = require('express-session'),
    cookieParser = require('cookie-parser');
app.use(upload.array());
app.use(cookieParser());
app.use(session({
    secret: "Your secret key"
}));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

var label = require(__dirname + '/modules/label');
app.use('/login', login);
app.use('/compare', compare);

let database;
var sentence = "",
    base = "",
    target = "",
    counter = 1,
    username = "";
var User = require(__dirname + '/modules/User');;


MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
    if (err) {
        return console.log(err);
    }
    database = db.db("analogy");
    // start the express web server listening on 8080

});
let port = process.env.PORT;
if (port == null || port == ""){
    port = 8080;
}
app.listen(port, () => {
    console.log('Server has started');
});
function checkSignIn(req, res, next) {
    if (req.session.user) {
        console.log("logged in");
        next(); //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        res.redirect('/login');
        next(err); //Error, trying to access unauthorized page!
    }
}

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", checkSignIn, (req, res) => {
    // var new_user = new User({username: 'phnguyen17', password : 'abc.123'});
    // new_user.save();
    // database.collection('rankedByPhi').find({}).toArray(function(err,data){
    //     if (err) throw err;
    //     User.updateOne({username : 'phnguyen17'}, {$push : {labelled_sentences : data}}, function(err,result){
    //         if (err) throw err;
    //         console.log('succesffuly updated!');
    //     });
    // })
    User.find({}, function(err,result){
        if (err) throw err;
        res.render("profile", {
            user_name: username,
            users: result
        });
    });
});
app.post('/start_session', (req, res) => {
    if (counter <= req.body.number) {
        res.redirect('/start_session');
    }
});
app.get('/start_session', checkSignIn, (req, res) => {
    const cursor = database.collection('unverified').find({
        'num_id': counter
    }).toArray(function(err, result) {
        if (err) throw err;
        sentence = String(result[0]["sentence"]);
        base = String(result[0]["base"]);
        target = String(result[0]["target"]);
        counter += 1;
        label.updateContent(counter, sentence, base, target);
        res.render("index", {
            sentence_content: sentence,
            base: base,
            target: target
        });
    });


});
app.get('loggedIn', (req,res) => {


});

app.post('/Yes', (req, res) => {
    label.updateLabel(1, 0, 'phnguyen17');
    res.redirect("/");
});
app.post('/No', (req, res) => {
    label.updateLabel(0, 1, 'phnguyen17');
    res.redirect("/");
});
