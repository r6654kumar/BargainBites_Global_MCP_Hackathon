import express from "express";
const router = express.Router();
router.get("/", async (req, res) => {
    try {
        // const menuItem = await client.db("restaurant2_db").collection('menu').find({ available: true }).toArray();
        const client = req.dbClient;
        const query = `SELECT * FROM menu WHERE available = true`;
        const menuItems = await client.query(query);

        res.json({
            "success": true,
            menuItems: menuItems.rows
        })
    } catch (err) {
        console.log("Failed to load menu", err.toString());
        res.status(500).json({
            "success": false,
            "message": "Unable to load menu right now, Please try again later"
        })
    }
})
export default router;
