# Arc Strike Arena

Arc Strike Arena is a privacy-preserving PvP betting platform. Supporters bet on fighters in duels and submit encrypted "skill weights" for their chosen side. Only encrypted cumulative weights are stored on-chain. After the duel ends and FHE decryption is initiated, both sides' total weights are revealed to fairly determine the winner.

## Core Workflow

1. **Create Duel**: Organizer sets `stakeAmount`, duration, and fighter names, initializing `weightA/B` encrypted accumulators.
2. **Place Bet**: Users pay `stakeAmount` and upload encrypted `euint64` skill weight via FHE SDK. The contract adds the ciphertext to the corresponding fighter while recording the bettor.
3. **Reveal**: After deadline, creator calls `requestReplicaReveal`. The FHE gateway returns plaintext total weights for both sides. Winner is the side with higher weight (tie if equal).
4. **Claim Prize/Refund**: Winning supporters share the prize pool equally. If duel is cancelled or tied, all participants can claim refunds.

## Key Contract Interfaces

- `createReplicaDuel(duelId, fighterA, fighterB, stake, duration)`
- `placeReplicaBet(duelId, side, encryptedSkill, proof)`
- `requestReplicaReveal(duelId)` / `finalizeReplicaReveal(requestId, cleartexts, proof)`
- `claimReplicaPrize(duelId)` / `claimReplicaRefund(duelId)`
- `getReplicaBetCipher(duelId, user)` - Convenient for frontend to display user's ciphertext handle

## Deployment & Integration

- Reuses existing Hardhat configuration and `@fhevm/solidity` dependencies in the repository.
- Frontend must use FHE SDK to generate encrypted skill values and attach `bytes proof` when betting.
- Fixed `stakeAmount` ensures equal payout distribution. For proportional distribution based on weights, extend to decrypt individual weights or introduce additional proofs.

## Tech Stack

**Smart Contracts:**
- Solidity with Zama fhEVM 0.5.0
- Fully Homomorphic Encryption for private skill weights
- Deployed on Sepolia testnet

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Wagmi + RainbowKit for wallet connectivity
- Zama FHE SDK 0.3.0-5 for encryption
- Tailwind CSS + shadcn/ui for styling
- Linear-inspired minimalist design

## Project Structure

```
ArcStrikeArena/
├── contracts/              # Solidity smart contracts
│   └── ArcStrikeArena.sol # Main duel contract with FHE
├── scripts/                # Deployment and testing scripts
│   ├── deploy.js          # Contract deployment
│   └── create-native.js   # Create test duels
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Contract interaction hooks
│   │   ├── lib/          # FHE SDK integration
│   │   ├── store/        # State management
│   │   └── views/        # Page views
│   └── public/
└── test/                  # Contract tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

### Deploy Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/deploy.js --network sepolia

# Create test duels
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/create-native.js --network sepolia
```

### Run Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5189 in your browser.

## Testing

```bash
# Run contract tests
npm test

# Run frontend type check
cd frontend && npm run type-check

# Build for production
cd frontend && npm run build
```

## Features

✅ **Privacy-Preserving Betting** - Encrypted skill weights using Zama FHE
✅ **Fair Reveal** - On-chain decryption via FHE gateway
✅ **Equal Prize Distribution** - Winning supporters share prize pool
✅ **Refund Mechanism** - Cancelled or tied duels allow refunds
✅ **Real-time Updates** - Contract event monitoring
✅ **Wallet Integration** - MetaMask, WalletConnect, Coinbase Wallet support

## Contract Address

**Sepolia Testnet:**
- ArcStrikeArena: `0x0c6bf68f0CC59F0FBb93b7F51fA8caC756e04ABD`

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with [Zama fhEVM](https://docs.zama.ai/fhevm) - Fully Homomorphic Encryption on Ethereum
