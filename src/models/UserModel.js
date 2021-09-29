var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var UserSchema = mongoose.Schema({
    full_name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    user_type: {
        type: String,
        default: "admin"
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
module.exports = mongoose.model('users', UserSchema);