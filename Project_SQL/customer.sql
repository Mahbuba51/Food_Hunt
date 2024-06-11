create table customer (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(50) NOT NULL,
	contact_no VARCHAR(11) NOT NULL,
	location VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL UNIQUE
);
insert into customer (name, contact_no, location, email) values ('Chloe Kewley', '01701234567', '37 Cordelia Place', 'ckewley0@ifeng.com');
insert into customer (name, contact_no, location, email) values ('Elianora Ferrick', '01801234567', '424 Vahlen Crossing', 'eferrick1@google.ca');
insert into customer (name, contact_no, location, email) values ('Bartlett Nason', '01901234567', '85321 Ramsey Way', 'bnason2@tamu.edu');
insert into customer (name, contact_no, location, email) values ('Carole Feld', '01611234567', '72242 Comanche Point', 'cfeld3@dmoz.org');
insert into customer (name, contact_no, location, email) values ('Bogart Clarkson', '01521234567', '0550 Westend Alley', 'bclarkson4@posterous.com');
insert into customer (name, contact_no, location, email) values ('Neddie Monnery', '01341234567', '2 Stang Drive', 'nmonnery5@free.fr');
insert into customer (name, contact_no, location, email) values ('Marcy Cosbey', '01451234567', '2432 Schlimgen Center', 'mcosbey6@ucoz.com');
insert into customer (name, contact_no, location, email) values ('Pippy Leggs', '01161234567', '8 North Center', 'pleggs7@washingtonpost.com');
insert into customer (name, contact_no, location, email) values ('Roma Brantzen', '01271234567', '1882 Longview Terrace', 'rbrantzen8@ihg.com');
insert into customer (name, contact_no, location, email) values ('Teodor Robken', '01081234567', '846 Debs Crossing', 'trobken9@google.co.jp');

CREATE TABLE customer_discount (
    discount_id BIGINT PRIMARY KEY REFERENCES discount(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL
);
insert into customer_discount (discount_id, code) values (6, '4F9TK8');
insert into customer_discount (discount_id, code) values (7, 'B1JZQX');
insert into customer_discount (discount_id, code) values (8, '1DE65S');
insert into customer_discount (discount_id, code) values (9, 'G5FIPH');
insert into customer_discount (discount_id, code) values (10, 'CT7Q02');
insert into customer_discount (discount_id, code) values (101, '7G3BN2');
insert into customer_discount (discount_id, code) values (102, 'RP6D9A');
insert into customer_discount (discount_id, code) values (103, '5H2VY1');

create table customer_discount_offered(
	customer_id BIGINT REFERENCES customer(id) ON DELETE CASCADE,
	customer_discount_id BIGINT REFERENCES customer_discount(discount_id) ON DELETE CASCADE,
	PRIMARY KEY (customer_id, customer_discount_id)
);
insert into customer_discount_offered(customer_id, customer_discount_id) values(1, 10);
insert into customer_discount_offered(customer_id, customer_discount_id) values(2, 9);
insert into customer_discount_offered(customer_id, customer_discount_id) values(3, 8);