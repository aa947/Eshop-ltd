var express= require('express');
var path = require('path');
var mongoose = require('mongoose');
require('dotenv').config();
var bodyParser = require('body-parser');
var session = require('express-session');
const { check, validationResult } = require('express-validator');
var fileUpload = require('express-fileupload');


//connect to db
mongoose.connect(process.env.MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true } , (err, db)=>{
    if(err){ console.log(`conection error ${err}`); }
    // console.log(`successfully connected to dataBase: ${db.name}`);
})

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection Error'));
db.on('open', ()=>{
    console.log(`successfully connected to dataBase: ${db.name}`);
})

//initialize app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setup public path
// app.use('/public', express.static(path.join(__dirname, 'public')))
app.use( express.static(path.join(__dirname, 'public')))

//global variables for errors
app.locals.errors =null;

//global variable for pages


// fileUpload
app.use(fileUpload());
// bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//sessions
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

//express validator
// app.use(expressValidator({
//     errorFormater: function(param, msg, value){
//         var namespace = param.split('.')
//         , root = namespace.shift()
//         , formParam = root;

//         while(namespace.length){
//             formParam += '{' + namespace.shift() + '}';
//         }

//         return ({
//             param:formParam,
//             msg:msg,
//             value:value
//         });
//     }
// }))

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//routes
var pages = require('./routes/pages');
var adminPages = require('./routes/adminPages');
var adminCategories = require('./routes/adminCategories');
var adminProducts = require('./routes/adminProducts');

app.use('/admin/products', adminProducts);
app.use('/admin/categories', adminCategories);
app.use('/admin/pages', adminPages);
app.use('/', pages);

//start server
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`)
})