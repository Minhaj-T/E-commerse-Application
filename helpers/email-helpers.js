

var nodemailer = require('nodemailer');

module.exports={
    

  sentMail:(user,msg)=>{
    return new Promise ((resolve,reject)=>{
        let gmail=user.email        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.emailme,
              pass: process.env.emailpass
            }
          });

        var mailOptions  = {
            from: process.env.emailme,
            to: gmail,
            subject: 'Messege form ShopGrids',
            text: msg  
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