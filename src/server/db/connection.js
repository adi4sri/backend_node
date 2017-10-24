const options = {}; // add options here
const pgp = require('pg-promise')(options);

// const db = pgp('postgres://kmesymgvpxzqkf:bb1e76fb617b21da8e92843a669a2f4f14a45d7c595f9ffa8766a11ae01fa140@ec2-204-236-218-242.compute-1.amazonaws.com:5432/d8gdho1q1v420b');
const db = pgp('postgres://postgres:dbMaster@localhost:5432/btipt');
module.exports = db;
