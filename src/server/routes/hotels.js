const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const indexController = require('../controllers/index');

router.get('/', (req, res, next) => {
  var authId = req.params.id;
  const renderObject = {};
  db.any("SELECT * FROM hotels")
  .then((results) => {
    res.json(results).status(200);
  })
  .catch((error) => {
    next(error);
  });
});

router.post('/', (req, res, next) => {
  const hotel = {
    name: req.body.name,
    city: req.body.city
  };

  db.any(`INSERT INTO hotels (name, city) VALUES('${hotel.name}', '${hotel.city}')`)
  .then((result) => {
    console.log(result);
    res.json("Success").status(200);
  })
  .catch((error) => {
    next(error);
  });
});

// router.get('/:id', (req, res, next) => {
//   var authId = req.params.id;
//   const renderObject = {};
//   db.any("SELECT * FROM guests WHERE auth_id = $1", authId)
//   .then((results) => {
//     res.json(results).status(200);
//   })
//   .catch((error) => {
//     next(error);
//   });
// });


module.exports = router;
