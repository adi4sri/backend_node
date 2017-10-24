const express = require('express');
const router = express.Router();
const db = require('../db/connection');

var qr = require('qr-image');

// start pdf test
var PDFDocument = require('pdfkit');
var request = require('request');



// close pdf test
//const fs = require('fs');

// var braintree = require("braintree");
// var request = require("request");
//
// var gateway = braintree.connect({
//   environment: braintree.Environment.Sandbox,
//   merchantId: process.env.MERCHANT_ID,
//   publicKey: process.env.PUBLIC_KEY,
//   privateKey: process.env.PRIVATE_KEY
// });


const indexController = require('../controllers/index');


// router.get('/client_token', (req, res, next) => {
//   // gateway.clientToken.generate({}, function (err, response) {
//   //   res.send(response.clientToken);
//   // });
// var options = { method: 'GET',
//   url: 'https://alnye655321.auth0.com/api/v2/',
//   headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qTXpRemhHTmpoR01rWkRORVJFUkVJMFFUWTJSRU5ETVVWRE9VTTFNRFZFTjBKQ1FqbEJSZyJ9.eyJpc3MiOiJodHRwczovL2FsbnllNjU1MzIxLmF1dGgwLmNvbS8iLCJzdWIiOiIwaG1BQ0I5ODNKTmxEZ0dWdzZWZHhmOGZoY3BjNjdtWUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hbG55ZTY1NTMyMS5hdXRoMC5jb20vYXBpL3YyLyIsImV4cCI6MTQ4Nzc4OTM1MSwiaWF0IjoxNDg3NzAyOTUxLCJzY29wZSI6InJlYWQ6Y2xpZW50X2dyYW50cyBjcmVhdGU6Y2xpZW50X2dyYW50cyBkZWxldGU6Y2xpZW50X2dyYW50cyB1cGRhdGU6Y2xpZW50X2dyYW50cyByZWFkOnVzZXJzIHVwZGF0ZTp1c2VycyBkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIHJlYWQ6dXNlcnNfYXBwX21ldGFkYXRhIHVwZGF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgZGVsZXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyJ9.F4HI93nLPGrdd5HUTMqNchSMdhlaeyiea-oiiBorkaNcDgxEQ4ujsutG4SqBFOyoSmQdnMb5fAUO3dkkHd7dnua7V7Gojl_DZVQGc8SxxOc6uGOyVjgVY6F4iBDvg7F7418fW_Gj6UuZTdgL-91NpxAvvEfs-c-oapgwxw3CYUHObqAThnsSKYqXq0ytVy4TLryDbDc0YgPqKI6Ld8o11la9DArhpK2_ZjzbK-BxERe4k_M6EAxyK4-_KNCJpqX6kiqxwMRqntJdz8naQN3nz21JKptn357uH_btm2YXiDXYEZo6aRV76Pp9zUEyxdtZw7iWQMlcyAj0L3OTyTlecQ' } };
//
// request(options, function (error, response, body) {
//   if (error) throw new Error(error);
//
//   console.log(body);
// });
//
// });

router.get('/logo', (req, res, next) => {
  res.sendFile('/app/src/server/images/LogoTrans.png'); // !!! must be absolute path
});


// qr code business card generator
// for desktop
router.get('/qr/:id', (req, res, next) => {
  var workerEmail = req.params.id;
  var doc = new PDFDocument;

  // Write headers
    res.setHeader('Content-Type', 'application/pdf');
   res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');

  // Pipe generated PDF into response
  doc.pipe(res);

  // Process image
  request({
      url: 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' + workerEmail,
      encoding: null // Prevents Request from converting response to string
  }, function(err, response, body) {
      if (err) throw err;

      doc.font('/app/src/server/routes/fonts/Roboto-Regular.ttf')
       .fontSize(20)
       .fillColor('#85bb65')
       .text('Download bTIPt to send a tip!', {width: 410, align: 'left'});

      // Inject image
      doc.image(body, 10, 125); // `body` is a Buffer because we told Request
                       // to not make it a string --> numbers are x/y coordinates

     doc.font('/app/src/server/routes/fonts/Roboto-Regular.ttf')
      .fontSize(15)
      .fillColor('black')
      .text('Scan this code to send a tip to',115,135, {width: 250, align: 'right'}); // numbers are x/y coordinates

      doc.font('/app/src/server/routes/fonts/Roboto-Regular.ttf')
       .fontSize(15)
       .fillColor('black')
       .text('Alex Nye',115,160, {width: 250, align: 'right'}); // numbers are x/y coordinates

      doc.end(); // Close document and, by extension, response
      return;
  });

});

router.get('/test', (req, res, next) => {
  // var qr_png = qr.image('I love QR!', { type: 'png' });
  // res.writeHead(200, {'Content-Type': 'image/png'});
  // qr_png.pipe(res);

  var qr_png = qr.image('I love QR!', { type: 'png' });
  qr_png.pipe(require('fs').createWriteStream('qr_1.png'));

});

// router.get('/test2', (req, res, next) => {
//   var qr_png = qr.image('I love QR!', { type: 'png' });
//   var doc = new PDFDocument;
//
//   res.setHeader('Content-Type', 'application/pdf');
//  res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
//  doc.pipe(res);
//
//   doc.font('/app/src/server/routes/fonts/Roboto-Regular.ttf')
//    .fontSize(25)
//    .text('Some text with an embedded font!', 100, 100);
//
//
// //    doc.image('http://qrickit.com/api/qr.php?d=alex@nye.com', {
// //    fit: [250, 300],
// //    align: 'center',
// //    valign: 'center'
// // });
//
//
//    doc.addPage()
//    .fillColor("blue")
//    .text('Here is a link!', 100, 100)
//    .link(100, 100, 160, 27, 'http://google.com/');
//
//    doc.end();
//    //res.send(doc);
//
// });

router.get('/allowed_workers/:id', (req, res, next) => {
  var workerEmail = req.params.id;
  db.any("SELECT count (*) FROM workers WHERE email = $1", workerEmail)
  .then((results) => {
    if(results[0].count > 0) {
      res.send("Found").status(200);
    }
    else {
      res.send("Not Found").status(404);
    }
  })
  .catch((error) => {
    next(error);
  });
});

router.get('/account_type/:id', (req, res, next) => {
  const authId = req.params.id;

  db.tx(function (t) {
      // `t` and `this` here are the same;
      // this.ctx = transaction config + state context;
      return t.batch([
          t.one("select count (*) from guests where auth_id = $1", authId),
          t.one("select count (*) from workers where auth_id = $1", authId)
      ]);
    })
    // using .spread(function(user, event)) is best here, if supported;
    .then(function (data) {
      var guestCount = data[0].count;
      var workerCount = data[1].count;
      console.log(guestCount);
      console.log(workerCount);

      if(guestCount > 0) {
        res.json({type:"guest"}).status(200);
      }
      else if (workerCount > 0) {
        res.json({type:"worker"}).status(200);
      }
      else {
        res.json({type:"none"}).status(200);
      }
    })
    .catch(function (error) {
        console.log("ERROR:", error.message || error);
    });


});


module.exports = router;
