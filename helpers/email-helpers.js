

var nodemailer = require('nodemailer');

module.exports={
    

  sendMail:(user,msg)=>{
    return new Promise ((resolve,reject)=>{
        let gmail=user.email  
        console.log("this is hth",gmail);      
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.emailme,
              pass: process.env.emailpass
            },
            tls:{
              rejectUnauthorized:false
            }
          });

        var mailOptions  = {
            from: process.env.emailme,
            to: gmail,
            subject: 'Messege form ShopGrids',
            text: 'text',
            html: msg
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          resolve()

    })
}
    
}