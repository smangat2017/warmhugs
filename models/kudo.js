var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var kudoSchema = new Schema({
	from: { type: String, required: true },
	body: { type: String, required: true },
	to: String,
	replied: Boolean,
	messageid: String,
	created_at: Date,
});

var Kudo = mongoose.model('Kudo', kudoSchema);

// make this available to our users in our Node applications
module.exports = Kudo;
