const hre = require("hardhat");

async function main() {
  console.log("⚔️  Creating one test duel...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 From:", deployer.address);

  const fs = require("fs");
  const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  console.log("📋 Contract:", contractAddress, "\n");

  const ArcStrikeArena = await hre.ethers.getContractFactory("ArcStrikeArena");
  const contract = ArcStrikeArena.attach(contractAddress);

  const duelId = "ARC-511";
  const fighterA = "Shadow Blade";
  const fighterB = "Lightning Fist";
  const stakeAmount = hre.ethers.parseEther("0.01");
  const duration = 45 * 24 * 60 * 60; // 45 days

  console.log("Creating duel:", duelId);
  console.log("  Fighter A:", fighterA);
  console.log("  Fighter B:", fighterB);
  console.log("  Stake:", hre.ethers.formatEther(stakeAmount), "ETH");
  console.log("  Duration: 45 days\n");

  try {
    const tx = await contract.createReplicaDuel(
      duelId,
      fighterA,
      fighterB,
      stakeAmount,
      duration
    );

    console.log("✅ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString());
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().then(() => process.exit(0)).catch(console.error);
