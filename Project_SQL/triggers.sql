CREATE TABLE restaurant_backup AS SELECT * FROM restaurant WHERE false;
CREATE TABLE restaurant_photos_backup AS SELECT * FROM restaurant_photos WHERE false;
CREATE TABLE restaurant_discount_offered_backup AS SELECT * FROM restaurant_discount_offered WHERE false;
CREATE TABLE food_backup AS SELECT * FROM food WHERE false;
CREATE TABLE food_food_type_backup AS SELECT * FROM food_food_type WHERE false;
CREATE TABLE food_order_backup AS SELECT * FROM food_order WHERE false;
CREATE TABLE food_discount_offered_backup AS SELECT * FROM food_discount_offered WHERE false;
CREATE TABLE review_backup AS SELECT * FROM review WHERE false;

CREATE OR REPLACE FUNCTION backup_deleted_records()
RETURNS TRIGGER AS $$
BEGIN
        INSERT INTO restaurant_backup values(old.*);

        INSERT INTO food_order_backup
        SELECT * FROM food_order WHERE food_id IN (SELECT id FROM food WHERE restaurant_id = OLD.id);

        INSERT INTO restaurant_photos_backup SELECT * FROM restaurant_photos WHERE restaurant_id = OLD.id;

        INSERT INTO restaurant_discount_offered_backup SELECT * FROM restaurant_discount_offered WHERE restaurant_id = OLD.id;

        INSERT INTO food_backup SELECT * FROM food WHERE restaurant_id = OLD.id;

        INSERT INTO food_food_type_backup SELECT * FROM food_food_type WHERE food_id IN (SELECT id FROM food WHERE restaurant_id = OLD.id);

        INSERT INTO food_discount_offered_backup SELECT * FROM food_discount_offered WHERE food_id IN (SELECT id FROM food WHERE restaurant_id = OLD.id);

        INSERT INTO review_backup SELECT * FROM review WHERE restaurant_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER backup_deleted_records_trigger
BEFORE DELETE ON restaurant
FOR EACH ROW
EXECUTE FUNCTION backup_deleted_records();


CREATE TABLE review_backup AS SELECT * FROM review WHERE false;

CREATE OR REPLACE FUNCTION backup_deleted_review()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO review_backup VALUES (OLD.*);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backup_deleted_review_trigger
AFTER DELETE ON review
FOR EACH ROW
EXECUTE FUNCTION backup_deleted_review();

CREATE OR REPLACE FUNCTION validate_contact_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_no !~ '^\d{11}$' OR NEW.contact_no !~ '^01' THEN
        RAISE EXCEPTION 'Contact number must be 11 digits and start with "01"';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_contact_no_trigger
BEFORE INSERT OR UPDATE ON customer
FOR EACH ROW
EXECUTE FUNCTION validate_contact_no();

CREATE TRIGGER validate_contact_no_restaurant_trigger
BEFORE INSERT OR UPDATE ON restaurant
FOR EACH ROW
EXECUTE FUNCTION validate_contact_no();

CREATE TRIGGER validate_contact_no_driver_trigger
BEFORE INSERT OR UPDATE ON driver
FOR EACH ROW
EXECUTE FUNCTION validate_contact_no();

CREATE OR REPLACE FUNCTION delete_discount_after_first_order()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM customer_discount_offered WHERE customer_id = NEW.customer_id AND customer_discount_id = 109) THEN
        DELETE FROM customer_discount_offered WHERE customer_id = NEW.customer_id AND customer_discount_id = 109;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_first_order_trigger
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION delete_discount_after_first_order();



