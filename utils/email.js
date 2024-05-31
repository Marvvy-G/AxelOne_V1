const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
//create a transporter
const transporter = nodemailer.createTransport({
    host:"sandbox.smtp.mailtrap.io",
    port:465,
    auth: {
        user:"d99f2677401251",
        pass:"b207ffd38b600c"
    }
})

//DEFINE EMAIL OPTIONS

const emailOptions = {
    from: '<paul@gmail.com>',
    to: option.email,
    subject: option.subject,
    text: option.message
}
    await transporter.sendMail(emailOptions)
}

module.exports = sendEmail;