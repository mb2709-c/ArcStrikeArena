# ⚔️ Arc Strike Arena

<div align="center">

**A Privacy-Preserving PvP Betting Platform powered by Fully Homomorphic Encryption**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://docs.soliditylang.org/)
[![Zama fhEVM](https://img.shields.io/badge/Zama-fhEVM%200.5.0-purple.svg)](https://docs.zama.ai/fhevm)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)](https://www.typescriptlang.org/)

[Demo](#demo) • [Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Betting Mechanism](#betting-mechanism)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contract Addresses](#contract-addresses)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Arc Strike Arena is a groundbreaking **privacy-preserving betting platform** where users can bet on virtual fighter duels without revealing their betting strategies. Using **Zama's Fully Homomorphic Encryption (FHE)** technology, all bet weights remain encrypted on-chain until the duel concludes, ensuring complete fairness and preventing any form of manipulation.

### Why Arc Strike Arena?

Traditional betting platforms face several challenges:
- **Front-running**: Whales can see and copy winning strategies
- **Manipulation**: Large bets can influence others' decisions
- **Privacy**: Betting patterns reveal user strategies

Arc Strike Arena solves these problems by:
- ✅ **Encrypting all bet weights** on-chain using FHE
- ✅ **Preventing strategy leakage** until duel completion
- ✅ **Ensuring fair settlement** through cryptographic proofs
- ✅ **Supporting multiple concurrent duels** with isolated state

---

## ✨ Key Features

### 🔐 Privacy-First Design
- **Encrypted Betting**: All skill weights encrypted using Zama FHE
- **On-chain Privacy**: Encrypted values never leave the blockchain
- **Zero Information Leakage**: Cumulative weights remain hidden until reveal

### ⚖️ Fair & Transparent
- **Cryptographic Fairness**: FHE ensures no one can manipulate results
- **Transparent Settlement**: Decryption happens on-chain via Zama's gateway
- **Equal Prize Distribution**: Winners share the prize pool equally

### 🎮 User-Friendly Experience
- **Real-time Updates**: Live countdown timers and bet tracking
- **Multi-Wallet Support**: MetaMask, WalletConnect, Coinbase Wallet
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Transaction Tracking**: Real-time status updates with Etherscan links

### 🛡️ Robust & Secure
- **Comprehensive Testing**: Full test coverage for contracts and frontend
- **Error Handling**: Graceful recovery from network failures
- **Access Control**: Protected admin functions and refund mechanisms
- **Double-betting Prevention**: Contract-level safeguards

---

## 🔄 How It Works

### 1️⃣ Duel Creation
An organizer creates a duel with:
- **Duel ID**: Unique identifier (e.g., "ARC-001")
- **Fighter Names**: Two competing fighters (e.g., "Thunder Fist" vs "Lightning Strike")
- **Stake Amount**: Fixed bet amount (e.g., 0.01 ETH)
- **Duration**: Betting period (e.g., 24 hours)

```solidity
createReplicaDuel("ARC-001", "Thunder Fist", "Lightning Strike", 0.01 ether, 86400);
```

### 2️⃣ Encrypted Betting
Users bet on their chosen fighter by:
1. **Selecting a fighter** (Side A or Side B)
2. **Entering a skill weight** (1-100) representing their confidence
3. **Encrypting the weight** using Zama FHE SDK
4. **Submitting the encrypted bet** with the stake amount

```javascript
// Frontend: Encrypt skill weight
const encrypted = await fhe.encrypt(skillWeight);
// Submit to contract
await contract.placeReplicaBet(duelId, side, encrypted.handle, encrypted.proof, { value: stakeAmount });
```

The contract accumulates encrypted weights:
- **Fighter A**: `encryptedWeightA = ∑(encrypted weights from A supporters)`
- **Fighter B**: `encryptedWeightB = ∑(encrypted weights from B supporters)`

### 3️⃣ Duel Settlement
After the betting period ends:
1. Anyone calls `settleReplicaDuel(duelId)`
2. Contract requests FHE decryption from Zama's gateway
3. Gateway decrypts both cumulative weights
4. Winner determined: `winningSide = (weightA > weightB) ? 1 : 2`
5. If tie: `winningSide = 0` (all bets refundable)

### 4️⃣ Prize Distribution
- **Winners**: Share prize pool equally (`prizePool / numWinners`)
- **Losers**: No refund
- **Draw**: Everyone gets their stake back
- **Cancelled**: All participants get refunds

---

## 💰 Betting Mechanism

### Skill Weight System

Each bet includes a **skill weight** (1-100) that represents the bettor's confidence:
- **Low weight (1-30)**: Low confidence, minimal contribution
- **Medium weight (31-70)**: Moderate confidence, standard contribution
- **High weight (71-100)**: High confidence, maximum contribution

**Important**: Skill weights are **encrypted** and **never revealed individually**. Only the cumulative weight determines the winner.

### Prize Pool Calculation

```
Prize Pool = (Number of Bettors) × (Stake Amount)
Winner's Share = Prize Pool ÷ (Number of Winners)
```

**Example**:
- Stake: 0.01 ETH
- Total bettors: 10 (6 on Fighter A, 4 on Fighter B)
- Prize pool: 0.1 ETH
- Fighter A wins
- Each of 6 winners receives: 0.1 ÷ 6 = 0.0166 ETH

### Refund Conditions

Users can claim refunds when:
1. **Duel cancelled**: Admin cancels the duel (technical issues, etc.)
2. **Draw outcome**: Both fighters have equal cumulative weights
3. **No settlement**: Duel expired but not settled (emergency fallback)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (MetaMask)    │
└────────┬────────┘
         │
         │ HTTP/WS
         ↓
┌─────────────────┐      ┌──────────────────┐
│  React Frontend │◄────►│  Zama FHE SDK    │
│  (TypeScript)   │      │  (Encryption)    │
└────────┬────────┘      └──────────────────┘
         │
         │ RPC
         ↓
┌─────────────────┐      ┌──────────────────┐
│  Sepolia Node   │◄────►│ Zama FHE Gateway │
│  (Ethereum)     │      │ (Decryption)     │
└────────┬────────┘      └──────────────────┘
         │
         │ EVM Calls
         ↓
┌─────────────────┐
│ ArcStrikeArena  │
│  Smart Contract │
│  (fhEVM)        │
└─────────────────┘
```

### Smart Contract Architecture

```solidity
ArcStrikeArena
├── Duel Management
│   ├── createReplicaDuel()      // Create new duel
│   ├── cancelReplicaDuel()      // Cancel duel
│   └── getDuel()                // Query duel info
├── Betting System
│   ├── placeReplicaBet()        // Place encrypted bet
│   ├── getUserBetInfo()         // Query user bet
│   └── getReplicaBetCipher()    // Get encrypted handle
├── Settlement
│   ├── settleReplicaDuel()      // Request decryption
│   └── finalizeReplicaReveal()  // Process callback
└── Prize Management
    ├── claimReplicaPrize()      // Claim winnings
    └── claimReplicaRefund()     // Claim refund
```

### FHE Operations Flow

```
User Input (skill weight)
         ↓
   FHE.encrypt() [Client-side]
         ↓
  Ciphertext + Proof
         ↓
  placeReplicaBet() [On-chain]
         ↓
  FHE.add() [Accumulate encrypted weights]
         ↓
  FHE.gt() [Compare encrypted totals]
         ↓
  FHE.select() [Choose winner]
         ↓
  FHE.requestDecryption() [Gateway call]
         ↓
  Decrypted Result [Callback]
         ↓
  Winner Determined ✅
```

---

## 🛠️ Technology Stack

### Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract language |
| **Zama fhEVM** | 0.5.0 | Fully Homomorphic Encryption |
| **@fhevm/solidity** | 0.9.0 | FHE Solidity library |
| **Hardhat** | 2.26.3 | Development framework |
| **Ethers.js** | 6.13.0 | Ethereum interaction |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.4.5 | Type-safe JavaScript |
| **Vite** | 5.2.11 | Build tool |
| **Wagmi** | 2.9.9 | React hooks for Ethereum |
| **RainbowKit** | 2.1.0 | Wallet connection UI |
| **Zama FHE SDK** | 0.3.0-5 | Client-side encryption |
| **Tailwind CSS** | 3.4.4 | Utility-first CSS |
| **shadcn/ui** | Latest | UI component library |
| **Zustand** | 4.5.5 | State management |
| **React Query** | 5.45.0 | Server state management |

### Development & Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **@fhevm/hardhat-plugin** | 0.3.0-0 | Hardhat FHE integration |
| **@fhevm/mock-utils** | 0.3.0-0 | FHE testing utilities |
| **Chai** | Latest | Assertion library |
| **ESLint** | 8.57.0 | Code linting |
| **TypeScript ESLint** | 7.14.1 | TypeScript linting |

---

## 📁 Project Structure

```
ArcStrikeArena/
├── contracts/                          # Smart contracts
│   └── ArcStrikeArena.sol             # Main duel contract with FHE
│
├── scripts/                            # Deployment scripts
│   ├── deploy.js                      # Contract deployment
│   └── create-native.js               # Create test duels
│
├── tests/                              # Comprehensive test suite
│   ├── ArcStrikeArena.test.js         # Smart contract tests
│   ├── frontend-integration.test.js   # Frontend integration tests
│   └── README.md                      # Testing documentation
│
├── frontend/                           # React application
│   ├── src/
│   │   ├── components/                # UI components
│   │   │   ├── bet-sheet.tsx         # Betting interface
│   │   │   ├── duel-card.tsx         # Duel list card
│   │   │   ├── fighter-toggle.tsx    # Fighter selection
│   │   │   ├── status-banner.tsx     # Status display
│   │   │   └── ui/                   # shadcn/ui components
│   │   │
│   │   ├── hooks/                     # React hooks
│   │   │   ├── useArenaContract.ts   # Contract interactions
│   │   │   └── useArenaData.ts       # Data fetching
│   │   │
│   │   ├── lib/                       # Utilities
│   │   │   ├── fhe.ts                # FHE SDK integration
│   │   │   └── utils.ts              # Helper functions
│   │   │
│   │   ├── store/                     # State management
│   │   │   ├── useArenaStore.ts      # Global app state
│   │   │   └── useFheStore.ts        # FHE instance state
│   │   │
│   │   ├── views/                     # Page views
│   │   │   ├── arena-hall-view.tsx   # Duel list
│   │   │   ├── duel-detail-view.tsx  # Duel details
│   │   │   └── my-team-view.tsx      # User positions
│   │   │
│   │   ├── constants/                 # Configuration
│   │   │   ├── contracts.ts          # Contract addresses
│   │   │   └── *.abi.json            # Contract ABIs
│   │   │
│   │   └── types/                     # TypeScript types
│   │
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── vite.config.ts                 # Vite configuration
│   └── package.json                   # Frontend dependencies
│
├── fhevmTemp/                         # Zama fhEVM config
├── hardhat.config.js                  # Hardhat configuration
├── package.json                       # Root dependencies
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Latest version
- **Git**: For cloning the repository
- **MetaMask**: Browser wallet extension

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mb2709-c/ArcStrikeArena.git
cd ArcStrikeArena
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Private key for deployment (DO NOT commit this!)
PRIVATE_KEY=your_private_key_here

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_key_here
```

### Local Development

#### 1. Compile Smart Contracts

```bash
npm run compile
```

#### 2. Run Tests

```bash
# Run all contract tests
npm test

# Run with gas reporting
npm run test:gas
```

#### 3. Start Frontend Development Server

```bash
npm run dev
# Or manually:
cd frontend && npm run dev
```

Open [http://localhost:5189](http://localhost:5189) in your browser.

### Deploy to Sepolia Testnet

1. **Ensure you have Sepolia ETH** in your deployer wallet
   - Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Deploy contract**

```bash
npm run deploy:sepolia
```

3. **Update contract address** in `frontend/src/constants/contracts.ts`

```typescript
export const ARC_STRIKE_ARENA_ADDRESS = "0xYourNewContractAddress" as const;
```

4. **Create test duels** (optional)

```bash
npm run create-duels
```

5. **Verify contract on Etherscan** (optional)

```bash
npm run verify -- <CONTRACT_ADDRESS>
```

---

## 🧪 Testing

We maintain a comprehensive test suite covering all aspects of the platform.

### Smart Contract Tests

Run the full test suite:

```bash
npm test
```

Run specific test file:

```bash
npx hardhat test tests/ArcStrikeArena.test.js
```

Run with gas reporting:

```bash
REPORT_GAS=true npm test
```

**Test Coverage**:
- ✅ **Duel Creation**: Contract deployment, duel initialization
- ✅ **Encrypted Betting**: FHE encryption, proof verification, accumulation
- ✅ **User Tracking**: getUserBetInfo, bet existence checks
- ✅ **Settlement**: FHE decryption, winner determination
- ✅ **Prize Distribution**: Claim prize, equal distribution logic
- ✅ **Refund System**: Cancel duel, claim refunds
- ✅ **Error Handling**: Double betting, invalid stakes, expired duels
- ✅ **Edge Cases**: Zero weights, max values, concurrent duels
- ✅ **FHE Operations**: All FHE functions (fromExternal, add, gt, select, decrypt)

### Frontend Integration Tests

Run type checking:

```bash
cd frontend && npm run type-check
```

Run linting:

```bash
cd frontend && npm run lint
```

Build for production:

```bash
npm run build
```

**Integration Test Scenarios**:
- ✅ FHE SDK loading and initialization
- ✅ Wallet connection with RainbowKit
- ✅ Duel list display and filtering
- ✅ Encrypted bet placement flow
- ✅ Transaction status tracking
- ✅ Real-time updates and event listeners
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Error handling and recovery

📖 **Detailed documentation**: See [tests/README.md](tests/README.md)

---

## 📦 Deployment

### Production Deployment Checklist

- [ ] Audit smart contracts
- [ ] Set up monitoring and alerts
- [ ] Configure production RPC endpoints
- [ ] Set up domain and SSL certificates
- [ ] Configure CORS and security headers
- [ ] Set up analytics (optional)
- [ ] Test on testnet extensively
- [ ] Deploy to mainnet
- [ ] Verify contract on Etherscan
- [ ] Update frontend contract addresses
- [ ] Deploy frontend to hosting provider

### Recommended Hosting

**Frontend**:
- [Vercel](https://vercel.com/) - Recommended for Next.js/React
- [Netlify](https://www.netlify.com/) - Good alternative
- [GitHub Pages](https://pages.github.com/) - Free option

**Backend/RPC**:
- [Alchemy](https://www.alchemy.com/) - Reliable RPC provider
- [Infura](https://infura.io/) - Popular choice
- [QuickNode](https://www.quicknode.com/) - Fast nodes

---

## 📍 Contract Addresses

### Sepolia Testnet

| Contract | Address | Explorer |
|----------|---------|----------|
| **ArcStrikeArena** | `0x0c6bf68f0CC59F0FBb93b7F51fA8caC756e04ABD` | [View on Etherscan](https://sepolia.etherscan.io/address/0x0c6bf68f0CC59F0FBb93b7F51fA8caC756e04ABD) |

### Mainnet

> ⚠️ **Not yet deployed to mainnet**
>
> This is an experimental project. Mainnet deployment will be announced separately.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug
2. **Suggest Features**: Share your ideas in the issues
3. **Submit Pull Requests**: Fix bugs or add features
4. **Improve Documentation**: Help us make docs clearer
5. **Write Tests**: Expand test coverage

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow existing code conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Arc Strike Arena

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

This project is built on the shoulders of giants:

- **[Zama](https://www.zama.ai/)** - For pioneering Fully Homomorphic Encryption on Ethereum
- **[fhEVM](https://docs.zama.ai/fhevm)** - The FHE-enabled Ethereum Virtual Machine
- **[React](https://reactjs.org/)** - For the powerful UI framework
- **[Wagmi](https://wagmi.sh/)** - For excellent React hooks for Ethereum
- **[RainbowKit](https://www.rainbowkit.com/)** - For beautiful wallet connection UX
- **[shadcn/ui](https://ui.shadcn.com/)** - For the gorgeous UI components
- **[Hardhat](https://hardhat.org/)** - For the robust development environment

---

## 📚 Additional Resources

### Documentation
- [Zama fhEVM Docs](https://docs.zama.ai/fhevm) - FHE on Ethereum
- [Solidity Docs](https://docs.soliditylang.org/) - Smart contract language
- [React Docs](https://react.dev/) - UI framework
- [Wagmi Docs](https://wagmi.sh/) - Ethereum React hooks

### Community
- [Zama Discord](https://discord.com/invite/zama) - Get help with FHE
- [GitHub Issues](https://github.com/mb2709-c/ArcStrikeArena/issues) - Report bugs
- [GitHub Discussions](https://github.com/mb2709-c/ArcStrikeArena/discussions) - Ask questions

### Related Projects
- [fhEVM Examples](https://github.com/zama-ai/fhevm) - Official examples
- [Encrypted ERC20](https://github.com/zama-ai/fhevm-react-template) - FHE token template

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=mb2709-c/ArcStrikeArena&type=Date)](https://star-history.com/#mb2709-c/ArcStrikeArena&Date)

---

<div align="center">

**Built with ❤️ using Zama FHE**

[⬆ Back to Top](#️-arc-strike-arena)

</div>
