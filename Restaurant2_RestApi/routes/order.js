import express from "express";
import { nanoid } from "nanoid";
const router = express.Router();
router.post("/", async (req, res) => {
    // const db = client.db("restaurant2_db");
    const client = req.dbClient;
    const { customer_name, customer_phone, item_name, quantity } = req.body;
    console.log("Incoming order request:", { customer_name, customer_phone, item_name, quantity });
    // const item = await db.collection('menu').findOne({
    //     name: new RegExp(`^${item_name}$`, 'i'),
    //     available: true
    // });
    const query = `SELECT * FROM menu WHERE name ILIKE $1 AND available = true LIMIT 1`;

    const values = [item_name];
    const { rows } = await client.query(query, values);

    const item = rows[0] || null;


    if (!item) {
        console.log("Stopped Here");
        return res.status(400).json({
            error: "Item is currently not available"
        });
    }

    const orderId = `order_${nanoid(6)}`;
    const orderTime = new Date().toISOString();
    const totalPrice = item.price * quantity;
    const order = {
        id: orderId,
        customer_name,
        customer_phone,
        items: [
            {
                menu_id: item.id,
                name: item.name,
                quantity,
                price: item.price,
                total: item.price * quantity
            }
        ],
        total: totalPrice,
        status: "order_placed",
        order_time: orderTime
    };

    // await db.collection('orders').insertOne(order);
    const query1 = `
            INSERT INTO orders (id, customer_name, customer_phone, items, total, status, order_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `;

    const valuesToAdd = [
        order.id,
        order.customer_name,
        order.customer_phone,
        JSON.stringify(order.items),
        order.total,
        order.status,
        order.order_time
    ];

    const { rows: inserted } = await client.query(query1, valuesToAdd);

    // console.log("Inserted order:", rows[0]);

    res.status(201).json({ message: "Order placed successfully", order_id: orderId });
});
//Route to find status of an order : TO IMPLEMENT..............//25/08
router.get("/:id", async (req, res) => {
    const client = req.dbClient;
    const orderId = req.params.id;
    // console.log(orderId)
    // const db = client.db("restaurant2_db");
    try {
        const query = `SELECT * FROM orders WHERE id = $1`
        const { rows } = await client.query(query, [orderId])
        if (rows.length > 0) {
            res.status(200).send({ status: rows[0].status });
        } else {
            res.status(400).send("Order with provided id not found");
        }
    } catch (err) {
        console.log(err);
    }
})
//Superadmin Route : To update the tracking status of an order in the Database //26/08

router.post("/:id/update", async (req, res) => {
    const client = req.dbClient;
    const orderId = req.params.id;
    // const db = client.db("restaurant2_db");
    const { updatedStatus } = req.body;
    try {
        const query = `SELECT * FROM orders WHERE id = $1`
        const { rows } = await client.query(query, [orderId])
        if (!rows)
            res.status(400).send("Order with specific id does not exists")
        // await db.collection("orders").updateOne(
        //     { _id: orderId },
        //     { $set: { status: updatedStatus } }
        // )
        // console.log(updatedStatus);
        // console.log(response);
        const updateQuery = `
                UPDATE orders
                SET status = $1
                WHERE id = $2
                RETURNING *;
                `;
        const values = [updatedStatus, orderId];
        // const updatedOrder = await db.collection("orders").findOne({
        //     _id: orderId
        // });
        const result = await client.query(updateQuery, values);
        const updatedOrder = result.rows[0];
        res.status(200).json(updatedOrder.status);
    } catch (err) {
        res.send("Failed");
        console.log(err);
    }
})
export default router;