const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const jwt = require('express-jwt');
//const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authenticate = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: process.env.CLIENT_SECRET,
  // Validate the audience and the issuer.
  audience: process.env.CLIENT_ID,
  issuer: `http://${process.env.AUTH_DOMAIN}/`,
  algorithms: ['HS256']
});
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  auth: {
    user: 'osvinandroid@gmail.com',
    pass: 'osvin@40'
  }
});
const indexController = require('../controllers/index');

var email_worker = function(email, message, next) {

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"bTIPt" <foo@blurdybloop.com>', // sender address
    to: email, // list of receivers
    subject: 'Hello, You got a new tip', // Subject line
    text: message, // plain text body
    html: '<b>New tp arrived</b>' // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return next(error);
    }
    // console.log('Message %s sent: %s', info.messageId, info.response);
    return next(null, info);
  });
}
router.get('/balance/:id', (req, res, next) => {
  var authId = req.params.id;
  const renderObject = {};
  db.any("SELECT account_balance FROM guests WHERE auth_id = $1", authId)
    .then((results) => {
      res.json(results).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// getting all tips for guest based on authID
router.get('/:id', (req, res, next) => {
  const userAuthId = req.params.id;
  const renderObject = {};
  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.guest_auth_id = $1 ORDER BY tip_time DESC', userAuthId)
    .then((results) => {
      renderObject.tips = results;
      res.json(renderObject.tips).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// desktop dashboard admin calculations
// by hotel id  total.toFixed(2),
router.get('/dashboard/:id', (req, res, next) => {
  const hotelId = parseInt(req.params.id);
  const renderObject = {};
  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.hotel_id = $1', hotelId)
    .then((results) => {
      renderObject.total_tips = results.length; //tips count

      var avg = 0;
      var total = 0;

      for (var i = 0; i < results.length; i++) {
        total += parseFloat(results[i].amount);
      }

      var avg = total / results.length;
      renderObject.avg = avg.toFixed(2);
      renderObject.total = total.toFixed(2);

      db.any("select count (*) from workers where hotel_id = $1", hotelId)
        .then((results2) => {
          var countRes = results2[0];
          console.log(countRes);
          renderObject.employees = countRes.count;
          console.log(renderObject);
          res.json(renderObject).status(200);
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
});

// run calculations on worker tips by auth id
// admin route
router.get('/tip_math/:id', (req, res, next) => {
  const hotelId = req.params.id;
  const tipsRes = {};
  const responseArr = [];

  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.hotel_id = $1', hotelId)
    .then((results) => {
      //console.log(results);
      tipsRes.data = results;

      db.any('SELECT DISTINCT worker_auth_id FROM tips where hotel_id = $1', hotelId)
        .then((results2) => {
          var workerList = results2;
          //console.log(workerList);

          for (var i = 0; i < workerList.length; i++) {
            var authID = workerList[i].worker_auth_id;
            //console.log(authID);
            var total = 0;
            var count = 0;
            var name = '';

            for (var y = 0; y < tipsRes.data.length; y++) {
              if (authID == tipsRes.data[y].worker_auth_id) {
                //console.log(tipsRes.data[y]);
                name = tipsRes.data[y].worker_name;
                total += parseFloat(tipsRes.data[y].amount);
                count++;
              }
              if (y == tipsRes.data.length - 1) { // run on last iteration
                var avg = total / count;
                responseArr.push({
                  worker_name: name,
                  count: count,
                  total: total.toFixed(2),
                  avg: avg.toFixed(2)
                });
              }
            } // end 2nd loop

          } // end 1st loop
          //console.log(responseArr);
          res.json(responseArr).status(200);

        })
        .catch((error) => {
          next(error);
        });

    })
    .catch((error) => {
      next(error);
    });
});

// getting all tips for workers based on authID
// check return joins for guest name includes
router.get('/workers/:id', (req, res, next) => {
  const workerAuthId = req.params.id;
  const renderObject = {};
  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.worker_auth_id = $1 ORDER BY tip_time DESC', workerAuthId)
    .then((results) => {
      renderObject.tips = results;
      res.json(renderObject.tips).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// getting all tips by hotel - admin
// check return joins for guest/worker name includes
router.get('/hotels/:id', (req, res, next) => {
  const hotelId = parseInt(req.params.id);
  const renderObject = {};
  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.hotel_id = $1', hotelId)
    .then((results) => {
      renderObject.tips = results;
      res.json(renderObject.tips).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// graph data by hotel - admin
// average tip
// !!! check toMonth fn()
router.get('/graph/:id', (req, res, next) => {
  const hotelId = parseInt(req.params.id);
  const tipsRes = {};
  const graphRes = {};
  graphRes.totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // totals by month
  graphRes.count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // count of tips by month
  graphRes.avg = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // avg of tips by month

  db.any('SELECT tips.*, hotels.name as hotel_name, hotels.city as hotel_city, workers.name as worker_name FROM tips JOIN hotels on hotels.id = tips.hotel_id JOIN workers on workers.auth_id = tips.worker_auth_id WHERE tips.hotel_id = $1', hotelId)
    .then((results) => {
      tipsRes.data = results;
      var count = 0;
      for (var y = 0; y < tipsRes.data.length; y++) {
        graphRes.totals[toMonth(tipRes.data[y].tip_time)] = graphRes.totals[toMonth(tipRes.data[y].tip_time)] + parseFloat(tipRes.data[y].amount);
        graphRes.count[toMonth(tipRes.data[y].tip_time)] = graphRes.count[toMonth(tipRes.data[y].tip_time)] + 1;

        if (y == tipsRes.data.length - 1) { // run on last iteration
          for (var i = 0; i < graphRes.totals.length; i++) { // calculate averages
            var avg = graphRes.totals[i] / graphRes.count[i];
            graphRes.avg[i] = avg.toFixed(2);
          }
          res.json(graphRes).status(200);
        } // end if on last iteration
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/', (req, res, next) => {
  // !!! accounting for btipt profit of 10% in worker_amount distributed to worker
  const newTip = {
    guest_auth_id: req.body.guest_auth_id,
    worker_auth_id: 'awaiting',
    hotel_id: 'awaiting',
    amount: req.body.amount,
    worker_email: req.body.worker_email,
    worker_amount: req.body.amount * 0.90
  };

  /*  db.any('SELECT id, hotel_id, name, email, auth_id from workers WHERE email = $1', newTip.worker_email)
      .then((results) => {
        console.log(results);
        newTip.worker_auth_id = results[0].auth_id;
        newTip.hotel_id = results[0].hotel_id;

        if (results) {
          db.tx(t => {
              return t.batch([
                t.any(`INSERT INTO tips (guest_auth_id, worker_auth_id, hotel_id, amount) VALUES('${newTip.guest_auth_id}', '${newTip.worker_auth_id}', '${newTip.hotel_id}', '${newTip.amount}')`),
                t.any(`UPDATE guests SET account_balance = (account_balance - ${newTip.amount}) WHERE auth_id = '${newTip.guest_auth_id}'`),
                t.any(`UPDATE workers SET account_balance = (account_balance + ${newTip.worker_amount}) WHERE auth_id = '${newTip.worker_auth_id}'`)
              ]);
            })
            .then(result => {
              if (!result.length) {
                res.status(404).send({
                  status: 'error',
                  message: 'There was an error in your transaction, please ensure your account is funded and try again.'
                });
              } else {
                res.send('You made a tip!');
                email_worker(newTip.worker_email, "Hi from btipt", function(err, data) {
                  if (err) {
                    console.log('err', err);
                  } else {
                    console.log('data', data);
                  }
                });
              }
            })
            .catch((error) => {
              next(error);
            });

        } else {
          res.status(404).send({
            status: 'error',
            message: 'Worker account not found'
          });
        }

      })
      .catch((error) => {
        next(error);
      });

    router.post('/review', (req, res, next) => {
      const review = {
        message: req.body.message,
        stars: req.body.stars,
        id: req.body.id
      };
      db.any('UPDATE tips SET message = $1 WHERE id = $2', review.message, review.id)
        .then((result) => {
          console.log(result);
          res.json("Success").status(200);
        })
        .catch((error) => {
          next(error);
        });
    });
  */

  email_worker(newTip.worker_email, "Hi from btipt", function(err, data) {
    if (err) {
      next(err);
    } else {
      res.json(data).status(200);
    }
  });
});


module.exports = router;
