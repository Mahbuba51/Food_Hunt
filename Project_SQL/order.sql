create table orders (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	date DATE  NOT NULL SET DEFAULT CURRENT_DATE,
	total_amount INT NOT NULL CHECK (total_amount > 0),
	promotion_discount INT,
	special_instructions VARCHAR(150),
	delivery_charge INT NOT NULL CHECK (delivery_charge >= 0),
	order_time TIME NOT NULL SET DEFAULT CURRENT_TIME,
    delivery_time TIME CHECK (delivery_time > order_time),
	delivery_location VARCHAR(50) NOT NULL,
	status VARCHAR(30) NOT NULL SET DEFAULT 'Order Confirmed',
	customer_id BIGINT NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
	driver_id BIGINT NOT NULL REFERENCES driver(id) ON DELETE NULL
);

create table discount_applied(
	order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
	discount_id BIGINT NOT NULL REFERENCES discount(id) ON DELETE CASCADE
);