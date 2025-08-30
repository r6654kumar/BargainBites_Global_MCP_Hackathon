import { getMenu } from "./menuService.js";
import { getAllOfferDetails, getOfferDetailsById } from "./offerService.js";
import { placeOrder, trackOrder} from "./orderService.js";
const testMenu = async () => {
    const menu = await getMenu();
    console.log("Menu fetched:", menu);
};
const testOffers = async () => {
    const menu = await getAllOfferDetails();
    console.log("Menu fetched:", menu);
};
const testOffersById = async () => {
    const menu = await getOfferDetailsById("offer_003");
    console.log("Menu fetched:", menu);
};
const testPlaceMenu = async () => {
    const order = {

        "quantity": 5,
        "item_name": "Margherita Pizza",
        "customer_name": "TestTest",
        "customer_phone": "987654"
    }
    const res = await placeOrder(order);
    console.log(res); 
}
const testOrderStatus = async () => {
    const res = await trackOrder("order_72YERn");
    console.log(res); 
}
testMenu();
// testOffers();
// testOffersById();
// testPlaceMenu();
// testOrderStatus();
