const express = require('express');
const path = require('path');
const mongoose = require ('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');

//Connecting Mongoose
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//check for DB error
db.on('error', () => {
    console.log('an error occured');
});
//Init App
const app = express();


//Bring in models
let Article = require('./models/article');


//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body-parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

  //Express Message Middleware
  app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
           console.log(err); 
        } else{
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
            
    });
}); 

//Get single article
 app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('article', {
            article: article
        });
    });
 });


//Add Route
app.get('/article/add', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
           console.log(err); 
        } else{
            res.render('add_article', {
                title: ' Add Articles',
                articles: articles
            });
        }
            
    });
   
});

//Load Edit form
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
 });
 
// Add Submit POST Route

app.post('/article/add', (req, res) => {
    let article= new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save((err) => {
        if (err) {
            console.log(err);
        } else{
            res.redirect('/');
        }
    });
});


// Update Submit POST Route


app.post('/article/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
        } else{
            res.redirect('/');
        }
    });
});

//Delete article

app.delete('/article/:id', function(req, res){
    let query = {_id:req.params.id}

    Article.remove(query, function(err){
        if(err){
            console.log(err);
        }
        res.send('Success');
    });
});

//Start Server
app.listen(3000, () => {
    console.log('server started at 3000');
});