var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var resizeImg = require('resize-img');

//require Products model
var ProductModel = require('../models/products');

//require Categories model
var CategoreyModel = require('../models/categories');


/* 
* Get products index
*/
router.get('/', (req, res)=>{

    var count;
    ProductModel.count((err, c)=>{ count=c; }) 

   ProductModel.find().then((products)=>{
       res.render('admin/products', {
           products:products,
           count: count
       });
   }).catch((err)=>{console.log(err)});
})

/* 
* Get add product 
*/
router.get('/add_product', (req, res)=>{
    var title = "";
    var slug = "";

    res.render('admin/add_product', {
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
   
   PageModel.findOne({slug: slug}).then((page)=>{
       if(page){
           req.flash('danger', 'page slug exsits, choose another slug');
           res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
       } else{
           var newPage = new PageModel({
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
   var ids = req.body['id[]'];
   ids.map((id, index)=>{
        PageModel.findById(id).then((page)=>{
            page.sorting = index+1;
            page.save();
        }).catch((err)=>{console.log(err)});
   });
 })
 

 /* 
* Get Edit page 
*/
router.get('/edit-page/:id', (req, res)=>{
    PageModel.findById( req.params.id.trim())
    .then((page)=>{
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    }).catch((err)=>{console.log(err)});
   
})

/* 
* POST Edit page 
*/
router.post('/edit-page/:id',[
    check('title', 'title must have a value').notEmpty(),
    check('content', 'content must have a value').notEmpty()

] ,(req, res)=>{
    
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    var content = req.body.content;
    // var id = mongoose.mongo.ObjectId(req.body.id);
    //var id = JSON.parse(req.body.id);
    var id = req.params.id.trim();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.render( 'admin/edit_page' ,{ 
        errors: errors.array(),
        title: title,
        slug: slug,
        content: content,
        id: id
     });
   }

   

   if(slug ==""){ slug= req.body.title.replace(/\s+/g,'-').toLowerCase();}
   
   PageModel.findOne({slug: slug, _id:{ $ne: id }}).then((page)=>{
       if(page){
           req.flash('danger', 'page slug exsits, choose another slug');
           res.render('admin/edit_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
       } else{
           PageModel.findById(id).then((page)=>{
               page.title = title;
               page.slug = slug;
               page.content = content;

               page.save((err)=>{
                if(err){console.log(err);}
                req.flash('success', 'page Edited');
                res.redirect('/admin/pages');
            });
           })
          
       }
   }).catch((err)=>{console.log(err)});

})

/* 
* Get delete Page
*/
router.get('/delete-page/:id', (req, res)=>{
    PageModel.findByIdAndRemove(req.params.id).then(()=>{
        req.flash('success', 'page Deleted');
        res.redirect('/admin/pages');

    }).catch((err)=>{console.log(err)});
 })



//export router 
module.exports= router;