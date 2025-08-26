import express from "express";
const router = express.Router();
export default(client)=>{
    router.get("/", async(req,res)=>{
        res.send("Hii from Offers API route")
    })
    return router;
}