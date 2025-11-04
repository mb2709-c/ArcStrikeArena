const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ArcStrikeArena contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const ArcStrikeArena = await ethers.getContractFactory("ArcStrikeArena");
  const arena = await ArcStrikeArena.deploy();
  await arena.waitForDeployment();

  const address = await arena.getAddress();
  console.log("ArcStrikeArena deployed to:", address);

  // Verify constants
  const minStake = await arena.MIN_STAKE();
  const minDuration = await arena.MIN_DURATION();
  const maxDuration = await arena.MAX_DURATION();

  console.log("\nContract Constants:");
  console.log("MIN_STAKE:", ethers.formatEther(minStake), "ETH");
  console.log("MIN_DURATION:", minDuration.toString(), "seconds");
  console.log("MAX_DURATION:", maxDuration.toString(), "seconds");

  console.log("\n✅ Deployment successful!");
  console.log("\nNext steps:");
  console.log("1. Update frontend/src/constants/contracts.ts with the deployed address");
  console.log("2. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
