const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "jobs",
        required: true,
    },
    applied_at: {
        type: Date,
        default: Date.now,
    }
});

const registrationModel = mongoose.model("registrations", registrationSchema);
module.exports = registrationModel;