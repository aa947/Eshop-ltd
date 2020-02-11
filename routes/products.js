var express = require('express');
var router = express.Router();
var ProductModel = require('../models/products');
var CategoreytModel = require('../models/categories');


/*
* Get All products
*/


router.get('/', (req, res)=>{

    ProductModel.find().then((products)=>{
        if(!products){
            res.redirect('/');
        }else{
            res.render('all_products', {
                title: 'All products',
                products: products
            })
        }

    }).catch((err)=>{console.log(err)});

   
})

/*
* Get products by categorey
*/

router.get('/:categorey', (req, res)=>{
    var categoreySlug = req.params.categorey;

    CategoreytModel.findOne({slug: categoreySlug}).then((cat)=>{
        if(!cat){
            res.redirect('/');
        }else{
            ProductModel.find({categorey: categoreySlug}).then((products)=>{
                res.render('cat_products', {
                    title: cat.title,
                    products: products
                })

            })
            
        }

    })

   
})


//export router 
module.exports= router;