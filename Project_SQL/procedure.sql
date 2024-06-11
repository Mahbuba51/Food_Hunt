CREATE OR REPLACE PROCEDURE delete_food(p_food_id BIGINT) 
AS $$
BEGIN
    DELETE FROM food WHERE id = p_food_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_driver(
    p_driver_id BIGINT
)
AS $$
BEGIN
    DELETE FROM driver WHERE id = p_driver_id;
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error deleting driver: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_restaurant(
    p_restaurant_id BIGINT
)
AS $$
BEGIN
    DELETE FROM restaurant WHERE id = p_restaurant_id;
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error deleting restaurant: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE apply_discounts(p_order_id BIGINT, p_discount_code VARCHAR)
AS $$
DECLARE
    discount_id BIGINT;
BEGIN
    FOR discount_id IN (SELECT restaurant_discount_id 
                        FROM restaurant_discount_offered 
                        WHERE restaurant_id IN (
                            SELECT restaurant_id 
                            FROM food 
                            WHERE id IN (
                                SELECT food_id 
                                FROM food_order 
                                WHERE order_id = p_order_id
                            )
                        )) 
    LOOP
        INSERT INTO discount_applied (order_id, discount_id) VALUES (p_order_id, discount_id);
    END LOOP;

    FOR discount_id IN (SELECT food_discount_id 
                        FROM food_discount_offered 
                        WHERE food_id IN (
                            SELECT food_id 
                            FROM food_order 
                            WHERE order_id = p_order_id
                        )) 
    LOOP
        INSERT INTO discount_applied (order_id, discount_id) VALUES (p_order_id, discount_id);
    END LOOP;

    IF p_discount_code IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM customer_discount WHERE code = p_discount_code) THEN
            SELECT cd.discount_id INTO discount_id FROM customer_discount cd WHERE code = p_discount_code;
            INSERT INTO discount_applied (order_id, discount_id) VALUES (p_order_id, discount_id);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE apply_discounts_on_customers()
LANGUAGE plpgsql
AS $$
DECLARE
    customerRecord RECORD;
    totalSpent INT;
BEGIN
    FOR customerRecord IN SELECT id FROM customer
    LOOP
        IF EXISTS (SELECT 1 FROM orders WHERE customer_id = customerRecord.id) THEN
            SELECT SUM(total_amount) INTO totalSpent FROM orders WHERE customer_id = customerRecord.id;
            
            IF totalSpent > 1000 THEN
                INSERT INTO customer_discount_offered (customer_id, customer_discount_id)
                VALUES (customerRecord.id, 101); 
            ELSIF totalSpent > 800 THEN
                INSERT INTO customer_discount_offered (customer_id, customer_discount_id)
                VALUES (customerRecord.id, 102); 
            END IF;
        ELSE
            INSERT INTO customer_discount_offered (customer_id, customer_discount_id)
            VALUES (customerRecord.id, 103); 
        END IF;
    END LOOP;
END;
$$;

