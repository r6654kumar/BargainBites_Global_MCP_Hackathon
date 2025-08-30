import express from "express";
// import { MongoClient } from "mongodb";
import { Client } from "pg";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import offerRoutes from "./routes/offer.js"
const app = express();
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT || 3002; //3002 for Restaurant 2 API
// const connectionString= process.env.PG_CONNECTION_STRING;
const restaurant1_client = new Client({ connectionString: process.env.PG_CONNECTION_STRING_R1 });
const restaurant2_client = new Client({ connectionString: process.env.PG_CONNECTION_STRING_R2 });
// const restaurant2_client = new Client({ connectionString });
// Connect to Postgress DB
async function connectDB() {
    try {
        await restaurant2_client.connect();
        // const db = client.db("restaurant2_db");
        console.log("Connected to Restaurant2 Databse");
        // return db;
        if (process.env.PG_CONNECTION_STRING_R1) {
            await restaurant1_client.connect();
            console.log("Connected to Restaurant1 Database");
        }
    }
    catch (err) {
        console.log("Unable to connect to Postgress Database", err);
    }
}

//middleware for getting db connection based on headers....
//if x-restaurant-id is passed db connection pointed to restaurant1, else restaurant2
// Try different header variations
app.use((req, res, next) => {
    const restaurantId = req.headers['x-restaurant-id'] ||
        req.headers['X-Restaurant-Id'] ||
        req.headers['x_restaurant_id'];

    req.dbClient = restaurantId === 'restaurant1' ? restaurant1_client : restaurant2_client;
    req.dbName = restaurantId === 'restaurant1' ? "restaurant1" : "restaurant2";

    console.log(`[DB SELECT] ${req.method} ${req.originalUrl} -> ${req.dbName}`);
    next();
});

//Changed to routes (using express router) --30/08
app.use("/menu", menuRoutes);
app.use("/order", orderRoutes);
app.use("/offers", offerRoutes);


//
app.listen(PORT, async () => {
    await connectDB();
    console.log("Restaurant API is running on PORT", PORT);
})

app.get("/", async (req, res) => {
    res.send("Server for Restaurant  running.........")
})