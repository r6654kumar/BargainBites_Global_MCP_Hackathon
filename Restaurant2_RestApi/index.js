import express from "express";
// import { MongoClient } from "mongodb";
import {Client} from "pg";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/order.js";
import offerRoutes from "./routes/offer.js"
const app = express();
app.use(express.json());
dotenv.config();
const PORT= process.env.PORT || 3002; //3002 for Restaurant 2 API
const connectionString= process.env.PG_CONNECTION_STRING; 
const client = new Client({ connectionString });
// Connect to Postgress DB
async function connectDB() {
    try {
        await client.connect();
        // const db = client.db("restaurant2_db");
        console.log("Connect to Restaurant2_RestAPI Databse");
        // return db;
    }
    catch (err) {
        console.log("Unable to connect to Postgress Database", err);
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

app.get("/", async(req,res)=>{
    res.send("Server for Restaurant 2 running.........")
})