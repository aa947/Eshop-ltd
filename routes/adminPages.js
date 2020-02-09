var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');

//require page model
var Page = require('../models/page');


/* 
* Get page index
*/
router.get('/', (req, res)=>{
   Page.find({}).sort({sorting: 1}).exec().then((pages)=>{
       res.render('admin/pages', {
           pages:pages
       });
   }).catch((err)=>{console.log(err)});
})

/* 
* Get add page 
*/
router.get('/add_page', (req, res)=>{
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
})


/* 
* POST add page 
*/
router.post('/add_page',[
    check('title', 'title must have a value').notEmpty(),
    check('content', 'content must have a value').notEmpty()

] ,(req, res)=>{
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.render( 'admin/add_page' ,{ 
        errors: errors.array(),
        title: title,
        slug: slug,
        content: content
     });
   }

   var title = req.body.title;
   var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
   var content = req.body.content;

   if(slug ==""){ slug= req.body.title.replace(/\s+/g,'-').toLowerCase();}
   
   Page.findOne({slug: slug}).then((page)=>{
       if(page){
           req.flash('danger', 'page slug exsits, choose another slug');
           res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
       } else{
           var newPage = new Page({
            title: title,
            slug: slug,
            content: content,
            sorting:100
           })

           newPage.save((err)=>{
               if(err){console.log(err);}
               req.flash('success', 'page added')
               res.redirect('/admin/pages');

           });
       }
   }).catch((err)=>{console.log(err)});

  
})


/* 
* POST admin/pages/reorder-page 
*/
router.post('/reorder-pages', (req, res)=>{
   console.log(req.body);
 })
 

//export router 
module.exports= router;