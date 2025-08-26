import { MongoClient } from 'mongodb';
const menu_data = [
  {
    _id: "1",
    name: "Margherita Pizza",
    price: 12.99,
    category: "Pizza",
    available: true
  },
  {
    _id: "2", 
    name: "Chicken Burger",
    price: 8.99,
    category: "Burger",
    available: true
  },
  {
    _id: "3",
    name: "Caesar Salad",
    price: 6.50,
    category: "Salad",
    available: true
  },
  {
    _id: "4",
    name: "Pepperoni Pizza",
    price: 14.99,
    category: "Pizza",
    available: false
  }
];
const orders_data = [
  {
    _id: "order_001",
    customer_name: "John Doe",
    customer_phone: "555-0123",
    items: [
      {
        menu_id: "1",
        name: "Margherita Pizza",
        quantity: 2,
        price: 12.99
      }
    ],
    total: 25.98,
    status: "preparing",
    order_time: new Date("2025-08-15T18:30:00Z")
  },
  {
    _id: "order_002", 
    customer_name: "Jane Smith",
    customer_phone: "555-0456",
    items: [
      {
        menu_id: "2",
        name: "Chicken Burger", 
        quantity: 1,
        price: 8.99
      },
      {
        menu_id: "3",
        name: "Caesar Salad",
        quantity: 1, 
        price: 6.50
      }
    ],
    total: 15.49,
    status: "delivered",
    order_time: new Date("2025-08-19T17:15:00Z")
  }
];

const setupDatabase = async () => {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('restaurant2_db');
    await db.collection('menu').insertMany(menu_data);
    console.log('Menu items inserted');
    await db.collection('orders').insertMany(orders_data);
    console.log('Orders inserted');
    console.log(`Database setup complete!`);
    await client.close();
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};
setupDatabase();