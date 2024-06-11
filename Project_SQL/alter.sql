-- Drop the existing foreign key constraint
ALTER TABLE orders DROP CONSTRAINT orders_driver_id_fkey;

-- Add a new foreign key constraint with ON DELETE SET NULL
ALTER TABLE orders
ADD CONSTRAINT orders_driver_id_fkey
FOREIGN KEY (driver_id)
REFERENCES driver(id)
ON DELETE SET NULL;


ALTER TABLE orders DROP CONSTRAINT orders_customer_id_fkey;

-- Add a new foreign key constraint with ON DELETE SET NULL
ALTER TABLE orders
ADD CONSTRAINT orders_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES customer(id)
ON DELETE SET NULL;

CREATE TABLE delivery_charge (
    id BIGSERIAL PRIMARY KEY,
    charge INT NOT NULL
);

INSERT INTO delivery_charge(charge) VALUES (20);