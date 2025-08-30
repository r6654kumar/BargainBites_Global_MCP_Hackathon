import express from "express";
const router = express.Router();
//route to display all active offers from the restaurant
router.get("/", async (req, res) => {
    // const db = await client.db("restaurant2_db");
    const client = req.dbClient;
    try {
        // const activeOffers = await db.collection("offers").find({ active: true }).toArray();
        const query = `SELECT * from offers where active=true`;
        const response = await client.query(query);
        if (response.rows.length > 0) {
            res.status(200).json({
                "success": true,
                activeOffers: response.rows
            })
        } else {
            res.status(200).send("No active offers present as of now");
        }
    } catch (err) {
        console.log("Failed to fetch offers from the restaurant", err);
    }
})
//Route to retrieve detailed information about a specific offer 
router.get("/:id", async (req, res) => {
    const client = req.dbClient;
    // const db = await client.db("restaurant2_db");
    const offerId = req.params.id;
    try {
        // const response = await db.collection("offers").findOne({
        //     _id: offerId
        // })
        const query = `SELECT * FROM offers WHERE id = $1`;
        const response = await client.query(query, [offerId]);
        if (response.rows.length > 0) {
            // const offer = response.rows[0];
            const offerDetails = {
                offerName: response.rows[0].name,
                offerType: response.rows[0].type,
                offerDescription: response.rows[0].description,
                offerTerms: response.rows[0].terms,
                discount: response.rows[0].discount.value + "%"
            }
            res.status(200).send(offerDetails);
        } else {
            res.send("Failed to fetch offer details, Please try again later..");
        }
    } catch (err) {
        console.log(err);
    }
})
//route to validate an offer---based on customer order  & other routes --TODO ---after confirming whether it can be perfomed by mcp client or not.
// router.get("/validate", async(req,res)=>{ 
// })

export default router;