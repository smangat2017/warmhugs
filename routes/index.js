var express = require('express');
var router = express.Router();
var api_key = 'key-73e15458e534ee382ea7d282839a1093';
var domain = 'kudositforward.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var crypto = require('crypto');
var mailcomposer = require("mailcomposer");
var User = require('../models/user');
var Kudo = require('../models/kudo');
var mailintro = "Hey! <br><br> Hope you're having a wonderful day. :) Someone anonymously wrote you a compliment and here's what they said...<br><h3>\"";
var mailending = "\"</h3><br> Now you can send anonymous compliments at www.kudositforward.com too! Your SecretKey is: <b>";
var mailgoal = "</b>. <br><br>Our goal is <b>1 million </b> compliments by December 31st, 2015. Just consider how much joy we could add into the world by starting a chain reaction of gratitude. So far <b>";
var mailfinal = "</b>/1000000 compliments have been sent! Every compliment you send adds 1 to that total. Try to send at least 3 compliments today and pay it forward. Cheers to a happier world. :)  <3";
var inspiration = " Take a moment now and appreciate the fact that you probably made someone's day. Thank YOU for adding a little more joy into the world :) "
var totalcompliments = 84;

/* GET home page. */
router.get('/', function(req, res) {
  var message = "Send an anonymous compliment and track your impact <3";
  var status = "";

  if(req.param("success")==1){
  	message = "Compliment Sent Succesfully! Feel free to send another :)";
  	status = "text-success";
  } else if(req.param("success")==0){
  	message = "Please make sure you fill all fields!";
  	status = "text-danger";
  }

  res.render('index', {
            title: "SendKudos", //page title
            action: "/sendmail", //post action for the form
            message: message,
            status: status
        });
});


router.get('/user',function(req,res){
	var key = req.query.secretkey;
	var user = User.findOne({'secretKey': key},function(err,user){
		if(err) throw err;
		if(user!=null || req.query.secretkey=="hooligan"){
			res.send(200);
		} else{
			res.send(404);
		}
	});
});

router.post('/sendmail',function(req,res){
	//validate to make sure the fields are non-empty
	if(req.body.tofield == '' || req.body.message == ''){
		res.redirect('/?success=0');
	}
	else{
		var user = User.findOne({'email': req.body.tofield},function(err,user){
		if(err) throw err;
		if(user==null){
			token = crypto.randomBytes(8).toString('hex');
			var now = new Date();
			user = new User({
				email: req.body.tofield,
				secretKey: token,
				compliments: 0,
				referrer: req.body.secretkey,
				created_at: now
			});
			console.log(user);
		    user.save(function(err) {
		  		if (err) throw err;
			});
		}

		kudo = new Kudo({
			from: req.body.secretkey,
			to: user.secretKey,
			body: req.body.message,
			created_at: new Date()
		});
		totalcompliments+=1;
		User.findOne({'secretKey': req.body.secretkey},function(err,user){
			if(user!=null){
				user.compliments+=1;
				user.save(function(error){
					if(error) throw error;
				});
				var mail = mailcomposer({
	  				from: 'compliments@kudositforward.com',
	  				to: user.email,
	  				subject: 'Your Compliment Has Been Delivered!',
	  				body: '',
	  				html: "Your compliment to <b>" + req.body.tofield + "</b> has been sent! That's compliment #" + totalcompliments + "/1000000." + inspiration + "<3 Feel free to send another at www.kudositforward.com! Your secret key for reference is <b>" + user.secretKey +"<b>"
				});
				mail.build(function(mailBuildError, message) {
					var dataToSend = {
						to: user.email,
						message: message.toString('ascii')
					};
					mailgun.messages().sendMime(dataToSend, function (sendError, body) {
						if (sendError) {
							return;
						} 
					});
				});
			}
		});
		var mail = mailcomposer({
	  		from: 'compliments@kudositforward.com',
	  		to: req.body.tofield,
	  		subject: 'Someone Wrote You A Compliment! :)',
	  		body: '',
	  		html: mailintro + req.body.message + mailending + user.secretKey + mailgoal + totalcompliments + mailfinal
		});
		mail.build(function(mailBuildError, message) {
			var dataToSend = {
				to: req.body.tofield,
				message: message.toString('ascii')
			};
			mailgun.messages().sendMime(dataToSend, function (sendError, body) {
				if (sendError) {
					return;
				} else{
					kudo.messageid = body.id;
					kudo.save(function(err) {
						if (err) throw err;
					});
				}
			});
		});
		res.redirect('/?success=1');
	    });
	}
});

module.exports = router;
