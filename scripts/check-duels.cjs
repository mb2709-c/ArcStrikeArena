const hre = require("hardhat");

async function main() {
  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("📋 Checking duels at:", contractAddress, "\n");
  
  const ArcStrikeArena = await hre.ethers.getContractFactory("ArcStrikeArena");
  const contract = ArcStrikeArena.attach(contractAddress);
  
  try {
    const duelIds = await contract.listReplicaDuels();
    console.log("✅ Found", duelIds.length, "duels:");
    
    for (const id of duelIds) {
      console.log("\n  Duel ID:", id);
      const duel = await contract.getReplicaDuel(id);
      console.log("    Fighter A:", duel.fighterA);
      console.log("    Fighter B:", duel.fighterB);
      console.log("    Stake:", hre.ethers.formatEther(duel.stakeAmount), "ETH");
      console.log("    Prize Pool:", hre.ethers.formatEther(duel.prizePool), "ETH");
      console.log("    Deadline:", new Date(Number(duel.deadline) * 1000).toLocaleString());
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().then(() => process.exit(0)).catch(console.error);
