CREATE OR REPLACE FUNCTION add_restaurant(
    p_name VARCHAR(50),
    p_contact_no VARCHAR(11),
    p_email VARCHAR(50),
    p_location VARCHAR(50),
    p_opening_time TIME,
    p_closing_time TIME
) RETURNS INTEGER AS $$
DECLARE
    restaurant_id INTEGER;
BEGIN
    INSERT INTO restaurant (name, contact_no, email, location, opening_time, closing_time)
    VALUES (p_name, p_contact_no, p_email, p_location, p_opening_time, p_closing_time)
    RETURNING id INTO restaurant_id;
    
    RETURN restaurant_id;
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'Closing time must be greater than opening time.';
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Email must be unique.';
    WHEN others THEN
        RAISE EXCEPTION 'Error adding restaurant: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION delete_restaurant(
    p_restaurant_id BIGINT
) RETURNS VOID AS $$
BEGIN
    DELETE FROM restaurant WHERE id = p_restaurant_id;
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error deleting restaurant: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION add_food(
    p_name VARCHAR(50),
    p_base_price INT,
    p_description VARCHAR(100),
    p_variation INT,
    p_key_ingredient VARCHAR(20),
    p_nutritional_information VARCHAR(12),
    p_restaurant_id BIGINT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO food (name, base_price, description, variation, key_ingredient, nutritional_information, restaurant_id)
    VALUES (p_name, p_base_price, p_description, p_variation, p_key_ingredient, p_nutritional_information, p_restaurant_id);
    EXCEPTION 
    WHEN check_violation THEN
        RAISE EXCEPTION 'Price must be 0 or above.';
    WHEN others THEN
        RAISE EXCEPTION 'Error adding restaurant: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_driver(
    p_driver_id BIGINT
) RETURNS VOID AS $$
BEGIN
    DELETE FROM driver WHERE id = p_driver_id;
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error deleting driver: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_driver(
    p_username VARCHAR(50),
    p_password VARCHAR(50),
    p_name VARCHAR(50),
    p_contact_no VARCHAR(11),
    p_driving_license_no VARCHAR(50),
    p_monthly_payment INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO driver (user_name, password, name, contact_no, driving_license_no, monthly_payment)
    VALUES (p_username, p_password, p_name, p_contact_no, p_driving_license_no, p_monthly_payment);
EXCEPTION 
    WHEN check_violation THEN
        RAISE EXCEPTION 'Monthly payment must be above 0.';
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Password must be unique.';
    WHEN others THEN
        RAISE EXCEPTION 'Error adding driver: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_driver_column(
    p_id BIGINT,
    p_column VARCHAR(50),
    p_value TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'driver' AND column_name = p_column
    ) THEN
        RAISE EXCEPTION 'Column % does not exist in the driver table', p_column;
    END IF;
    EXECUTE format('UPDATE driver SET %I = $1 WHERE id = $2', p_column) USING p_value, p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No driver found with id %', p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_food(p_food_id BIGINT) 
RETURNS VOID AS $$
BEGIN
    DELETE FROM food WHERE id = p_food_id;
END;
$$ LANGUAGE plpgsql;

