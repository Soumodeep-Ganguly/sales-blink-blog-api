var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var CommentSchema = mongoose.Schema({
    comment: {
        type: String,
        default: ""
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    updated_date: {
        type: Date, default: dateKolkata
    },
    created_date: {
        type: Date, default: dateKolkata
    },
    deleted: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('comments', CommentSchema);