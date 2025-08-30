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
function getClient(req) {
    return req.headers['x-restaurant-id'] === 'restaurant1' ? restaurant1_client : restaurant2_client;
}

//Changed to routes (using express router) --30/08
app.use("/menu", (req, res, next) => {
    const client = getClient(req);
    menuRoutes(client)(req, res, next);
});

app.use("/order", (req, res, next) => {
    const client = getClient(req);
    orderRoutes(client)(req, res, next);
});

app.use("/offers", (req, res, next) => {
    const client = getClient(req);
    offerRoutes(client)(req, res, next);
});


//
app.listen(PORT, async () => {
    await connectDB();
    console.log("Restaurant API is running on PORT", PORT);
})

app.get("/", async (req, res) => {
    res.send("Server for Restaurant  running.........")
})