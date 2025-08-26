import express from "express";
import { MongoClient } from "mongodb";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import offerRoutes from "./routes/offer.js"
const app = express();
app.use(express.json());
const PORT = 3000;
const client = new MongoClient('mongodb://localhost:27017');
// Connect to MongoDB Database
async function connectDB() {
    try {
        await client.connect();
        // const db = client.db("restaurant2_db");
        console.log("Connect to Restaurant2_RestAPI Databse");
        // return db;
    }
    catch (err) {
        console.log("Unable to connect to MongoDB Database", err);
    }
}


//Changed to routes (using express router) --27/08
app.use("/menu", menuRoutes(client));
app.use("/order", orderRoutes(client));
app.use("/offers", offerRoutes(client));


//
app.listen(PORT, async () => {
    await connectDB();
    console.log("Restaurant2_RestAPI is running on PORT", PORT);
})