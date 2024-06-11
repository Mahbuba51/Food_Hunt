create table review (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	score INT NOT NULL CHECK (score >= 0 AND score <= 5),
	comment TEXT,
	customer_id BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
	restaurant_id BIGINT NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE
);
insert into review (score, comment, customer_id, restaurant_id) values (1, 'Food was not good.', 3, 5);
insert into review (score, comment, customer_id, restaurant_id) values (5, 'The food and the service was very good. Will be coming back for seconds!', 10, 2);
insert into review (score, comment, customer_id, restaurant_id) values (4, 'Food was delicious, but the service could have been better.', 8, 4);



