// import { callMCPTool } from "./restaurant2_mcpToolsWrapper.js";
// import { callA2AAgent } from "./agent.js";
// import { tool } from "@langchain/core/tools";
// import { z } from "zod";

// const listBestOffersTool = tool(
//     async () => {
//         const offersR2 = await callMCPTool("restaurant2_explore_offers", {});
//         const offersR1Text = await callA2AAgent("Show me all available offers");
//         let offersR1 = [];
//         try {
//             const parsed = JSON.parse(offersR1Text);
//             offersR1 = parsed.offers || [];
//         } catch (err) {
//             console.warn("[Aggregator] Could not parse Restaurant1 offers:", offersR1Text);
//         }
//         const allOffers = [...offersR1, ...(offersR2.offers ?? [])];
//         const sorted = allOffers.sort((a, b) => (b.discount || 0) - (a.discount || 0));
//         return sorted.slice(0, 3);
//     },
//     {
//         name: "list_best_offers",
//         description: "Compare and return best offers across restaurants",
//         schema: z.object({})
//     }
// );
// console.log(listBestOffersTool);