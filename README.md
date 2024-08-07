# Food Delivery Website

This project is a full-stack web application for a food delivery service, developed using PostgreSQL for the database, Node.js for the backend, and EJS for the frontend.

## Features

### Customers
- **Sign Up / Log In**: Customers can sign up with their name and email or log in if they already have an account.
- **Browse Restaurants and Menus**: View all restaurants and their menus.
- **Reviews and Ratings**: Leave scores and reviews for restaurants.
- **Shopping Cart**: Add food items to a cart, remove items, and place orders from one open restaurant at a time.
- **Order History**: View all past orders and any applicable discounts.
- **Account Management**: Update personal information.

### Restaurants
- **Sign Up / Log In**: Restaurants can sign up or log in to manage their account.
- **Menu Management**: View, add, update, or delete food items.
- **Discount Management**: Manage restaurant and food discounts.
- **Order Management**: View existing and previous orders, update order statuses.
- **Account Management**: Update personal information.

### Drivers
- **Log In**: Drivers can log in using their username and password.
- **Order Management**: View existing and delivered orders, update the status of orders.
- **Account Management**: Update personal information.

### Admin
- **Manage Restaurants and Drivers**: Add or delete restaurants and drivers.
- **Financial Management**: Change monthly salaries for drivers and adjust delivery charges.
- **Discount Management**: Add or delete customer discounts.
- **Account Management**: Update personal information.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Embedded JavaScript templates)
- **Database**: PostgreSQL
- **Authentication**: Session-based authentication

## Setup and Running the Application

### Prerequisites
- Node.js and npm installed on your system.
- PostgreSQL installed and running on your system.

### Setup Instructions

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/Mahbuba51/Food_Hunt.git
   cd Food-Hunt
   ```

2. **Install Dependencies**:
   ```sh
   npm install
   ```

3. **Configure the Database**:
   - Create a PostgreSQL database.
   - Update the database configuration in the `.env` file with your database credentials.

4. **Run Database Migrations**:
   ```sh
   npx sequelize-cli db:migrate
   ```

5. **Seed the Database** (if you have seed data):
   ```sh
   npx sequelize-cli db:seed:all
   ```

6. **Start the Application**:
   ```sh
   npm start
   ```

   The application should now be running on `http://localhost:5501`.

## Usage

- Access the website at `http://localhost:5501`.
- Sign up or log in as a customer, restaurant, driver, or admin to explore the different functionalities.

## Project Structure

- `routes/`: Contains the route definitions for different entities.
- `views/`: Contains EJS templates for the frontend.
- `public/`: Contains static assets like CSS and JavaScript files.
- `.env`: Environment configuration file.
