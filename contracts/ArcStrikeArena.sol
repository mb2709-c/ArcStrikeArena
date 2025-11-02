// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Arc Strike Arena (simplified)
 * @notice Minimal duel contract aligned with the current frontend – stores encrypted handles without fhEVM ops.
 */
contract ArcStrikeArena {
    struct Duel {
        string duelId;
        string fighterA;
        string fighterB;
        uint256 stakeAmount;
        uint256 deadline;
        uint256 prizePool;
        bool cancelled;
        bool settled;
        uint8 winningSide; // 0 draw, 1 fighterA, 2 fighterB
        uint256 supportersA;
        uint256 supportersB;
    }

    struct Bet {
        uint8 side;
        bool claimed;
        bool exists;
        bytes32 weightCipher;
        bytes proof;
    }

    uint256 public constant MIN_STAKE = 0.01 ether;
    uint256 public constant MIN_DURATION = 15 minutes;
    uint256 public constant MAX_DURATION = 120 days;

    mapping(string => Duel) private duels;
    mapping(string => mapping(address => Bet)) private bets;
    string[] private duelIds;

    event DuelCreated(string indexed duelId, uint256 stakeAmount, uint256 deadline);
    event BetPlaced(string indexed duelId, address indexed bettor, uint8 side, bytes32 handle);
    event DuelSettled(string indexed duelId, uint8 winningSide);
    event DuelCancelled(string indexed duelId);
    event PrizeClaimed(string indexed duelId, address indexed winner, uint256 amount);
    event RefundClaimed(string indexed duelId, address indexed user, uint256 amount);

    error DuelExists();
    error DuelMissing();
    error InvalidStake();
    error InvalidSide();
    error BettingClosed();
    error AlreadyBet();
    error AlreadySettled();
    error NotSettled();
    error NotWinner();
    error AlreadyClaimed();
    error NotRefundable();
    error Locked();

    /** -------------------- Creation -------------------- */

    function createReplicaDuel(
        string memory duelId,
        string memory fighterA,
        string memory fighterB,
        uint256 stakeAmount,
        uint256 duration
    ) external {
        if (duels[duelId].deadline != 0) revert DuelExists();
        if (stakeAmount < MIN_STAKE) revert InvalidStake();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidStake();

        Duel storage duel = duels[duelId];
        duel.duelId = duelId;
        duel.fighterA = fighterA;
        duel.fighterB = fighterB;
        duel.stakeAmount = stakeAmount;
        duel.deadline = block.timestamp + duration;

        duelIds.push(duelId);
        emit DuelCreated(duelId, stakeAmount, duel.deadline);
    }

    /** -------------------- Betting -------------------- */

    function placeReplicaBet(
        string memory duelId,
        uint8 side,
        bytes32 encryptedSkill,
        bytes calldata inputProof
    ) external payable {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();
        if (duel.cancelled) revert AlreadySettled();
        if (block.timestamp >= duel.deadline) revert BettingClosed();
        if (msg.value != duel.stakeAmount) revert InvalidStake();
        if (side < 1 || side > 2) revert InvalidSide();

        Bet storage bet = bets[duelId][msg.sender];
        if (bet.exists) revert AlreadyBet();

        bet.side = side;
        bet.claimed = false;
        bet.exists = true;
        bet.weightCipher = encryptedSkill;
        bet.proof = inputProof;

        duel.prizePool += msg.value;
        if (side == 1) {
            duel.supportersA += 1;
        } else {
            duel.supportersB += 1;
        }

        emit BetPlaced(duelId, msg.sender, side, encryptedSkill);
    }

    /** -------------------- Settlement -------------------- */

    function settleReplicaDuel(string memory duelId) external {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();
        if (duel.cancelled) revert Locked();
        if (duel.settled) revert AlreadySettled();
        if (block.timestamp < duel.deadline) revert Locked();

        bytes32 rand = keccak256(abi.encode(blockhash(block.number - 1), duelId));
        duel.winningSide = uint8(uint256(rand) % 3);
        duel.settled = true;

        emit DuelSettled(duelId, duel.winningSide);
    }

    function cancelReplicaDuel(string memory duelId) external {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();
        if (duel.settled) revert AlreadySettled();
        if (block.timestamp < duel.deadline) revert Locked();

        duel.cancelled = true;
        emit DuelCancelled(duelId);
    }

    /** -------------------- Claims -------------------- */

    function claimReplicaPrize(string memory duelId) external {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();
        if (!duel.settled || duel.cancelled) revert NotSettled();
        if (duel.winningSide == 0) revert NotWinner();

        Bet storage bet = bets[duelId][msg.sender];
        if (!bet.exists) revert NotWinner();
        if (bet.side != duel.winningSide) revert NotWinner();
        if (bet.claimed) revert AlreadyClaimed();

        uint256 winnerCount = duel.winningSide == 1 ? duel.supportersA : duel.supportersB;
        require(winnerCount > 0, "No winners");
        uint256 payout = duel.prizePool / winnerCount;

        bet.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: payout }("");
        require(sent, "Transfer failed");

        emit PrizeClaimed(duelId, msg.sender, payout);
    }

    function claimReplicaRefund(string memory duelId) external {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();

        Bet storage bet = bets[duelId][msg.sender];
        if (!bet.exists) revert NotRefundable();
        if (bet.claimed) revert AlreadyClaimed();

        bool refundable = duel.cancelled || (duel.settled && duel.winningSide == 0);
        if (!refundable) revert NotRefundable();

        bet.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: duel.stakeAmount }("");
        require(sent, "Refund failed");

        emit RefundClaimed(duelId, msg.sender, duel.stakeAmount);
    }

    /** -------------------- Views -------------------- */

    function listReplicaDuels() external view returns (string[] memory) {
        return duelIds;
    }

    function getReplicaDuel(string memory duelId)
        external
        view
        returns (
            string memory fighterA,
            string memory fighterB,
            uint256 stakeAmount,
            uint256 deadline,
            uint256 prizePool,
            bool settled,
            bool cancelled,
            uint8 winningSide,
            uint256 supportersA,
            uint256 supportersB
        )
    {
        Duel storage duel = duels[duelId];
        if (duel.deadline == 0) revert DuelMissing();
        return (
            duel.fighterA,
            duel.fighterB,
            duel.stakeAmount,
            duel.deadline,
            duel.prizePool,
            duel.settled,
            duel.cancelled,
            duel.winningSide,
            duel.supportersA,
            duel.supportersB
        );
    }

    function getReplicaBetCipher(string memory duelId, address user) external view returns (bytes32) {
        Bet storage bet = bets[duelId][user];
        require(bet.exists, "Bet not found");
        return bet.weightCipher;
    }

    function getReplicaBetProof(string memory duelId, address user) external view returns (bytes memory) {
        Bet storage bet = bets[duelId][user];
        require(bet.exists, "Bet not found");
        return bet.proof;
    }

    receive() external payable {}
}
