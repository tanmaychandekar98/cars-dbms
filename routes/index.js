
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

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up' });
});



router.get('/carSearch', function(req,res){
	var uq = "SELECT * from cars";
	con.query(uq , function(err , result){
		res.render('cars',{cars:result});
	});
});


//POST Requests

//Search request
// Send 'cars' array with search result
// Send 'user' with logged in user
// Renders the cars page
// No field must be empty
router.post('/:uname/carSearch' , function(req,res){
	var mno = req.body.mno+'%';
	var cname = req.body.cname+'%';
	var color = req.body.color;
	var engcap1 = req.body.engcap1;
	var engcap2 = req.body.engcap2;
	var mil1 = req.body.mil1;
	var mil2 = req.body.mil2;
	var maxsp1 = req.body.maxsp1;
	var maxsp2 = req.body.maxsp2;
	var price1 = req.body.price1;
	var price2 = req.body.price2;
	var searchQ = "SELECT * FROM cars WHERE mno LIKE ? AND name LIKE ? AND color=? AND engcap BETWEEN ? AND ? AND mileage BETWEEN ? AND ? AND maxsp BETWEEN ? AND ? AND price BETWEEN ? AND ? ORDER BY name";
	var uq = "SELECT * from users where uname='"+req.params.uname+"' LIMIT 1";
	con.query(uq , function(err,users){
		if(err) throw err;
		con.query(searchQ , [mno,cname,color,engcap1,engcap2,mil1,mil2,maxsp1,maxsp2,price1,price2] , function(err,result){
			if (err) throw err;
			res.render('cars',{cars:result,user:users[0]});
		});
	});
});



//Admin controls

//Insert car into the db
router.post('/addCar',function(req,res){
	var mno = req.body.mno;
	var cname = req.body.cname;
	var color = req.body.color;
	var engcap = req.body.engcap;
	var mil = req.body.mil;
	var maxsp = req.body.maxsp;
	var price = req.body.price;
	var imgpath = req.body.imgpath;
	var q = "INSERT into cars VALUES(?,?,?,?,?,?,?,?)";

	con.query(q ,[mno,cname,color,engcap,mil,maxsp,price,imgpath], function(err,result){
		if(err) throw err;
		console.log("Inserted");
		res.redirect('back');
	});
});

//Delete car from database
router.delete('/delCar/:mno', function(req,res){
	var cq ="DELETE FROM cars WHERE mno='"+req.params.mno+"'";
	con.query(cq , function(err,result){
		if(err) throw err;
		console.log(result.affectedRows+" row deleted");
		res.redirect('back');
	});
});

//Update car info in the db
//POST request
router.post('/updCar/:mno' ,function(req,res){
	var cname = req.body.Ucname;
	var color = req.body.Ucolor;
	var engcap = req.body.Uengcap;
	var mil = req.body.Umil;
	var maxsp = req.body.Umaxsp;
	var price = req.body.Uprice;
	var imgpath = req.body.Uimgpath;
	var MNO = req.params.mno;
	var q = "UPDATE cars SET name=? ,color=? ,engcap=? ,mileage=? ,maxsp=? ,price=? ,imgpath=? WHERE mno=?";
	con.query(q ,[cname,color,engcap,mil,maxsp,price,imgpath,MNO], function(err,result){
		if(err) throw err;
		console.log("Updated rows : "+result.affectedRows);
		res.redirect('back');
	});
});

//Add to favorites
//uname and mno described in url
router.post('/:uname/:mno/addToFavs' , function(req,res){
	var uq = "SELECT uname from users where uname='"+req.params.uname+"'";
	var cq = "SELECT mno from cars where mno='"+req.params.mno+"'";
	con.query(uq , function(err,users){
		if(err) throw err;
		con.query(cq , function(err,models){
			if (err) throw err;
			var addQ = "INSERT into favs values('"+users[0].uname+"','"+models[0].mno+"')";
			con.query(addQ ,function(err , result){
				if(err) throw err;
				console.log(models[0].mno+" added to "+users[0].uname);
				res.redirect('back');
			});
		});
	});
});


//Delete from favs
router.delete('/:uname/:mno/delFromFavs' , function(req,res){
	var q = "DELETE FROM favs WHERE uname='"+req.params.uname+"' AND mno='"+req.params.mno+"'";
	con.query(q , function (err,result){
		if(err) throw err;
		console.log(result.affectedRows+" row deleted");
	});
});
 
//Sign-up request route
router.post('/signup' ,function(req,res){
	if(req.body.password != req.body.cpassword){
		res.send("pwd don't match");
	}
	else{
		var q = "INSERT into users values('"+req.body.username+"','"+req.body.password+"')";
		con.query(q , function(err ,result){
			if(err) res.send(err.sqlMessage) ;
			else{
				console.log("1 user added");
				res.redirect('/');
			}
		});
	}
});

//Login request route
router.post('/login' ,function(req,res){
	if(req.body.uname=="admin" && req.body.pwd=="rootuser"){  //admin page condition
		res.render('admin',{user:{"uname":"Admin"}});
	}else{
		var uq = "SELECT * from users where uname='"+req.body.uname+"' LIMIT 1";
		con.query(uq , function(err , result){
			if(err) res.send(err.sqlMessage);
			else if(result.length==0)   //if username is not present
				res.send("No user found");
			else if(result[0].password == req.body.pwd){  //success login
				res.render('cars',{user:result[0]});
			}
			else{
				res.send("Incorrect password"); //if passwords don't match
			}
		});
	}
});

module.exports = router;
