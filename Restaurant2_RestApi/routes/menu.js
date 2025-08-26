import express from "express";
const router = express.Router();
export default (client) => {
    router.get("/", async (req, res) => {
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
    return router;
}