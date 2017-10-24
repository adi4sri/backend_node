const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const indexController = require('../controllers/index');

router.post('/new', (req, res, next) => {
  const loadBalance = {
    guest_auth_id: req.body.guest_auth_id,
    amount: req.body.amount,
    result: ""
  };

  db.tx(t=> {
    return t.batch([
        t.any(`INSERT INTO balanceActions (guest_auth_id, amount) VALUES('${loadBalance.guest_auth_id}', '${loadBalance.amount}')`),
        t.any(`UPDATE guests SET account_balance = account_balance + ${loadBalance.amount} WHERE auth_id = '${loadBalance.guest_auth_id}'`)
    ]);
    })
  .then(result=> {
    loadBalance.result = "success";
    console.log(loadBalance.result);
    res.json(loadBalance.result).status(200);
  })
  .catch((error) => {
    next(error);
  });
});


router.post('/promotion', (req, res, next) => {
  const loadBalance = {
    guest_auth_id: req.body.guest_auth_id,
    amount: req.body.amount,
    status: 'promotion'
  };
  db.any(`INSERT INTO balanceActions (guest_auth_id, amount, status) VALUES('${loadBalance.guest_auth_id}', '${loadBalance.amount}', '${loadBalance.status}')`)
  .then((result) => {
    console.log(result);
    res.send('You added a balance!');
    //res.json(result.auth_id).status(200);
  })
  .catch((error) => {
    next(error);
  });
});

router.get('/', (req, res, next) => {
  const renderObject = {};
  db.any('SELECT * FROM balanceActions ORDER BY action_time DESC')
  .then((results) => {
    renderObject.balanceActions = results;
    res.json(renderObject.balanceActions).status(200);
  })
  .catch((error) => {
    next(error);
  });
});

// getting balance actions for a guest based on unique auth id
router.get('/:id', (req, res, next) => {
  const guestAuthId = req.params.id;
  const renderObject = {};
  db.any('SELECT * from balanceActions WHERE guest_auth_id = $1 ORDER BY action_time DESC', guestAuthId)
  .then((results) => {
    renderObject.balanceActions = results;
    res.json(renderObject.balanceActions).status(200);
  })
  .catch((error) => {
    next(error);
  });
});

module.exports = router;
