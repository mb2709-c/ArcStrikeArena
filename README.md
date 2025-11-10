# Arc Strike Arena

Arc Strike Arena 是一个隐私友好的 PvP 竞猜平台。观众针对两位选手的对决下注，并为所支持的一方提交密文“技能权重”。链上仅保存加密后的累计权重；直到比赛结束并发起 FHE 解密后，才会公开双方的总权重值，以公平决定胜者。

## 核心流程

1. **创建对决**：组织者设置 `stakeAmount`、持续时间与选手名称，初始化 `weightA/B` 密文累加器。
2. **下注**：用户支付 `stakeAmount` 并通过 FHE SDK 上传 `externalEuint64` 技能权重。合约将密文累加到对应选手，同时记录下注方。
3. **揭晓**：到期后创建者调用 `requestReplicaReveal`，FHE 网关返回双方总权重明文，胜者即为权重更高的一方（相等视为平局）。
4. **领奖/退款**：胜方 supporter 均分奖池；若对决取消或平局，则所有人可领取退款。

## 重要合约接口

- `createReplicaDuel(duelId, fighterA, fighterB, stake, duration)`
- `placeReplicaBet(duelId, side, encryptedSkill, proof)`
- `requestReplicaReveal(duelId)` / `finalizeReplicaReveal(requestId, cleartexts, proof)`
- `claimReplicaPrize(duelId)` / `claimReplicaRefund(duelId)`
- `getReplicaBetCipher(duelId, user)` 方便前端展示个人密文句柄

## 部署与集成

- 复用仓库既有 Hardhat 配置和 `@fhevm/solidity` 依赖。
- 前端需使用 FHE SDK 生成密文技能值，并在下注时附带 `bytes proof`。
- `stakeAmount` 固定保证了 payout 可被均分；若需按照权重比例分配，可拓展为解密个人权重或引入额外证明。
