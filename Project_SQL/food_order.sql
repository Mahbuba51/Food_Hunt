create table food_order (
	food_id BIGINT NOT NULL,
	order_id BIGINT NOT NULL,
	no_of_servings INT NOT NULL CHECK (no_of_servings > 0),
	PRIMARY KEY (food_id, order_id),
	FOREIGN KEY (food_id) REFERENCES food(id) ON DELETE CASCADE,
	FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
