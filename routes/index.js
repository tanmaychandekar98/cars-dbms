var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cars' });
});

/*router.get('/signup',function(req,res){

});
*/

module.exports = router;
