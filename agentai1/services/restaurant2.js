import axios from 'axios';

const BASE_URL = 'https://server.smithery.ai/@r6654kumar/bargainbites_restaurant2_mcp/mcp?api_key=a9548cd5-738c-4f4e-857a-f39b12d0dcfb&profile=frightened-deer-4TWnCW';

export async function getMenuFromRestaurant2(food) {
  const res = await axios.get(`${BASE_URL}/mcp/menu?item=${food}`);
  return {
    source: 'res2',
    price: res.data.price,
    offer: res.data.offer || 'No offer'
  };
}

export async function placeOrderRestaurant2(orderDetails) {
  const res = await axios.post(`${BASE_URL}/mcp/order`, orderDetails);
  return res.data;
}
