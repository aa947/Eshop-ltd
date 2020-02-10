var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var resizeImg = require('resize-img');
var isImg = require('../tests/imageValidator');

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
    var desc = "";
    var price = "";
    CategoreyModel.find().then((cats) =>{
    res.render('admin/add_product', {
        title: title,
        desc: desc,
        price: price,
        cats: cats
    });
  }).catch((err)=>{console.log(err)});
})


/* 
* POST add product 
*/
router.post('/add-prodcut',[
    check('title', 'title must have a value').notEmpty(),
    check('desc', 'Description must have a value').notEmpty(),
    check('price', 'Price must have a decimal value').isDecimal(),
    check('image').custom( (val , {req}) => {
        if(!req.files){throw new Error('You must include an Image');}
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        if (!isImg(val, imageFile)){
            throw new Error('You must include an Image');
        };
        return true;
    })

] ,(req, res)=>{
    
    
   var title = req.body.title;
   var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
   var price = req.body.price;
   var desc = req.body.desc;
   var categorey = req.body.categorey;
   if(!req.files){ imageFile =""; }
   if(req.files){
   var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
   }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return  CategoreyModel.find().then((cats) =>{
        res.render('admin/add_product', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            cats: cats
        });
      }).catch((err)=>{console.log(err)});
   }

   
   ProductModel.findOne({slug: slug}).then((product)=>{
       if(product){
           req.flash('danger', 'product exsits, choose another name');
           CategoreyModel.find().then((cats) =>{
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                price: price,
                cats: cats
            });
          });

       } else{
           var price2  = parseFloat(price).toFixed(2);

           var newProduct = new ProductModel({
            title: title,
            slug: slug,
            desc: desc,
            price: price2,
            categorey: categorey, 
            image: imageFile
           })

           newProduct.save((err)=>{
               if(err){console.log(err);}

               mkdirp('public/images/product_imgs/'+newProduct._id)
               .then(()=>{
                    mkdirp('public/images/product_imgs/'+newProduct._id+'/gallery')
               .then(()=>{
                        mkdirp('public/images/product_imgs/'+newProduct._id+'/gallery/thumbs')
                .then(()=>{
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/product_imgs'+newProduct._id+'/'+imageFile;


                        productImage.mv(path, ()=>{
                            req.flash('success', 'product added')
                            res.redirect('/admin/products');

                        });

                        
                                     }

                        })
                    })
               })

               
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