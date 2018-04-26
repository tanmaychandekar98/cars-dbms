
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

//Var to store all cars
var allcars;
con.query("SELECT * FROM cars",function(err,res){
	//if(err){res.send(err);}
	allcars = res;
});


//GET Requests

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Cars' , v:1});
});

router.get('/UpdateCar/:mno', function(req, res, next) {
	con.query("SELECT * FROM cars where mno='"+req.params.mno+"'", function(err,car){
		if(err) res.send(err);
  		res.render('UpdateCar', { title: 'Update Car' , car:car[0]});
	});
});

router.get('/cars/:uname' ,function(req,res){
	var q = "SELECT * from cars where mno in (SELECT mno from favs where uname=?)"
	//var q = "SELECT * FROM cars c,favs f, users where f.uname=? and f.mno=c.mno group by f.uname";
	con.query(q,[req.params.uname], function(err,cars){
		if(err) res.send(err);
		res.render('SeeFavorites', { title: 'Your favorites' ,cars:cars,user:{"uname":req.params.uname}});
	});
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Sign Up' , v:1});
});

router.get('/AddCar', function(req, res, next) {
  res.render('AddCar', { title: 'Add a car to database' });
});

//Get admin home page
router.get('/adminHome', function(req,res){
	res.render('admin',{user:{"uname":"Admin"}});
});

router.get('/carSearch/:uname', function(req,res){
	var cq = "SELECT * from cars";
	var uq = "SELECT * from users where uname='"+req.params.uname+"'";
	con.query(uq , function(err , users){
		if(err){res.send(err);}
		con.query(cq ,function(err,cars){
			if(err){res.send(err);}
			var fq = "SELECT * from favs where uname='"+users[0].uname+"'";
			con.query(fq ,function(err, favs){
				if(err) res.send(err);
				res.render('cars',{cars:cars,user:users[0],favs:favs});
			});
		});
	});
});


//POST Requests

//Search request
// Send 'cars' array with search result
// Send 'user' with logged in user
// Renders the cars page
// No field must be empty
router.post('/:uname/carSearch' , function(req,res){
	var s1='',s2='',s3='';
	var mno = req.body.mno+'%';
	var cname = '%'+req.body.cname+'%';
	var color = req.body.color;
	var engcap1 = req.body.engcap1;
	var engcap2 = req.body.engcap2;
	var mil1 = req.body.mil1;
	var mil2 = req.body.mil2;
	var maxsp1 = req.body.maxsp1;
	var maxsp2 = req.body.maxsp2;
	var price1 = req.body.price1;
	var price2 = req.body.price2;
	if(mno!='')
		s1="mno LIKE '"+mno+"' AND";
	if(cname!='')
		s2="name LIKE '"+cname+"' AND";
	if(color!='')
		s2="color='"+color+"' AND";
	var searchQ = "SELECT * FROM cars WHERE "+s1+" "+s2+" "+s3+" engcap BETWEEN ? AND ? AND mileage BETWEEN ? AND ? AND maxsp BETWEEN ? AND ? AND price BETWEEN ? AND ? ORDER BY name";
	var uq = "SELECT * from users where uname='"+req.params.uname+"' LIMIT 1";
	con.query(uq , function(err,users){
		if(err) throw err;
		con.query(searchQ , [engcap1,engcap2,mil1,mil2,maxsp1,maxsp2,price1,price2] , function(err,result){
			if (err) throw err;
			var favQ = "SELECT * from favs where uname='"+users[0].uname+"'";
			con.query(favQ ,function(err, favs){
				if(err) {res.send(err);}
				res.render('cars',{cars:result,user:users[0],favs:favs});
			});
		});
	});
});



//Admin controls

//View by mno.
router.post('/viewCar',function(req,res){
	var mno = req.body.mno;
	var q = "SELECT * from cars where mno=?";
	con.query(q,[mno],function(err,car){
		if(err){res.send(err);}
		console.log(car);
		res.render('admin',{user:{"uname":"Admin"},cars:car});
	});
});

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
router.post('/delCar/:mno', function(req,res){
	var cq ="DELETE FROM cars WHERE mno='"+req.params.mno+"'";
	con.query(cq , function(err,result){
		if(err) throw err;
		console.log(result.affectedRows+" row deleted");
		res.render('admin',{user:{"uname":"Admin"}});
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
	var cq = "SELECT * from cars where mno='"+req.params.mno+"'";
	con.query(uq , function(err,users){
		if(err) throw err;
		con.query(cq , function(err,models){
			if (err) throw err;
			var addQ = "INSERT into favs values('"+users[0].uname+"','"+models[0].mno+"')";
			con.query(addQ ,function(err , result){
				if(err) throw err;
				console.log(models[0].mno+" added to "+users[0].uname);
				res.send("<h2>Added to favourites : "+models[0].name+"<hr><a href='/carSearch/"+users[0].uname+"'>Go back</a></h2>");
			});
		});
	});
});


//Delete from favs
router.post('/:uname/:mno/delFromFavs' , function(req,res){
	var q = "DELETE FROM favs WHERE uname='"+req.params.uname+"' AND mno='"+req.params.mno+"'";
	con.query(q , function (err,result){
		if(err) throw err;
		console.log(result.affectedRows+" row deleted");
		//res.send("Deleted from favs :"+req.params.mno);
		res.send("<h2>DELETED from favourites : Model no. "+req.params.mno+"<hr><a href='/carSearch/"+req.params.uname+"'>Go back</a></h2>");
	});
});

router.post('/:uname/:mno/delFromSeeFavs' , function(req,res){
	var q = "DELETE FROM favs WHERE uname='"+req.params.uname+"' AND mno='"+req.params.mno+"'";
	con.query(q , function (err,result){
		if(err) throw err;
		console.log(result.affectedRows+" row deleted");
		//res.send("Deleted from favs :"+req.params.mno);
		res.send("<h2>DELETED from favourites : Model no. "+req.params.mno+"<hr><a href='/cars/"+req.params.uname+"'>Go back</a></h2>");
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
			else if(result[0].password == req.body.pwd){
				con.query("SELECT * from cars",function(err,cars){
					if(err){res.send(err);}
					var fq = "SELECT * from favs where uname='"+result[0].uname+"'";
					con.query(fq ,function(err, favs){
						if(err) res.send(err);
						//res.render('cars',{user:result[0],cars:cars,favs:favs});
						res.redirect('/carSearch/'+result[0].uname);
					});
					
				});
			}
			else{
				res.send("Incorrect password"); //if passwords don't match
			}
		});
	}
});

module.exports = router;
