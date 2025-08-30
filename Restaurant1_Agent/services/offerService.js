import axios from "axios";
export const getAllOfferDetails = async () => {
    try {
        const res = await axios.get("https://bargainbites-global-mcp-hackathon.onrender.com/offers",
            { headers: { 'x-restaurant-id': 'restaurant1' } }
        );
        if (res && res.data)
            return res.data;
        console.log("No offers as of now, please try again after some times");
    } catch (err) {
        console.log("Failed to fetch offer details", err);
    }
}
export const getOfferDetailsById = async (id) => {
    try {
        const res = await axios.get(
            `https://bargainbites-global-mcp-hackathon.onrender.com/offers/${id}`,
            { headers: { 'x-restaurant-id': 'restaurant1' } }
        );
        if (res && res.data) return res.data;
        console.log(`No offer found for id ${id}`);
    } catch (err) {
        console.log(`Failed to fetch offer ${id}`, err);
    }
};
