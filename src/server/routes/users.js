const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const indexController = require('../controllers/index');
const dwolla = require('dwolla-v2');
const appKey = process.env.DWOLLA_KEY;
const appSecret = process.env.DWOLLA_SECRET;
const client = new dwolla.Client({
  key: appKey,
  secret: appSecret,
  environment: 'sandbox' // optional - defaults to production
});
var GuestBlockingMiddleware = function(req, res, next) {
  var authID = req.user.sub.substring(6);
  console.log(authID);
  db.any("select count (*) from guests where auth_id = $1", authID)
    .then((results) => {
      console.log(results);
      if (results[0].count > 0) {
        next();
      } else {
        return res.send(401); // unauthorized
      }
    })
    .catch((error) => {
      next(error);
    });
};

var WorkerBlockingMiddleware = function(req, res, next) {
  var authID = req.user.sub.substring(6);
  console.log(authID);
  db.any("select count (*) from workers where auth_id = $1", authID)
    .then((results) => {
      console.log(results);
      if (results[0].count > 0) {
        next();
      } else {
        return res.send(401); // unauthorized
      }
    })
    .catch((error) => {
      next(error);
    });
};

var AdminBlockingMiddleware = function(req, res, next) {
  var authID = req.user.sub.substring(6);
  console.log(authID);
  db.any("select count (*) from admins where auth_id = $1", authID)
    .then((results) => {
      console.log(results);
      if (results[0].count > 0) {
        next();
      } else {
        return res.send(401); // unauthorized
      }
    })
    .catch((error) => {
      next(error);
    });
};

router.get('/dwolla/test', (req, res, next) => {
  client.auth.client()
    // .then(appToken => appToken.get('customers', { limit: 10 }));
    // .then(res => console.log(res.body));
    .then((results) => {
      var accountToken = new client.Token({ access_token: results.access_token });

      var requestBody = {
       /* firstName: req.body.first_name,
        lastName: req.body.last_name,
        email: req.body.email*/
          /*,
                  type: 'business',
                  address1: '99-99 33rd St',
                  city: 'Some City',
                  state: 'NY',
                  postalCode: '11101',
                  dateOfBirth: '1970-01-01',
                  ssn: '1234',
                  businessClassification: '9ed38155-7d6f-11e3-83c3-5404a6144203',
                  businessType: 'llc',
                  businessName: 'Jane Corp',
                  ein: '12-3456789'*/
      };

      /*  accountToken
          .post('customers',requestBody)
          .then((result) => {
            res.json(result.headers.get('location')).status(200);
          });*/
      /* accountToken
         .post('transfers', requestBody)
         .then((data) => {
            res.json(data).status(200);
         });*/
      var customerUrl = 'https://api-sandbox.dwolla.com/customers/16a78f4e-5bae-41dc-8ed8-cf8afe5e95dc';

      accountToken
        .post(`${customerUrl}/iav-token`)
        .then(function(result) {
          // res.body.token; // => 'H4ERA7Y66c1b9eW7NI6TvW1yaZWShbf1bYJ74ytZ9nasdUCJDC'
          res.json(result.body.token).status(200);
        });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/:id', (req, res, next) => {
  var authId = req.params.id;
  const renderObject = {};
  db.any("SELECT * FROM guests WHERE auth_id = $1", authId)
    .then((results) => {
      res.json(results).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/worker/:id', (req, res, next) => {
  var authId = req.params.id;
  const renderObject = {};
  db.any("SELECT * FROM workers WHERE auth_id = $1", authId)
    .then((results) => {
      res.json(results).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// with admin blocking middleware
// router.get('/workers/hotel/:id', AdminBlockingMiddleware, (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   var hotelId = req.params.id;
//   console.log(req.user);
//
//   db.any("SELECT * FROM workers WHERE hotel_id = $1", hotelId)
//   .then((results) => {
//     res.json(results).status(200);
//   })
//   .catch((error) => {
//     next(error);
//   });
// });

// without admin blocking middleware
router.get('/workers/hotel/:id', (req, res, next) => {
  var hotelId = req.params.id;
  console.log(req.user);

  db.any("SELECT * FROM workers WHERE hotel_id = $1", hotelId)
    .then((results) => {
      res.json(results).status(200);
    })
    .catch((error) => {
      next(error);
    });
});


router.get('/worker/confirm/:id', (req, res, next) => {
  const workerEmail = req.params.id;
  const renderObject = {};
  db.any('SELECT id, hotel_id, name, email, auth_id from workers WHERE email = $1', workerEmail)
    .then((results) => {

      if (results) {
        renderObject.workerResponse = results;
        renderObject.status = "success";
        res.json(renderObject.workerResponse).status(200);
      } else {
        renderObject.status = "error";
        res.json(renderObject.workerResponse).status(200);
      }

    })
    .catch((error) => {
      next(error);
    });
});

router.get('/allowed_workers/:id', (req, res, next) => {
  var hotelId = req.params.id;

  db.any("SELECT * FROM allowed_workers WHERE hotel_id = $1", hotelId)
    .then((results) => {
      res.json(results).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/guest', (req, res, next) => {
  const newUser = {
    email: req.body.email,
    auth_id: req.body.auth_id,
    name: req.body.name
  };
  //this sql statement only inserts a new user if their auth_id doesn't already exist
  db.any(`INSERT INTO guests (name, email, auth_id) SELECT '${newUser.name}', '${newUser.email}', '${newUser.auth_id}' WHERE NOT EXISTS (SELECT 1 FROM guests WHERE auth_id=$1)`, newUser.auth_id)
    .then((result) => {
      console.log(result);
      //res.send('You added a user!');
      res.json("success").status(200);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
});

router.post('/worker', (req, res, next) => {
  const newWorker = {
    email: req.body.email,
    auth_id: req.body.auth_id,
    name: req.body.name,
    hotel_id: req.body.hotel_id
  };
  //this sql statement only inserts a new worker if their auth_id doesn't already exist
  db.any(`INSERT INTO workers (name, email, auth_id, hotel_id) SELECT '${newWorker.name}', '${newWorker.email}', '${newWorker.auth_id}', '${newWorker.hotel_id}' WHERE NOT EXISTS (SELECT 1 FROM guests WHERE auth_id=$1)`, newWorker.auth_id)
    .then((result) => {
      console.log(result);
      res.send('You added a user!');
      //res.json(result.auth_id).status(200);
    })
    .catch((error) => {
      next(error);
    });
});

// add to the list of workers used to allow for signups
router.post('/allowed_workers', (req, res, next) => {
  const newWorker = {
    hotel_id: req.body.hotel_id,
    name: req.body.name,
    email: req.body.email,
    department: req.body.department
  };
  console.log(newWorker);
  //this sql statement only inserts a new worker if their auth_id doesn't already exist
  db.any(`INSERT INTO allowed_workers (hotel_id, name, email, department) VALUES('${newWorker.hotel_id}', '${newWorker.name}', '${newWorker.email}', '${newWorker.department}')`)
    .then((result) => {
      console.log(result);
      //res.send('You added a user!');
      res.json(result).status(200);
    })
    .catch((error) => {
      next(error);
    });
});





module.exports = router;
