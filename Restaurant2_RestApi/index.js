import express from "express";
import { MongoClient } from "mongodb";
import { nanoid } from "nanoid";
import { json } from "stream/consumers";
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
//
app.listen(PORT, async () => {
    await connectDB();
    console.log("Restaurant2_RestAPI is running on PORT", PORT);
})
//Route to get all menu items
app.get("/menu", async (req, res) => {
    try {
        const menuItem = await client.db("restaurant2_db").collection('menu').find({ available: true }).toArray();
        res.json({
            "success": true,
            menuItem
        })
    } catch (err) {
        console.log("Failed to load menu", err.toString());
        res.status(500).json({
            "success": false,
            "message": "Unable to load menu right now, Please try again later"
        })
    }
})

//Route to order a food item

app.post("/order", async (req, res) => {
    const db = client.db("restaurant2_db");

    const { customer_name, customer_phone, item_name, quantity } = req.body;
    console.log("Incoming order request:", { customer_name, customer_phone, item_name, quantity });
    const item = await db.collection('menu').findOne({
        name: new RegExp(`^${item_name}$`, 'i'),
        available: true
    });

    if (!item) {
        console.log("Stopped Here");
        return res.status(400).json({
            error: "Item is currently not available"
        });
    }

    const orderId = `order_${nanoid(6)}`;
    const orderTime = new Date().toISOString();

    const order = {
        _id: orderId,
        customer_name,
        customer_phone,
        items: [
            {
                menu_id: item._id,
                name: item.name,
                quantity,
                price: item.price,
                total: item.price * quantity
            }
        ],
        status: "order_placed",
        order_time: orderTime
    };

    await db.collection('orders').insertOne(order);

    res.status(201).json({ message: "Order placed successfully", order_id: orderId });
});

//Route to find status of an order : TO IMPLEMENT..............//25/08
app.get("/order/:id", async (req, res) => {
    const orderId = req.params.id;
    // console.log(orderId)
    const db = client.db("restaurant2_db");
    let response;
    try {
        response = await db.collection("orders").findOne({
            _id: orderId
        })
        if (response) {
            res.status(201).send(JSON.stringify(response.status));
        } else {
            res.status(400).send("Order with provided id not found");
        }
    } catch (err) {
        console.log(err);
    }
})

//Superadmin Route : To update the tracking status of an order in the Database //26/08

app.post("/order/:id/update", async (req, res) => {
    const orderId = req.params.id;
    const db = client.db("restaurant2_db");
    const { updatedStatus } = req.body;
    let response;
    try {
        response = await db.collection("orders").findOne({
            _id: orderId
        })
        if (!response)
            res.status(400).send("Order with specific id does not exists")
        await db.collection("orders").updateOne(
            { _id: orderId },  
            { $set: { status: updatedStatus } }
        )
        // console.log(updatedStatus);
        // console.log(response);
         const updatedOrder = await db.collection("orders").findOne({
            _id: orderId
        });
        res.status(200).send(JSON.stringify(updatedOrder.status));
    } catch (err) {
        console.log(err);
    }
})