/**
 * Deploy script for ArcStrikeArena contract
 * Uses Zama fhEVM 0.8.0 on Sepolia testnet
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ArcStrikeArena contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const ArcStrikeArena = await hre.ethers.getContractFactory("ArcStrikeArena");
  const contract = await ArcStrikeArena.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ ArcStrikeArena deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   Network:", hre.network.name);
  console.log("   Deployer:", deployer.address);
  console.log("   Contract Address:", address);

  console.log("\n🔗 Update your frontend:");
  console.log(`   File: frontend/src/constants/contracts.ts`);
  console.log(`   Change ARC_STRIKE_ARENA_ADDRESS to: "${address}"\n`);

  console.log("🔍 Verify on Etherscan (wait ~1 minute, then run):");
  console.log(`   npx hardhat verify --network sepolia ${address}\n`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to deployment-info.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
