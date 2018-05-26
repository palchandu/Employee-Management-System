var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let user = new Schema({

	name:{type:String},
	email:{type:String},
	Password : {type:String},
	following : [{ type: Schema.ObjectId, ref: 'user' }],
	follower: [{ type: Schema.ObjectId, ref: 'user' }]

});
module.exports = mongoose.model('FollowerFollowing_user',user);
