var api_key = 'key-73e15458e534ee382ea7d282839a1093';
var domain = 'kudositforward.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var mailcomposer = require("mailcomposer");


var mailintro = "Hey! <br><br> Hope you're having a wonderful day. :) Someone anonymously wrote you a compliment and here's what they said...<br><h3>\"";

var mail1 = "\"</h3><br>1.<b> Reply </b> to this email to send a message back to compliment sender! :)";
var mail2 = "<br>2.<b> Send </b> compliments to at least <b>3</b> other people within <b>24</b> hours at www.kudositforward.com. Feel amazing and track your impact. Your secretKey is: <h3>";
var mail25 ="</b> Healthwise, research has shown such gestures of gratitude to greatly boost well-being.";
var mail3 = "</h3>3. Our goal is <b>1 million </b> compliments by <b>December 31st, 2015</b>. So far we're at <b>";
var mail35 = "/1000000</b>. If you'd like to take the gratitude pledge and be reminded to send compliments daily click ";
var mail4 = "<br> 4. If this message is hurtful in any way, please forward the email to smangat@stanford.edu. There is 0 tolerance for cyber bullying.";
var mail5 = "<br> 5. Cheers to a happier world. :) Have an amazing rest of your day!";

var inspiration = "\"</h3><br><br>Take a moment now and appreciate the fact that you probably made someone's day. Thank YOU for adding a little more joy into the world :) ";
var gifmessage = " <br> PS The kudo gif will be changing every week ;)"
var confirmation = "For your reference you said...<br> <h3> \""
var pledgemessage = "<br><br><b>Gratitude Pledge: </b>Positive psychology research has indicated that expressing gratitude daily leads to a healthier immune system, happier well-being, and better productivity. If you'd like to make sending compliments a habit, take the gratitude pledge! We'll be sending daily reminders with inspirational quotes, funny gifs, and feel good stories. Consider it your daily happiness boost! :)  </b> To register click: "
exports.sendCompliment = function(message,recipient,compliments,secretKey,kudo){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: recipient,
		subject: 'Someone Wrote You A Compliment! :)',
		body: '',
		html: mailintro + message + mail1 + mail2 +  secretKey + mail3 + compliments + mail35 + "kudositforward.com/gratitudepledge?key=" + secretKey +  mail4 + mail5,
		attachments: [{path: '/home/deploy/warmhugs/public/images/baby-hug.gif'}]
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

exports.sendConfirmation = function(email,recipient,compliments,secretKey,message,usercompliments){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: email,
		subject: 'Thank You for Sending a Compliment! :) ',
		body: '',
		html: "Your compliment to <b>" + recipient + "</b> has been sent! That's compliment #" + compliments + "/1000000." + confirmation + message + inspiration + "<3 Your reach is <b>" + usercompliments + "</b> compliments so far!!! Feel free to send another at www.kudositforward.com! Your secret key for reference is <b>" + secretKey + "</b>" + pledgemessage + "kudositforward.com/?key=" + secretKey +  gifmessage ,
		//specify the absolute directory to properly send a gif!
		attachments: [{path: '/home/deploy/warmhugs/public/images/minion-hug.gif'}]
		//attachments: [{path: '../public/images/tigger-hug.gif'}]

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

exports.sendReply = function(strippedmessage,mailto,replier){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: mailto,
		subject: 'Someone Replied to Your Compliment! ',
		body: '',
		html: replier + "replied to your compliment! Here's what he/she said! : <br> <h3>"+ strippedmessage + "</h3>",
	});
	mail.build(function(mailBuildError, message) {
		var dataToSend = {
			to: mailto,
			message: message.toString('ascii')
		};
		mailgun.messages().sendMime(dataToSend, function (sendError, body) {
			if (sendError) {
				return;
			}
		});
	});
}

exports.dailyReminder = function(){
	var mail = mailcomposer({
		from: 'compliments@kudositforward.com',
		to: 'gpledge@kudositforward.com',
		subject: 'Daily Reminder to Send 3 Compliments! :) ',
		body: '',
		html: 'GOOD MORNING! Hope you have an absolutely amazing day. For alot of you that are in dead week and have finals coming up, remember that you are not your grade and it will be alright. :) Keep pushing through! You are almost there!!!! :D',
		attachments: [{path: '/home/deploy/warmhugs/public/images/up-ready.gif'}]
	});
	mail.build(function(mailBuildError, message) {
		var dataToSend = {
			to: 'gpledge@kudositforward.com',
			message: message.toString('ascii')
		};
		mailgun.messages().sendMime(dataToSend, function (sendError, body) {
			if (sendError) {
				return;
			}
		});
	});
}
