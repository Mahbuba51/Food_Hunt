create table driver (
	id BIGSERIAL PRIMARY KEY NOT NULL,
	user_name VARCHAR(50) NOT NULL,
	password VARCHAR(50) UNIQUE NOT NULL,
	name VARCHAR(50) NOT NULL,
	contact_no VARCHAR(11) NOT NULL,
	driving_license_no VARCHAR(50) NOT NULL,
	monthly_payment INT NOT NULL CHECK (monthly_payment > 0)
);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('mroofe0', 'zT8\20~NG', 'Murielle Roofe', '01791234567', 'DU-070949-VO', 22852);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('hdyke1', 'xZ6=VI@Up57sNM', 'Had Dyke', '01891234567', 'MI-321939-ZM', 13534);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('kmarritt2', 'tA0|s6Xn', 'Kimmy Marritt', '01991234567', 'QK-633949-YN', 24910);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('dthorouggood3', 'yW3/c8p0kJneN>A', 'Devondra Thorouggood', '01611234568', 'YH-010177-GH', 12989);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('cdanielsohn4', 'bV1#{cYsb_SQspc', 'Catlin Danielsohn', '01521234568', 'WM-897916-EI', 24300);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('cschuricke5', 'lE8+\Bwj(29P', 'Chiarra Schuricke', '01341234568', 'FQ-644574-KF', 26170);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('msrutton6', 'tS0,pKi0A8@*h3', 'Marni Srutton', '01451234568', 'RP-108076-NZ', 13915);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('thowis7', 'uU3&NWq@H+@R', 'Tedie Howis', '01161234568', 'GZ-714074-FX', 22472);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('gsteven8', 'qL3=ynx>', 'Garv Steven', '01271234568', 'JB-120732-MO', 24455);
insert into driver (user_name, password, name, contact_no, driving_license_no, monthly_payment) values ('mpoppy9', 'iB9=U$sJ', 'Malvin Poppy', '01081234568', 'ZH-103134-TV', 18561);


INSERT INTO orders (total_amount, delivery_charge, delivery_location, customer_id, driver_id)
VALUES (50, 5, '123 Main St, City, Country', 1, 14);
INSERT INTO orders (total_amount, promotion_discount, special_instructions, delivery_charge, delivery_location, customer_id, driver_id)
VALUES (75, 10, 'Please deliver to the back entrance', 7, '456 Oak St, Town, Country', 2, 15);
INSERT INTO orders (total_amount, delivery_charge, delivery_location, status, customer_id, driver_id)
VALUES (100, 8, '789 Elm St, Village, Country', 'Delivered', 4, 16);
