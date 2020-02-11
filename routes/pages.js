var express = require('express');
var router = express.Router();
var PageModel = require('../models/page');

/*
* Get Home Page
*/

router.get('/', (req, res)=>{
    PageModel.findOne({slug: 'home'}, function (err, page) {
        if (err)
            console.log(err);

        res.render('index', {
            title: page.title,
            content: page.content
        });
    });
})


/*
* Get specific Page
*/

router.get('/:slug', (req, res)=>{
    var slug = req.params.slug;

    PageModel.findOne({slug: slug}).then((page)=>{
        console.log(page);
        if(!page){
            res.redirect('/');
        }else{
            res.render('index', {
                title: page.title,
                content: page.content
            })
        }

    })

   
})


//export router 
module.exports= router;