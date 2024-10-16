const mongoose = require('mongoose')

const ContactUsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

const User = mongoose.model('ContactUs', ContactUsSchema)

module.exports = User