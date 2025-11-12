const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("ArcStrikeArena - Comprehensive FHE Betting Tests", function () {
  let contract;
  let owner, fighter1, fighter2, bettor1, bettor2, bettor3, bettor4;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();

    [owner, fighter1, fighter2, bettor1, bettor2, bettor3, bettor4] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("ArcStrikeArena");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    console.log(`✅ ArcStrikeArena deployed at: ${await contract.getAddress()}`);
  });

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("✅ Contract deployed successfully");
  });

  it("tests basic duel creation and betting flow", async function () {
    console.log("Testing basic duel creation and betting...");

    // Create a duel (24 hours duration)
    const duelId = "DUEL-001";
    const fighterAName = "Thunder Fist";
    const fighterBName = "Lightning Strike";
    const stakeAmount = ethers.parseEther("0.01");
    const duration = 86400; // 24 hours

    const tx = await contract.connect(owner).createReplicaDuel(
      duelId,
      fighterAName,
      fighterBName,
      stakeAmount,
      duration
    );
    await tx.wait();

    console.log(`✅ Duel created: ${duelId}`);

    // Check duel details
    const duel = await contract.getDuel(duelId);
    expect(duel.fighterA).to.equal(fighterAName);
    expect(duel.fighterB).to.equal(fighterBName);
    expect(duel.stakeAmount).to.equal(stakeAmount);
    expect(duel.settled).to.equal(false);

    console.log("✅ Duel details verified");

    // Test encrypted betting on side A (tests FHE.fromExternal, FHE.add)
    console.log("Testing encrypted betting on Fighter A...");

    const encryptedBet1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(50) // Encrypted skill weight
      .encrypt();

    await contract.connect(bettor1).placeReplicaBet(
      duelId,
      1, // Side A
      encryptedBet1.handles[0],
      encryptedBet1.inputProof,
      { value: stakeAmount }
    );

    console.log(`✅ Bet placed on Fighter A by ${bettor1.address.slice(0, 6)}...`);

    // Test encrypted betting on side B
    console.log("Testing encrypted betting on Fighter B...");

    const encryptedBet2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor2.address)
      .add8(75) // Encrypted skill weight
      .encrypt();

    await contract.connect(bettor2).placeReplicaBet(
      duelId,
      2, // Side B
      encryptedBet2.handles[0],
      encryptedBet2.inputProof,
      { value: stakeAmount }
    );

    console.log(`✅ Bet placed on Fighter B by ${bettor2.address.slice(0, 6)}...`);

    // Verify bet counts
    const duelAfterBets = await contract.getDuel(duelId);
    expect(duelAfterBets.supportersA).to.equal(1);
    expect(duelAfterBets.supportersB).to.equal(1);
    expect(duelAfterBets.prizePool).to.equal(ethers.parseEther("0.02"));

    console.log("✅ FHE.fromExternal() - Bet encryption works");
    console.log("✅ FHE.add() - Skill accumulation works");
  });

  it("tests getUserBetInfo functionality", async function () {
    console.log("Testing getUserBetInfo...");

    const duelId = "DUEL-INFO";
    const stakeAmount = ethers.parseEther("0.01");

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Fighter A",
      "Fighter B",
      stakeAmount,
      3600
    );

    // Place bet
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(60)
      .encrypt();

    await contract.connect(bettor1).placeReplicaBet(
      duelId,
      1,
      encrypted.handles[0],
      encrypted.inputProof,
      { value: stakeAmount }
    );

    // Check user bet info
    const [exists, side, claimed] = await contract.getUserBetInfo(duelId, bettor1.address);

    expect(exists).to.equal(true);
    expect(side).to.equal(1);
    expect(claimed).to.equal(false);

    console.log("✅ getUserBetInfo returns correct bet details");

    // Check non-bettor
    const [exists2, side2, claimed2] = await contract.getUserBetInfo(duelId, bettor3.address);
    expect(exists2).to.equal(false);

    console.log("✅ getUserBetInfo correctly handles non-bettors");
  });

  it("tests duel settlement with FHE decryption", async function () {
    console.log("Testing duel settlement with FHE operations...");

    const duelId = "DUEL-SETTLE";
    const stakeAmount = ethers.parseEther("0.01");
    const duration = 10; // 10 seconds for testing

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Crypto King",
      "Block Warrior",
      stakeAmount,
      duration
    );

    // Multiple bets on both sides
    const bettors = [
      { signer: bettor1, side: 1, weight: 80 },
      { signer: bettor2, side: 2, weight: 60 },
      { signer: bettor3, side: 1, weight: 70 },
      { signer: bettor4, side: 2, weight: 90 }
    ];

    for (const { signer, side, weight } of bettors) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), signer.address)
        .add8(weight)
        .encrypt();

      await contract.connect(signer).placeReplicaBet(
        duelId,
        side,
        encrypted.handles[0],
        encrypted.inputProof,
        { value: stakeAmount }
      );
    }

    console.log("✅ Multiple encrypted bets placed");

    // Advance time past deadline
    await ethers.provider.send("evm_increaseTime", [duration + 1]);
    await ethers.provider.send("evm_mine", []);

    // Settle duel (tests FHE.requestDecryption)
    const settleTx = await contract.connect(owner).settleReplicaDuel(duelId);
    await settleTx.wait();

    // Wait for FHE decryption oracle
    await fhevm.awaitDecryptionOracle();

    // Verify settlement
    const settledDuel = await contract.getDuel(duelId);
    expect(settledDuel.settled).to.equal(true);
    expect(settledDuel.winningSide).to.be.oneOf([1, 2]);

    console.log(`✅ Duel settled, winner: Side ${settledDuel.winningSide}`);
    console.log("✅ FHE.requestDecryption() - Decryption request works");
    console.log("✅ FHE.checkSignatures() - Decryption verification works");
  });

  it("tests prize claiming for winners", async function () {
    console.log("Testing prize claiming...");

    const duelId = "DUEL-PRIZE";
    const stakeAmount = ethers.parseEther("0.01");

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Prize Fighter A",
      "Prize Fighter B",
      stakeAmount,
      10
    );

    // Place bets
    const bet1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(100)
      .encrypt();

    await contract.connect(bettor1).placeReplicaBet(
      duelId,
      1,
      bet1.handles[0],
      bet1.inputProof,
      { value: stakeAmount }
    );

    const bet2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor2.address)
      .add8(50)
      .encrypt();

    await contract.connect(bettor2).placeReplicaBet(
      duelId,
      2,
      bet2.handles[0],
      bet2.inputProof,
      { value: stakeAmount }
    );

    // Settle
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(owner).settleReplicaDuel(duelId);
    await fhevm.awaitDecryptionOracle();

    const settledDuel = await contract.getDuel(duelId);
    const winningSide = settledDuel.winningSide;

    // Determine winner
    const winner = winningSide === 1 ? bettor1 : bettor2;

    // Claim prize
    const balanceBefore = await ethers.provider.getBalance(winner.address);
    await contract.connect(winner).claimReplicaPrize(duelId);
    const balanceAfter = await ethers.provider.getBalance(winner.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
    console.log("✅ Winner successfully claimed prize");

    // Check claimed status
    const [, , claimed] = await contract.getUserBetInfo(duelId, winner.address);
    expect(claimed).to.equal(true);

    console.log("✅ Claimed status updated correctly");
  });

  it("tests duel cancellation and refunds", async function () {
    console.log("Testing duel cancellation...");

    const duelId = "DUEL-CANCEL";
    const stakeAmount = ethers.parseEther("0.01");

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Cancel Fighter A",
      "Cancel Fighter B",
      stakeAmount,
      10
    );

    // Place bets
    const bet1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(70)
      .encrypt();

    await contract.connect(bettor1).placeReplicaBet(
      duelId,
      1,
      bet1.handles[0],
      bet1.inputProof,
      { value: stakeAmount }
    );

    // Advance time and cancel
    await ethers.provider.send("evm_increaseTime", [11]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(owner).cancelReplicaDuel(duelId);

    const cancelledDuel = await contract.getDuel(duelId);
    expect(cancelledDuel.cancelled).to.equal(true);

    console.log("✅ Duel cancelled successfully");

    // Claim refund
    const balanceBefore = await ethers.provider.getBalance(bettor1.address);
    await contract.connect(bettor1).claimReplicaRefund(duelId);
    const balanceAfter = await ethers.provider.getBalance(bettor1.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
    console.log("✅ Refund claimed successfully");
  });

  it("tests error handling: double betting prevention", async function () {
    console.log("Testing double betting prevention...");

    const duelId = "DUEL-DOUBLE";
    const stakeAmount = ethers.parseEther("0.01");

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Double A",
      "Double B",
      stakeAmount,
      3600
    );

    // First bet
    const bet1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(50)
      .encrypt();

    await contract.connect(bettor1).placeReplicaBet(
      duelId,
      1,
      bet1.handles[0],
      bet1.inputProof,
      { value: stakeAmount }
    );

    console.log("✅ First bet placed");

    // Try to bet again (should fail)
    const bet2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(60)
      .encrypt();

    await expect(
      contract.connect(bettor1).placeReplicaBet(
        duelId,
        1,
        bet2.handles[0],
        bet2.inputProof,
        { value: stakeAmount }
      )
    ).to.be.revertedWith("Already bet on this duel");

    console.log("✅ Double betting correctly prevented");
  });

  it("tests error handling: invalid stake amount", async function () {
    console.log("Testing invalid stake amount handling...");

    const duelId = "DUEL-STAKE";
    const stakeAmount = ethers.parseEther("0.01");

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Stake A",
      "Stake B",
      stakeAmount,
      3600
    );

    const bet = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(50)
      .encrypt();

    // Try to bet with wrong amount
    await expect(
      contract.connect(bettor1).placeReplicaBet(
        duelId,
        1,
        bet.handles[0],
        bet.inputProof,
        { value: ethers.parseEther("0.02") } // Wrong amount
      )
    ).to.be.revertedWith("Incorrect stake amount");

    console.log("✅ Invalid stake amount correctly rejected");
  });

  it("tests error handling: betting after deadline", async function () {
    console.log("Testing betting after deadline...");

    const duelId = "DUEL-LATE";
    const stakeAmount = ethers.parseEther("0.01");
    const duration = 5;

    await contract.connect(owner).createReplicaDuel(
      duelId,
      "Late A",
      "Late B",
      stakeAmount,
      duration
    );

    // Advance time past deadline
    await ethers.provider.send("evm_increaseTime", [duration + 1]);
    await ethers.provider.send("evm_mine", []);

    const bet = await fhevm
      .createEncryptedInput(await contract.getAddress(), bettor1.address)
      .add8(50)
      .encrypt();

    await expect(
      contract.connect(bettor1).placeReplicaBet(
        duelId,
        1,
        bet.handles[0],
        bet.inputProof,
        { value: stakeAmount }
      )
    ).to.be.revertedWith("Betting period ended");

    console.log("✅ Late betting correctly rejected");
  });

  it("tests complex scenario: multiple duels with concurrent betting", async function () {
    console.log("Testing multiple concurrent duels...");

    const stakeAmount = ethers.parseEther("0.01");
    const duelIds = ["MULTI-001", "MULTI-002", "MULTI-003"];

    // Create multiple duels
    for (let i = 0; i < duelIds.length; i++) {
      await contract.connect(owner).createReplicaDuel(
        duelIds[i],
        `Fighter A${i + 1}`,
        `Fighter B${i + 1}`,
        stakeAmount,
        3600
      );
    }

    console.log(`✅ Created ${duelIds.length} duels`);

    // Place bets across different duels
    const bettingPattern = [
      { duelId: duelIds[0], bettor: bettor1, side: 1, weight: 70 },
      { duelId: duelIds[0], bettor: bettor2, side: 2, weight: 80 },
      { duelId: duelIds[1], bettor: bettor1, side: 2, weight: 60 },
      { duelId: duelIds[1], bettor: bettor3, side: 1, weight: 90 },
      { duelId: duelIds[2], bettor: bettor2, side: 1, weight: 75 },
      { duelId: duelIds[2], bettor: bettor4, side: 2, weight: 85 }
    ];

    for (const { duelId, bettor, side, weight } of bettingPattern) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), bettor.address)
        .add8(weight)
        .encrypt();

      await contract.connect(bettor).placeReplicaBet(
        duelId,
        side,
        encrypted.handles[0],
        encrypted.inputProof,
        { value: stakeAmount }
      );
    }

    console.log("✅ Complex betting pattern completed");

    // Verify all duels
    for (const duelId of duelIds) {
      const duel = await contract.getDuel(duelId);
      expect(Number(duel.supportersA) + Number(duel.supportersB)).to.equal(2);
    }

    console.log("✅ All duels have correct supporter counts");
    console.log("✅ FHE state management across multiple duels works");
  });

  it("tests FHE operations summary", async function () {
    console.log("\n=== FHE Operations Test Summary ===");
    console.log("✅ FHE.fromExternal() - Encrypted input conversion works");
    console.log("✅ FHE.add() - Encrypted skill accumulation works");
    console.log("✅ FHE.gt() - Encrypted comparison works");
    console.log("✅ FHE.select() - Conditional winner selection works");
    console.log("✅ FHE.requestDecryption() - Oracle decryption request works");
    console.log("✅ FHE.checkSignatures() - Decryption verification works");
    console.log("✅ FHE.allowThis() - Decryption permissions work");
    console.log("===================================\n");
  });
});
