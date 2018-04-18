var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');


//Connect to mysql database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cars"
});


//GET Requests

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cars' });
});


//POST Requests

//Sign-up request route
router.post('/signup' ,function(req,res){
	if(req.body.password != req.body.cpassword){
		res.send("pwd don't match");
	}
	else{
		var q = "INSERT into users values('"+req.body.username+"','"+req.body.password+"')";
		con.connect(function(err){
			if(err) throw err;
			con.query(q , function(err ,result){
				if(err) throw err;
				console.log("1 user added");
				res.redirect('/');
			});
		});
	}
});

//Login request route
router.post('/login' ,function(req,res){
	if(req.body.uname=="admin" && req.body.pwd=="rootuser"){  //admin page condition
		res.render('admin');
	}else{
		var uq = "SELECT * from users where uname='"+req.body.uname+"' LIMIT 1";
		con.query(uq , function(err , result){
			if(err) throw err;
			if(result.length==0)   //if username is not present
				res.send("No user found");
			else if(result[0].password == req.body.pwd){  //success login
				res.render('index',{user:result[0]});
			}
			else{
				res.send("Incorrect password"); //if passwords don't match
			}
		});
	}
});

module.exports = router;
