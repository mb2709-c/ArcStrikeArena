/**
 * Create sample PvP duels for testing
 * Run after deploying the ArcStrikeArena contract
 */

const hre = require("hardhat");

async function main() {
  console.log("⚔️  Creating sample PvP duels...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Creating from address:", deployer.address);

  // Read deployment info
  const fs = require("fs");
  let contractAddress;

  try {
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log("📋 Using contract at:", contractAddress, "\n");
  } catch (error) {
    console.error("❌ Could not read deployment-info.json");
    console.error("   Please run deploy.cjs first\n");
    process.exit(1);
  }

  const ArcStrikeArena = await hre.ethers.getContractFactory("ArcStrikeArena");
  const contract = ArcStrikeArena.attach(contractAddress);

  // Sample duels to create (with 30+ days duration)
  const duels = [
    {
      duelId: "duel-dragon-vs-phoenix",
      fighterA: "Dragon Slayer",
      fighterB: "Phoenix Rising",
      stakeAmount: "0.01",
      duration: 45 * 24 * 60 * 60 // 45 days
    },
    {
      duelId: "duel-shadow-vs-light",
      fighterA: "Shadow Assassin",
      fighterB: "Light Guardian",
      stakeAmount: "0.015",
      duration: 60 * 24 * 60 * 60 // 60 days
    },
    {
      duelId: "duel-storm-vs-earth",
      fighterA: "Storm Mage",
      fighterB: "Earth Titan",
      stakeAmount: "0.02",
      duration: 90 * 24 * 60 * 60 // 90 days
    },
    {
      duelId: "duel-fire-vs-ice",
      fighterA: "Inferno Knight",
      fighterB: "Frost Queen",
      stakeAmount: "0.01",
      duration: 30 * 24 * 60 * 60 // 30 days
    },
    {
      duelId: "duel-thunder-vs-wind",
      fighterA: "Thunder God",
      fighterB: "Wind Spirit",
      stakeAmount: "0.025",
      duration: 120 * 24 * 60 * 60 // 120 days (4 months)
    }
  ];

  console.log(`Creating ${duels.length} PvP duels...\n`);

  for (let i = 0; i < duels.length; i++) {
    const duel = duels[i];

    try {
      console.log(`[${i + 1}/${duels.length}] Creating: ${duel.fighterA} vs ${duel.fighterB}`);
      console.log(`   Duel ID: ${duel.duelId}`);
      console.log(`   Stake Amount: ${duel.stakeAmount} ETH`);
      console.log(`   Duration: ${duel.duration / (24 * 60 * 60)} days`);

      const tx = await contract.createReplicaDuel(
        duel.duelId,
        duel.fighterA,
        duel.fighterB,
        hre.ethers.parseEther(duel.stakeAmount),
        duel.duration
      );

      console.log(`   Transaction: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Duel created successfully\n`);
    } catch (error) {
      console.error(`   ❌ Failed to create duel: ${error.message}\n`);
    }
  }

  console.log("✨ All duels created successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Total Duels: ${duels.length}`);
  console.log(`   Contract: ${contractAddress}`);
  console.log("\n🔗 You can now test the frontend with these sample duels\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
