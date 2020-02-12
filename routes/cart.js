var express = require('express');
var router = express.Router();
var ProductModel = require('../models/products');

/*
* Get Home Page
*/

router.get('/add/:product', (req, res)=>{
    var slug = req.params.product;
    ProductModel.findOne({slug: slug}, function (err, p) {
        if (err) return console.log(err);
        
        if(typeof(req.session.cart) == "undefined" ){
            req.session.cart =[];
            req.session.cart.push({
                title: slug,
                price: parseFloat(p.price).toFixed(2),
                image: '/images/product_imgs/'+p._id+'/'+p.image,
                qty:1
            });
        } else {

            var cart = req.session.cart;
            var newItem = true;

            cart.map((item)=>{
                if(item.title == slug){
                    item.qty++;
                    newItem = false;
                    return;
                }

            })

            if(newItem){
                cart.push({
                    title: slug,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/images/product_imgs/'+p._id+'/'+p.image,
                    qty:1
                });
            }
        }

       // console.log(req.session.cart);
        req.flash('success', 'Product added to cart!');
        res.redirect('back');

       
    });

})

/*
 * GET checkout page
 */
router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }

});


/*
 * GET update product
 */
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');

});

/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;
    
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');

});

/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {

    delete req.session.cart;
    
    res.sendStatus(200);

});


//export router 
module.exports= router;