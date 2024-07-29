# NFT Staking with ERC-20 Rewards

[![](https://mermaid.ink/img/pako:eNqVVk1v4jAQ_StWLnuhq23YUw8r0VBaaFmhttuVGipk4gGsJnbkjyJU9b_v2E5omlIWIiSwPfPem_HMhNcokwyis2iRy3W2osqQ-_5UEHy0nS8VLVekD2UuN7NECqNoZnQ4dk_vNB0KbWieEwYlCAYi46CfyMnJL9KL0-BJ-o-9yS2sqWKaZBXKUwMlDvbd9C_lhiykcmjoWIAwxEj0KcocDDR8zvcxn39g_j2437KSNTerCh3UN00oYwo0fmsi1wJUkyLIOj9GVrJPVrKVhZLuDH3mYtlSdnGbnMQ_CBXM2dTqEKBBEWQl3fQODFE-raQERea5zJ47xIq5FMxB4yaXrOPRKrssp7xAaTndNCG7AfLngZFiXFPRKpIxF2aGmhvV0T9NE5cJTRfgjsnCisxwKQh-2jcTUtSPU2_pgBzxRlpVZ2EPOWZiNgFVcK0RviHhopYApleWSr7QfCBVD3f-r-UiToMPEN2-LJRWUEGXEBQ6uY18DipWFO6bRuY53k-b8VNHeNYBsjL2mRELlIaVR9uXjOA6myiZYdreZV3WyUAD8BluStpRk0HRZZy6g0aoZL4hLjHcl5mRzyDIsN_MwFVFZcWRZFdx-if4HEM3dG2XKaAaQhvgJOOCGF6Ac263BLHaI-Hxd175BfphHHS7ZmSKrg8S3tARenOII6MCOCaK0f4oPrfw13GMqji8cV1oh8cxCnGMumni2UIbZpktbE4N1ONkX0vWb4vZ2PeJmyTv-NdVeZTUYqwHFcZ1nE689Q65N9tqOwLwxlVa-RXk-LSe1QLWhLvx50KgHvYd8yEOYOMq37bE6BncyyOSPQ7JHnfTB6zOxaYGcXeeIahzcyK2iC-gdIVcmbI2buNG2m_vQPZxWm-X_nDnNG1tBsNdk6a1Gd4su4oh6kQFAlLO8O_Hq3OeRmaFh9PoDH8yWFCbm2k0FW9oSq2RdxuRRWdGWehEStrlql7YkmFZ9jnFbBT1ZknFo5S4XNBcw9s_doj73Q?type=png)](https://mermaid.live/edit#pako:eNqVVk1v4jAQ_StWLnuhq23YUw8r0VBaaFmhttuVGipk4gGsJnbkjyJU9b_v2E5omlIWIiSwPfPem_HMhNcokwyis2iRy3W2osqQ-_5UEHy0nS8VLVekD2UuN7NECqNoZnQ4dk_vNB0KbWieEwYlCAYi46CfyMnJL9KL0-BJ-o-9yS2sqWKaZBXKUwMlDvbd9C_lhiykcmjoWIAwxEj0KcocDDR8zvcxn39g_j2437KSNTerCh3UN00oYwo0fmsi1wJUkyLIOj9GVrJPVrKVhZLuDH3mYtlSdnGbnMQ_CBXM2dTqEKBBEWQl3fQODFE-raQERea5zJ47xIq5FMxB4yaXrOPRKrssp7xAaTndNCG7AfLngZFiXFPRKpIxF2aGmhvV0T9NE5cJTRfgjsnCisxwKQh-2jcTUtSPU2_pgBzxRlpVZ2EPOWZiNgFVcK0RviHhopYApleWSr7QfCBVD3f-r-UiToMPEN2-LJRWUEGXEBQ6uY18DipWFO6bRuY53k-b8VNHeNYBsjL2mRELlIaVR9uXjOA6myiZYdreZV3WyUAD8BluStpRk0HRZZy6g0aoZL4hLjHcl5mRzyDIsN_MwFVFZcWRZFdx-if4HEM3dG2XKaAaQhvgJOOCGF6Ac263BLHaI-Hxd175BfphHHS7ZmSKrg8S3tARenOII6MCOCaK0f4oPrfw13GMqji8cV1oh8cxCnGMumni2UIbZpktbE4N1ONkX0vWb4vZ2PeJmyTv-NdVeZTUYqwHFcZ1nE689Q65N9tqOwLwxlVa-RXk-LSe1QLWhLvx50KgHvYd8yEOYOMq37bE6BncyyOSPQ7JHnfTB6zOxaYGcXeeIahzcyK2iC-gdIVcmbI2buNG2m_vQPZxWm-X_nDnNG1tBsNdk6a1Gd4su4oh6kQFAlLO8O_Hq3OeRmaFh9PoDH8yWFCbm2k0FW9oSq2RdxuRRWdGWehEStrlql7YkmFZ9jnFbBT1ZknFo5S4XNBcw9s_doj73Q)

This project implements a staking mechanism for NFTs where users can stake their NFTs to earn ERC-20 reward tokens with additional features like pause/unpause, UUPS upgradeable and admin specific functions. The project consists of three main components:

1. **ERC-20 Token Contract**: An ERC-20 token that will be used as the reward token for staking.
2. **NFT Contract**: An ERC-721 contract that represents the NFTs that users can stake.
3. **Staking Contract**: A contract that manages the staking, unstaking, and reward distribution processes for the NFTs.

## Overview of the Contracts

1. **ERC-20 Token Contract (`DZAPRewards`)**:

    - This contract implements an ERC-20 token with minting and burning functionalities. It includes a controller mechanism to allow only authorized addresses to mint and burn tokens.

2. **NFT Contract (`DZAPNFT`)**:

    - This contract implements an ERC-721 token with minting capabilities. The contract owner can mint new NFTs.

3. **Staking Contract (`NFTStaking`)**:
    - Users can stake their NFTs in this contract to earn ERC-20 reward tokens. The rewards are distributed per block based on the number of NFTs staked.
    - The contract supports staking, unstaking with an unbonding period, and reward claiming with a delay period.
    - It includes control mechanisms for pausing the contract and updating reward parameters.

## Steps to Interact with the Contracts

1.  **Deploy ERC-20 Token Contract**:

    Deploy the `DZAPRewards` contract. This will be the reward token used for staking.

    ```shell
    npx hardhat run scripts/deployRewardToken.js --network <network_name>
    ```

2.  **Deploy NFT Contract with the Deployer's Address as the Owner**:

    Deploy the `DZAPNFT` contract with the deployer's address as the owner. This contract will represent the NFTs to be staked.

    ```shell
    npx hardhat run scripts/deployNFT.js --network <network_name>
    ```

3.  **Deploy Staking Contract with Token and NFT Address along with Other Details**:

    Deploy the `NFTStaking` contract with the addresses of the deployed ERC-20 token and NFT contracts, and other staking parameters such as reward per block, unbonding period, and reward claim delay.

    ```shell
    npx hardhat run scripts/deployStaking.js --network <network_name>
    ```

4.  **Mint NFTs to Your Address by Interacting with the NFT Contract**:

    Mint NFTs to your address using the `safeMint` function of the `DZAPNFT` contract.

    ```shell
    npx hardhat console --network <network_name>

    > const nft = await ethers.getContractAt("DZAPNFT", "<nft_contract_address>");
    > await nft.safeMint("<your_address>");
    ```

5.  **Use the `setApprovalForAll` Function to Provide Relevant Permissions**:

    Use the `setApprovalForAll` function on the `DZAPNFT` contract to allow the staking contract to manage your NFTs.

    ```shell
    npx hardhat console --network <network_name>

    > const nft = await ethers.getContractAt("DZAPNFT", "<nft_contract_address>");
    > await nft.setApprovalForAll("<staking_contract_address>", true);

    ```

6.  **Approve the NFT Staking Contract for Minting and Sending Itself Reward Tokens by Adding It as a Controller**:

    Add the staking contract as a controller in the `DZAPRewards` contract to allow it to mint and transfer reward tokens.

    ```shell
    npx hardhat console --network <network_name>

    > const rewardToken = await ethers.getContractAt("DZAPRewards", "<reward_token_contract_address>");
    > await rewardToken.addController("<staking_contract_address>");

    ```

7.  **Stake NFTs**:

    Stake your NFTs by calling the `stakeNFTs` function on the staking contract with the token IDs of the NFTs you want to stake.

    ```shell
    npx hardhat console --network <network_name>

    > const staking = await ethers.getContractAt("NFTStaking", "<staking_contract_address>");
    > await staking.stakeNFTs([0, 1]); // Replace with your NFT token IDs

    ```

8.  **Unstake NFTs**:

    Unstake your NFTs by calling the `unstakeNFTs` function on the staking contract with the token IDs of the NFTs you want to unstake.

    ```shell
    npx hardhat console --network <network_name>

    > await staking.unstakeNFTs([0, 1]); // Replace with your NFT token IDs

    ```

9.  **Withdraw NFTs After Unbonding Period**:

    After the unbonding period has passed, withdraw your NFTs by calling the `withdrawNFTs` function on the staking contract with the token IDs of the NFTs you want to withdraw.

    ```shell
    npx hardhat console --network <network_name>

    > await staking.withdrawNFTs([0, 1]); // Replace with your NFT token IDs
    ```

10. **Claim Rewards**:

    Claim your accumulated rewards by calling the `claimRewards` function on the staking contract.

    ```shell
    npx hardhat console --network <network_name>

    > await staking.claimRewards();

    ```

## Administrative Functions

1. **Update Reward Per Block**:

    The contract owner can update the reward per block using the `setRewardPerBlock` function.

    ```shell
    npx hardhat console --network <network_name>

    > const staking = await ethers.getContractAt("NFTStaking", "<staking_contract_address>");
    > await staking.setRewardPerBlock(20); // Replace 20 with the desired reward per block

    ```

2. ## Update Unbonding Period

    The contract owner can update the unbonding period using the `setUnbondingPeriod` function.

    ```shell
    npx hardhat console --network <network_name>

    > const staking = await ethers.getContractAt("NFTStaking", "<staking_contract_address>");
    > await staking.setUnbondingPeriod(100); // Replace 100 with the desired unbonding period

    ```

3. ## Update Reward Claim Delay

    The contract owner can update the reward claim delay using the `setRewardClaimDelay` function.

    ```shell
    npx hardhat console --network <network_name>

    > const staking = await ethers.getContractAt("NFTStaking", "<staking_contract_address>");
    > await staking.setRewardClaimDelay(200); // Replace 200 with the desired reward claim delay

    ```

4. ## Pause and Unpause the Contract

    The contract owner can pause and unpause the staking contract using the `pause` and `unpause` functions.

    ```shell
    npx hardhat console --network <network_name>

    > const staking = await ethers.getContractAt("NFTStaking", "<staking_contract_address>");
    > await staking.pause();
    > await staking.unpause();
    ```

## Security Considerations

-   **Proper Approvals**: Ensure that the staking contract has the necessary approvals to transfer NFTs and mint reward tokens. Users should grant approval to the staking contract to manage their NFTs using the `setApprovalForAll` function.

-   **Role Management**: Only authorized addresses should be able to perform administrative functions such as updating parameters and pausing the contract. The contract owner should manage these roles and ensure that only trusted addresses are assigned administrative privileges.
