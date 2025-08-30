import axios from "axios";
export const getMenu = async()=>{
    try{
        const res = await axios.get("https://bargainbites-global-mcp-hackathon.onrender.com/menu",
            { headers: { 'x-restaurant-id': 'restaurant1' } }
        );
        if(res && res.data)
            return res.data;
        else
            console.log("Menu Empty, Please try again later");
    }catch(err){
        console.log("An error occured", err);
    }
}