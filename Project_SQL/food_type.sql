CREATE TABLE food_type (
    id BIGSERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);
insert into food_type (type_name) values ('Appetizer');
insert into food_type (type_name) values ('Soup');
insert into food_type (type_name) values ('Salad');
insert into food_type (type_name) values ('Main Course');
insert into food_type (type_name) values ('Dessert');
insert into food_type (type_name) values ('Beverage');
insert into food_type (type_name) values ('Italian');
insert into food_type (type_name) values ('Mexican');
insert into food_type (type_name) values ('Chinese');
insert into food_type (type_name) values ('Indian');
insert into food_type (type_name) values ('Thai');
insert into food_type (type_name) values ('Greek');
insert into food_type (type_name) values ('French');
insert into food_type (type_name) values ('American');
insert into food_type (type_name) values ('Mediterranean');

CREATE TABLE food_type_recursive (
    parent_type_id INT REFERENCES food_type(id) ON DELETE CASCADE,
    child_type_id INT REFERENCES food_type(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_type_id, child_type_id)
);
insert into food_type_recursive(parent_type_id, child_type_id) values(1,7);
insert into food_type_recursive(parent_type_id, child_type_id) values(1,14);
insert into food_type_recursive(parent_type_id, child_type_id) values(1,8);
insert into food_type_recursive(parent_type_id, child_type_id) values(1,13);
insert into food_type_recursive(parent_type_id, child_type_id) values(2,13);
insert into food_type_recursive(parent_type_id, child_type_id) values(2,14);
insert into food_type_recursive(parent_type_id, child_type_id) values(2,15);
insert into food_type_recursive(parent_type_id, child_type_id) values(2,9);
insert into food_type_recursive(parent_type_id, child_type_id) values(3, 14);
insert into food_type_recursive(parent_type_id, child_type_id) values(3,8);
insert into food_type_recursive(parent_type_id, child_type_id) values(3,7);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,7);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,8);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,9);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,10);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,11);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,12);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,13);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,14);
insert into food_type_recursive(parent_type_id, child_type_id) values(4,15);
insert into food_type_recursive(parent_type_id, child_type_id) values(5,13);
insert into food_type_recursive(parent_type_id, child_type_id) values(5,12);
insert into food_type_recursive(parent_type_id, child_type_id) values(6,10);
