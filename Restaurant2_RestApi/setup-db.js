// -------------Migrating to Postgres hosted on Neon (----------27/08---------------)
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.PG_CONNECTION_STRING;
const client = new Client({ connectionString });

async function runSql() {
  try {
    await client.connect();
    console.log("Successfully connected to Postgres DB");

    // Drop old tables if they exist
    await client.query(`DROP TABLE IF EXISTS menu, offers, orders CASCADE;`);

    // Create menu table
    await client.query(`
      CREATE TABLE menu (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL,
        available BOOLEAN NOT NULL
      );
    `);

    // Create offers table
    await client.query(`
      CREATE TABLE offers (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        conditions JSONB,
        discount JSONB,
        active BOOLEAN NOT NULL,
        usage_limit INT,
        used_count INT,
        terms TEXT
      );
    `);

    //  Create orders table (with JSONB items array)
    await client.query(`
      CREATE TABLE orders (
        id VARCHAR PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        items JSONB NOT NULL,
        total NUMERIC(10,2),
        status TEXT NOT NULL,
        order_time TIMESTAMP NOT NULL
      );
    `);
    // Populate data in all the three tables
    await client.query(`
      INSERT INTO menu (id, name, price, category, available) VALUES
      ('1', 'Margherita Pizza', 12.99, 'Pizza', true),
      ('2', 'Chicken Burger', 8.99, 'Burger', true),
      ('3', 'Caesar Salad', 6.50, 'Salad', true),
      ('4', 'Pepperoni Pizza', 14.99, 'Pizza', false);
    `);

    await client.query(`
      INSERT INTO offers (id, name, type, description, conditions, discount, active, usage_limit, used_count, terms) VALUES
      ('offer_001', 'Pizza Lovers Deal', 'combo', 'Order 2 Pizzas + 1 Salad and get 25% off total',
       '{"required_items":[{"menu_id":"1","quantity":2},{"menu_id":"3","quantity":1}]}',
       '{"type":"percentage","value":25}', true, 200, 0,
       'Valid on combo orders only. Cannot be combined with other offers.'),
      
      ('offer_002', 'Burger Bonanza', 'bogo_percentage', 'Buy 3 Chicken Burgers and get 50% off the total burger cost',
       '{"required_items":[{"menu_id":"2","quantity":3}]}',
       '{"type":"percentage","value":50,"applies_to":"matching_items_only"}', true, 150, 0,
       'Discount applies only to burger items. Minimum 3 burgers required.'),
      
      ('offer_003', 'Complete Meal Deal', 'combo', 'Order 1 Pizza + 1 Burger + 1 Salad and save 30%',
       '{"required_items":[{"menu_id":"1","quantity":1},{"menu_id":"2","quantity":1},{"menu_id":"3","quantity":1}]}',
       '{"type":"percentage","value":30}', true, 100, 0,
       'Must order exactly 1 of each item type. Valid for limited time.');
    `);

    // Insert sample orders (only first 2 shown here, extend with the rest)
    await client.query(`
      INSERT INTO orders (id, customer_name, customer_phone, items, total, status, order_time) VALUES
      (
        'order_001',
        'John Doe',
        '555-0123',
        '[{"menu_id":"1","name":"Margherita Pizza","quantity":2,"price":12.99,"total":25.98}]',
        25.98,
        'order_accepted',
        '2025-08-15T18:30:00Z'
      ),
      (
        'order_002',
        'Jane Smith',
        '555-0456',
        '[{"menu_id":"2","name":"Chicken Burger","quantity":1,"price":8.99,"total":8.99},
          {"menu_id":"3","name":"Caesar Salad","quantity":1,"price":6.5,"total":6.5}]',
        15.49,
        'order_rejected',
        '2025-08-19T17:15:00Z'
      );
    `);
      
    console.log("Tables created and data inserted!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
    console.log(" Database session ended");
  }
}
runSql();
// import { MongoClient } from 'mongodb';
// const menu_data = [
//   {
//     _id: "1",
//     name: "Margherita Pizza",
//     price: 12.99,
//     category: "Pizza",
//     available: true
//   },
//   {
//     _id: "2",
//     name: "Chicken Burger",
//     price: 8.99,
//     category: "Burger",
//     available: true
//   },
//   {
//     _id: "3",
//     name: "Caesar Salad",
//     price: 6.50,
//     category: "Salad",
//     available: true
//   },
//   {
//     _id: "4",
//     name: "Pepperoni Pizza",
//     price: 14.99,
//     category: "Pizza",
//     available: false
//   }
// ];
// const orders_data = [
//   {
//     _id: "order_001",
//     customer_name: "John Doe",
//     customer_phone: "555-0123",
//     items: [
//       {
//         menu_id: "1",
//         name: "Margherita Pizza",
//         quantity: 2,
//         price: 12.99
//       }
//     ],
//     total: 25.98,
//     status: "preparing",
//     order_time: new Date("2025-08-15T18:30:00Z")
//   },
//   {
//     _id: "order_002",
//     customer_name: "Jane Smith",
//     customer_phone: "555-0456",
//     items: [
//       {
//         menu_id: "2",
//         name: "Chicken Burger",
//         quantity: 1,
//         price: 8.99
//       },
//       {
//         menu_id: "3",
//         name: "Caesar Salad",
//         quantity: 1,
//         price: 6.50
//       }
//     ],
//     total: 15.49,
//     status: "delivered",
//     order_time: new Date("2025-08-19T17:15:00Z")
//   }
// ];

// const setupDatabase = async () => {
//   try {
//     const client = new MongoClient('mongodb://localhost:27017');
//     await client.connect();
//     console.log('Connected to MongoDB');
//     const db = client.db('restaurant2_db');
//     await db.collection('menu').insertMany(menu_data);
//     console.log('Menu items inserted');
//     await db.collection('orders').insertMany(orders_data);
//     console.log('Orders inserted');
//     console.log(`Database setup complete!`);
//     await client.close();
//   } catch (error) {
//     console.error('Error setting up database:', error);
//   }
// };
// setupDatabase();