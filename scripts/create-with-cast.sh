#!/bin/bash
CONTRACT="0x66531BEaF8Ff1d0f70730B53ceFa05DaB2cbA26D"
PRIVATE_KEY="0x13c718fa937777d770795d412f41b8d38f8da2a39fa2abb0eef9b11ae9aec51d"
RPC="https://ethereum-sepolia-rpc.publicnode.com"

echo "Creating duels using cast (foundry)..."

# Check if cast is available
if ! command -v cast &> /dev/null; then
    echo "❌ 'cast' command not found. Install foundry first:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi

# Duel 1: 45 days
echo -e "\n[1/5] Creating ARC-511..."
cast send $CONTRACT "createReplicaDuel(string,string,string,uint256,uint256)" \
  "ARC-511" "Shadow Blade" "Lightning Fist" 10000000000000000 3888000 \
  --rpc-url $RPC --private-key $PRIVATE_KEY

# Duel 2: 60 days
echo -e "\n[2/5] Creating ARC-512..."
cast send $CONTRACT "createReplicaDuel(string,string,string,uint256,uint256)" \
  "ARC-512" "Fire Dragon" "Ice Phoenix" 15000000000000000 5184000 \
  --rpc-url $RPC --private-key $PRIVATE_KEY

# Duel 3: 90 days
echo -e "\n[3/5] Creating ARC-513..."
cast send $CONTRACT "createReplicaDuel(string,string,string,uint256,uint256)" \
  "ARC-513" "Storm Warrior" "Earth Guardian" 20000000000000000 7776000 \
  --rpc-url $RPC --private-key $PRIVATE_KEY

# Duel 4: 30 days
echo -e "\n[4/5] Creating ARC-514..."
cast send $CONTRACT "createReplicaDuel(string,string,string,uint256,uint256)" \
  "ARC-514" "Thunder King" "Wind Spirit" 10000000000000000 2592000 \
  --rpc-url $RPC --private-key $PRIVATE_KEY

# Duel 5: 120 days
echo -e "\n[5/5] Creating ARC-515..."
cast send $CONTRACT "createReplicaDuel(string,string,string,uint256,uint256)" \
  "ARC-515" "Dark Knight" "Light Paladin" 25000000000000000 10368000 \
  --rpc-url $RPC --private-key $PRIVATE_KEY

echo -e "\n✨ Done! Check duels in frontend."
