const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSupportSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    faculty: {
        type: String,
        required: true,
    },
    expertise: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },
    consultationHours: {
        type: String,
        required: false,
    },
    department: {
        type: String,
        required: false,
    }
});

module.exports = mongoose.model(
    "StudentSupportModel",
    StudentSupportSchema
);
