create table restaurant (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(50) NOT NULL,
	contact_no VARCHAR(11) NOT NULL,
	email VARCHAR(50) NOT NULL UNIQUE,
	location VARCHAR(50) NOT NULL,
	opening_time TIME NOT NULL,
	closing_time TIME NOT NULL CHECK (closing_time > opening_time)
);
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('The Hungry Spoon', '01791234568', 'mcatherine0@google.com', '1234 Oak Alley', '8:47:00', '23:56:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Cafe Delight', '01891234568', 'lfaich1@newyorker.com', '729 Raven Circle', '9:26:00', '23:36:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Bistro Bliss', '01991234568', 'ssimper2@360.cn', '6094 Meadow Valley Park', '11:16:00', '23:02:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('The Savory Plate', '01611234569', 'cstreeting3@ibm.com', '88 Sycamore Crossing', '8:34:00', '23:13:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Gourmet Junction', '01521234569', 'gstanhope4@deliciousdays.com', '76 Hoffman Place', '10:17:00', '23:48:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('The Tasty Bite', '01341234569', 'tmosen5@rambler.ru', '4 Clyde Gallagher Circle', '9:12:00', '23:53:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Foodie Haven', '01451234569', 'lniave6@pbs.org', '196 Roxbury Park', '13:32:00', '23:05:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Flavorsome Grill', '01161234569', 'troussell7@washington.edu', '25 Sutteridge Lane', '12:11:00', '23:30:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('The Culinary Corner', '01271234569', 'belia8@sciencedirect.com', '9 Maywood Parkway', '9:37:00', '23:57:00');
insert into restaurant (name, contact_no, email, location, opening_time, closing_time) values ('Dine & Dash', '01081234569', 'cgarroch9@blogspot.com', '28 Corscot Hill', '12:34:00', '23:46:00');


create table restaurant_photos(
	restaurant_id BIGINT PRIMARY KEY NOT NULL REFERENCES restaurant(id) ON  DELETE CASCADE,
	picture_url VARCHAR(1000) NOT NULL
);

CREATE TABLE restaurant_discount (
    discount_id BIGINT PRIMARY KEY REFERENCES discount(id) ON DELETE CASCADE,
    max_discount INTEGER NOT NULL CHECK (max_discount > 0)
);
insert into restaurant_discount(discount_id, max_discount) values(1, 1000);
insert into restaurant_discount(discount_id, max_discount) values(2, 1000);
insert into restaurant_discount(discount_id, max_discount) values(3, 1000);
insert into restaurant_discount(discount_id, max_discount) values(4, 1000);
insert into restaurant_discount(discount_id, max_discount) values(5, 1000);

create table restaurant_discount_offered(
	restaurant_id BIGINT REFERENCES restaurant(id) ON DELETE CASCADE,
	restaurant_discount_id BIGINT REFERENCES restaurant_discount(discount_id) ON DELETE CASCADE,
	PRIMARY KEY (restaurant_id, restaurant_discount_id)
);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(1,1);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(2,2);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(3,3);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(4,4);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(5,5);
insert into restaurant_discount_offered(restaurant_id, restaurant_discount_id) values(8,1);