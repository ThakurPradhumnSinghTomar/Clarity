import { extractGlobalLeaderBoard } from "../../controllers/extractGlobalLeaderBoard.js";

export async function getGlobalLeaderboard() {
  return extractGlobalLeaderBoard();
}
