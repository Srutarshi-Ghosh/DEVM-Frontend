import { ethers } from "ethers";
import votingAbi from "./votingABI";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const address = "0x49a742d36748bF2303904cBde49523873652Af44";

export const votingContract = new ethers.Contract(address, votingAbi, provider);

export async function totalVotes() {
  return await votingContract.totalVoters();
}

export async function checkVerified(address) {
  return await votingContract.voters(address);
}
