const nodemailer = require('nodemailer');
const config = require('./config');

console.log('Testing Email Configuration...');
console.log('----------------------------');
console.log('User:', config.email.user || '(Not Set)');
console.log('Pass:', config.email.pass ? '******' : '(Not Set)');
console.log('To:', config.notificationTo);
console.log('----------------------------');

if (!config.email.user || !config.email.pass || config.email.user === 'your-email@gmail.com') {
    console.error('❌ ERROR: Please configure your email credentials in config.js');
    console.error('   1. Open config.js');
    console.error('   2. Set "user" to your Gmail address');
    console.error('   3. Set "pass" to your Gmail App Password');
    console.error('      (Generate App Password at: https://myaccount.google.com/apppasswords)');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

const mailOptions = {
    from: config.email.user,
    to: config.notificationTo,
    subject: 'Test Email from Portfolio',
    text: 'If you receive this, your portfolio email configuration is working correctly!'
};

console.log('Attempting to send test email...');

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ FAILED to send email:');
        console.error(error);
        if (error.code === 'EAUTH') {
            console.error('\n💡 HINT: Authentication failed. Make sure you are using an App Password, not your login password.');
        }
    } else {
        console.log('✅ SUCCESS! Email sent successfully.');
        console.log('Response:', info.response);
    }
});
