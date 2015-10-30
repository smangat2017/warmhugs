var api_key = 'key-73e15458e534ee382ea7d282839a1093';
var domain = 'kudositforward.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var mailcomposer = require("mailcomposer");


var mailintro = "Hey! <br><br> Hope you're having a wonderful day. :) Someone anonymously wrote you a compliment and here's what they said...<br><h3>\"";
var mailending = "\"</h3><br> Now you can send anonymous compliments at www.kudositforward.com too! Your SecretKey is: <b>";
var mailgoal = "</b>. <br><br>Our goal is <b>1 million </b> compliments by December 31st, 2015. Just consider how much joy we could add into the world by starting a chain reaction of gratitude. So far <b>";
var mailfinal = "</b>/1000000 compliments have been sent! Every compliment you send adds 1 to that total. Try to send at least 3 compliments today and pay it forward. Cheers to a happier world. :)  <3";
var inspiration = " Take a moment now and appreciate the fact that you probably made someone's day. Thank YOU for adding a little more joy into the world :) ";

exports.sendCompliment = function(message,recipient,compliments,secretKey,kudo){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: recipient,
		subject: 'Someone Wrote You A Compliment! :)',
		body: '',
		html: mailintro + message + mailending + secretKey + mailgoal + compliments + mailfinal,
	 });
	mail.build(function(mailBuildError, message) {
		var dataToSend = {
			to: recipient,
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
}

exports.sendConfirmation = function(email,recipient,compliments,secretKey){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: email,
		subject: 'Your Compliment Has Been Delivered!',
		body: '',
		html: "Your compliment to <b>" + recipient + "</b> has been sent! That's compliment #" + compliments + "/1000000." + inspiration + "<3 Feel free to send another at www.kudositforward.com! Your secret key for reference is <b>" + secretKey +"<b>"
	});
	mail.build(function(mailBuildError, message) {
		var dataToSend = {
			to: email,
			message: message.toString('ascii')
		};
		mailgun.messages().sendMime(dataToSend, function (sendError, body) {
			if (sendError) {
				return;
			} 
		});
	});
}

exports.sendReply = function(message,mailto,replier){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: 'smangat@stanford.edu',
		subject: 'Someone Replied to Your Compliment! ',
		body: '',
		html: replier + message,
	});
	mail.build(function(mailBuildError, message) {
		var dataToSend = {
			to: 'smangat@stanford.edu',
			message: message.toString('ascii')
		};
		mailgun.messages().sendMime(dataToSend, function (sendError, body) {
			if (sendError) {
				return;
			} 
		});
	});
}

