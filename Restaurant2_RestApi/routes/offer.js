import express from "express";
const router = express.Router();
export default (client) => {
    //route to display all active offers from the restaurant
    router.get("/", async (req, res) => {
        const db = await client.db("restaurant2_db");
        try {
            const activeOffers = await db.collection("offers").find({ active: true }).toArray();
            if (activeOffers) {
                res.status(200).json({
                    "success": true,
                    activeOffers,
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
        const db = await client.db("restaurant2_db");
        const offerId = req.params.id;
        try {
            const response = await db.collection("offers").findOne({
                _id: offerId
            })
            if (response) {
                const offerDetails = {
                    offerName: response.name,
                    offerType: response.type,
                    offerDescription: response.description,
                    offerTerms: response.terms,
                    discount: response.discount.value + "%"
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
    return router;
}