const { ethers } = require('hardhat');

async function main() {
  console.log('⚔️  Creating duels...\n');
  const [signer] = await ethers.getSigners();
  const contractAddress = '0x66531BEaF8Ff1d0f70730B53ceFa05DaB2cbA26D';
  const abi = [{type:'function',name:'createReplicaDuel',inputs:[{name:'duelId',type:'string'},{name:'fighterA',type:'string'},{name:'fighterB',type:'string'},{name:'stakeAmount',type:'uint256'},{name:'duration',type:'uint256'}],outputs:[]}];
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const duels = [
    ['ARC-511', 'Shadow Blade', 'Lightning Fist', ethers.parseEther('0.01'), 45*24*60*60],
    ['ARC-512', 'Fire Dragon', 'Ice Phoenix', ethers.parseEther('0.015'), 60*24*60*60],
    ['ARC-513', 'Storm Warrior', 'Earth Guardian', ethers.parseEther('0.02'), 90*24*60*60],
    ['ARC-514', 'Thunder King', 'Wind Spirit', ethers.parseEther('0.01'), 30*24*60*60],
    ['ARC-515', 'Dark Knight', 'Light Paladin', ethers.parseEther('0.025'), 120*24*60*60]
  ];
  for (let d of duels) {
    try {
      const tx = await contract.createReplicaDuel(d[0], d[1], d[2], d[3], d[4]);
      console.log(d[0], 'TX:', tx.hash);
      await tx.wait();
      console.log(d[0], '✅');
    } catch(e) { console.error(d[0], '❌', e.message); }
  }
}
main().then(() => process.exit(0)).catch(console.error);