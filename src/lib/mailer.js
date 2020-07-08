const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "01e485b7efc26c",
      pass: "047126e6f8c53a"
    }
  })

module.exports = transport