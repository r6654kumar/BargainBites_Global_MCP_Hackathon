import axios from "axios";
export const placeOrder = async (orderDetails) => {
    try {
        const res = await axios.post(
            "https://bargainbites-global-mcp-hackathon.onrender.com/order",
            orderDetails,
            { headers: { 'x-restaurant-id': 'restaurant1' } }
        );
        return res.data;
    } catch (err) {
        console.log("Failed to place order", err);
    }
};

export const trackOrder = async (orderId) => {
    try {
        const res = await axios.get(
            `https://bargainbites-global-mcp-hackathon.onrender.com/order/${orderId}`,
            { headers: { 'x-restaurant-id': 'restaurant1' } }
        )
        if (res && res.data)
            return res.data;
        else {
            console.log("Please try again later");
        }
    } catch (err) {
        console.log(err);
    }
}
