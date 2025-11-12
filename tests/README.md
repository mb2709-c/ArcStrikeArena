# ArcStrikeArena Test Suite

Comprehensive test suite for the ArcStrikeArena privacy-preserving PvP betting platform.

## Overview

This test suite includes:
- **Smart Contract Tests**: Testing FHE operations, duel management, betting logic, and settlement
- **Frontend Integration Tests**: Testing UI components, wallet integration, and FHE SDK usage

## Prerequisites

Before running tests, ensure you have:
- Node.js v18+ installed
- All dependencies installed: `npm install`
- Hardhat configured with fhEVM plugin

## Test Structure

```
tests/
├── ArcStrikeArena.test.js          # Smart contract tests
├── frontend-integration.test.js    # Frontend integration tests
└── README.md                        # This file
```

## Running Tests

### Smart Contract Tests

Run all smart contract tests:
```bash
npm test
```

Run specific test file:
```bash
npx hardhat test tests/ArcStrikeArena.test.js
```

Run tests with gas reporting:
```bash
REPORT_GAS=true npm test
```

Run tests in verbose mode:
```bash
npm test -- --verbose
```

### Frontend Integration Tests

The frontend integration tests are scenario-based documentation tests. To implement actual executable tests, you would need to:

1. Install testing dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

2. Configure Vitest in `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

3. Run frontend tests:
```bash
cd frontend
npm run test
```

## Test Coverage

### Smart Contract Tests

#### ✅ Core Functionality
- [x] Contract deployment
- [x] Duel creation with FHE encrypted skills
- [x] Encrypted betting with proof verification
- [x] User bet info tracking (getUserBetInfo)
- [x] Duel settlement with FHE decryption
- [x] Prize claiming for winners
- [x] Refund claiming for cancelled duels

#### ✅ FHE Operations
- [x] `FHE.fromExternal()` - Encrypted input conversion
- [x] `FHE.add()` - Encrypted skill accumulation
- [x] `FHE.gt()` - Encrypted comparison for winner
- [x] `FHE.select()` - Conditional winner selection
- [x] `FHE.requestDecryption()` - Oracle decryption request
- [x] `FHE.checkSignatures()` - Decryption verification
- [x] `FHE.allowThis()` - Decryption permissions

#### ✅ Error Handling
- [x] Double betting prevention
- [x] Invalid stake amount rejection
- [x] Betting after deadline rejection
- [x] Invalid proof handling
- [x] Unauthorized access prevention

#### ✅ Complex Scenarios
- [x] Multiple concurrent duels
- [x] Multiple bets per duel
- [x] Cross-duel betting patterns
- [x] State management across duels

### Frontend Integration Tests

#### ✅ FHE SDK Integration
- [x] SDK loading from CDN
- [x] Instance initialization with Sepolia config
- [x] Error handling for initialization failures

#### ✅ Wallet Integration
- [x] RainbowKit connection flow
- [x] Network switching
- [x] Disconnection handling

#### ✅ Duel Management
- [x] Duel list display
- [x] Filtering by status
- [x] Detail view with complete information
- [x] User bet position display

#### ✅ Betting Flow
- [x] Weight encryption with FHE
- [x] Bet submission to contract
- [x] Transaction status tracking
- [x] Error handling and retry

#### ✅ Prize Management
- [x] Prize claiming for winners
- [x] Refund claiming for cancelled duels
- [x] Double claim prevention
- [x] Balance updates

#### ✅ User Experience
- [x] Real-time countdown updates
- [x] Event-driven UI updates
- [x] Transaction status toasts
- [x] Etherscan link integration

#### ✅ Responsive Design
- [x] Mobile layout (< 640px)
- [x] Tablet layout (640px - 1024px)
- [x] Desktop layout (> 1024px)

#### ✅ Accessibility
- [x] Keyboard navigation
- [x] ARIA labels and roles
- [x] Screen reader support

#### ✅ Performance
- [x] Fast initial load
- [x] Efficient list rendering
- [x] Minimized re-renders

#### ✅ Error Recovery
- [x] RPC failure recovery
- [x] Wallet disconnection handling
- [x] Contract deployment verification

## Test Scenarios

### Basic Flow
1. Deploy contract
2. Create duel
3. Place encrypted bet
4. Settle duel
5. Claim prize

### Advanced Scenarios
1. **Multiple Concurrent Duels**: Users betting across different duels simultaneously
2. **Race Conditions**: Multiple users betting at the same time
3. **Edge Cases**: Zero weights, maximum values, expired duels
4. **Error Recovery**: Network failures, transaction reverts, wallet disconnects

## FHE Testing Best Practices

When writing FHE tests:

1. **Always check `fhevm.isMock`**: Ensure tests run in mock environment
2. **Initialize CLI API**: Call `await fhevm.initializeCLIApi()` before tests
3. **Wait for Oracle**: Use `await fhevm.awaitDecryptionOracle()` after requesting decryption
4. **Create Encrypted Inputs**: Use `fhevm.createEncryptedInput()` for all FHE values
5. **Verify Proofs**: Always include `inputProof` with encrypted values
6. **Test Edge Cases**: Zero values, maximum values, boundary conditions

## Example Test Execution

```bash
# Run all contract tests
npm test

# Expected output:
# ✅ ArcStrikeArena deployed at: 0x...
# ✅ Duel created: DUEL-001
# ✅ Bet placed on Fighter A
# ✅ FHE.fromExternal() - Bet encryption works
# ✅ FHE.add() - Skill accumulation works
# ...
# 12 passing (15s)
```

## Troubleshooting

### Common Issues

**Issue**: `Error: This test must run in FHEVM mock environment`
**Solution**: Ensure your Hardhat config has `fhevmConfig` set correctly:
```javascript
fhevmConfig: {
  isMock: true
}
```

**Issue**: `Error: FHE decryption timeout`
**Solution**: Increase timeout in test config:
```javascript
this.timeout(30000); // 30 seconds
```

**Issue**: `Error: Cannot read property 'encrypt' of undefined`
**Solution**: Initialize FHE CLI API in beforeEach:
```javascript
await fhevm.initializeCLIApi();
```

## Continuous Integration

To run tests in CI/CD:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Contributing

When adding new features, please:
1. Add corresponding test cases
2. Ensure all tests pass: `npm test`
3. Maintain >80% code coverage
4. Follow existing test patterns

## Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Testing Library](https://testing-library.com/)

## License

MIT
