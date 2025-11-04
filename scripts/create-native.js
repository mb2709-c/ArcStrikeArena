// Pure ethers.js - no hardhat
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  console.log('Creating duels...\n');
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const abi = [{type:'function',name:'createReplicaDuel',inputs:[{name:'duelId',type:'string'},{name:'fighterA',type:'string'},{name:'fighterB',type:'string'},{name:'stakeAmount',type:'uint256'},{name:'duration',type:'uint256'}],outputs:[]}];
  const contract = new ethers.Contract('0x203Fa83a518D49Ab82523b96eE0da5240647E223', abi, wallet);
  
  const duels = [
    ['ARC-511','Shadow Blade','Lightning Fist','0.01',3888000],
    ['ARC-512','Fire Dragon','Ice Phoenix','0.015',5184000],
    ['ARC-513','Storm Warrior','Earth Guardian','0.02',7776000],
    ['ARC-514','Thunder King','Wind Spirit','0.01',2592000],
    ['ARC-515','Dark Knight','Light Paladin','0.025',10368000]
  ];
  
  for(const [id,a,b,stake,dur] of duels){
    try{
      const tx=await contract.createReplicaDuel(id,a,b,ethers.parseEther(stake),dur);
      console.log(id,'TX:',tx.hash);
      await tx.wait();
      console.log(id,'✅');
    }catch(e){console.error(id,'❌',e.shortMessage||e.message);}
  }
}
main().catch(console.error);