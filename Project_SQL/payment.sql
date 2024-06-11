create table payment (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	payment_type VARCHAR(20) NOT NULL,
	tips INT,
	order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);
