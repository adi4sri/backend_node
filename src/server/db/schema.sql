-- DROP DATABASE IF EXISTS test1;
-- CREATE DATABASE test1;

DROP TABLE IF EXISTS tips;
DROP TABLE IF EXISTS balanceActions;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS workers;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS hotels;



CREATE TABLE tips (
id SERIAL PRIMARY KEY,
guest_auth_id VARCHAR,
worker_auth_id VARCHAR,
hotel_id INTEGER,
amount DECIMAL(10,2),
promotion_amount DECIMAL(10,2),
tip_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE balanceActions (
id SERIAL PRIMARY KEY,
guest_auth_id VARCHAR,
amount DECIMAL(10,2),
action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status VARCHAR
);

CREATE TABLE guests (
id SERIAL PRIMARY KEY,
name VARCHAR,
age INTEGER,
login_type VARCHAR,
email VARCHAR,
social_id VARCHAR,
social_type VARCHAR,
account_balance DECIMAL(10,2) DEFAULT 0.00,
account_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
auth_id VARCHAR UNIQUE
);

CREATE TABLE workers (
id SERIAL PRIMARY KEY,
hotel_id INTEGER,
name VARCHAR,
age INTEGER,
login_type VARCHAR,
email VARCHAR,
social_id VARCHAR,
social_type VARCHAR,
account_balance DECIMAL(10,2) DEFAULT 0.00,
account_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
auth_id VARCHAR UNIQUE
);

CREATE TABLE allowed_workers (
id SERIAL PRIMARY KEY,
hotel_id INTEGER,
name VARCHAR,
email VARCHAR,
department VARCHAR
);

CREATE TABLE admins (
id SERIAL PRIMARY KEY,
hotel_id INTEGER,
name VARCHAR,
age INTEGER,
login_type VARCHAR,
email VARCHAR,
social_id VARCHAR,
social_type VARCHAR,
account_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
auth_id VARCHAR UNIQUE
);

CREATE TABLE hotels (
id SERIAL PRIMARY KEY,
name VARCHAR,
city VARCHAR,
account_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


insert into hotels (id, name, city) values (1, 'Zero Defect', 'Denver');
insert into hotels (id, name, city) values (2, 'Plazza', 'New York');
insert into hotels (id, name, city) values (3, 'Hilton', 'Bangkok');
insert into hotels (id, name, city) values (4, 'Trump Tower', 'Hell');
insert into hotels (id, name, city) values (5, 'Hogwarts', 'London');

-- reset id sequence tables
SELECT setval('tips_id_seq', (SELECT MAX(id) FROM tips));
SELECT setval('balanceActions_id_seq', (SELECT MAX(id) FROM balanceActions));
SELECT setval('guests_id_seq', (SELECT MAX(id) FROM guests));
SELECT setval('workers_id_seq', (SELECT MAX(id) FROM workers));
SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));
SELECT setval('hotels_id_seq', (SELECT MAX(id) FROM hotels));
