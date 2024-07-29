const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTStaking", function () {
    let NFTStaking, nftStaking, DZAPNFT, dzapNFT, RewardToken, rewardToken;
    let owner, user1, user2;
    const rewardPerBlock = 10;
    const unbondingPeriod = 100;
    const rewardClaimDelay = 200;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy the DZAPNFT contract (NFT)
        DZAPNFT = await ethers.getContractFactory("DZAPNFT");
        dzapNFT = await DZAPNFT.deploy(await owner.getAddress());
        await dzapNFT.waitForDeployment();

        // Mint some NFTs to user1
        await dzapNFT.safeMint(user1.getAddress());
        await dzapNFT.safeMint(user1.getAddress());
        await dzapNFT.safeMint(user1.getAddress());

        // Deploy the RewardToken contract (ERC20)
        RewardToken = await ethers.getContractFactory("DZAPRewards");
        rewardToken = await RewardToken.deploy();
        await rewardToken.waitForDeployment();

        // Add the owner as a controller to mint tokens
        await rewardToken.addController(owner.getAddress());

        // Mint reward tokens to owner address
        const initialRewardTokens = ethers.parseEther("1000");
        await rewardToken.mint(owner.getAddress(), initialRewardTokens);

        // Deploy the NFTStaking contract
        NFTStaking = await ethers.getContractFactory("NFTStaking");
        nftStaking = await NFTStaking.deploy();
        await nftStaking.waitForDeployment();

        // Initialize the NFTStaking contract
        await nftStaking.initialize(
            await dzapNFT.getAddress(),
            await rewardToken.getAddress(),
            rewardPerBlock,
            unbondingPeriod,
            rewardClaimDelay
        );

        // Approve the NFTStaking contract to spend reward tokens
        const stakingRewardTokens = ethers.parseEther("1000");
        await rewardToken.approve(
            await nftStaking.getAddress(),
            stakingRewardTokens
        );

        // Transfer some reward tokens to the NFTStaking contract
        await rewardToken.transfer(
            await nftStaking.getAddress(),
            stakingRewardTokens
        );
    });

    describe("Initialization", function () {
        it("should initialize correctly", async function () {
            expect(await nftStaking.nftToken()).to.equal(
                await dzapNFT.getAddress()
            );
            expect(await nftStaking.rewardToken()).to.equal(
                await rewardToken.getAddress()
            );
            expect(await nftStaking.rewardPerBlock()).to.equal(rewardPerBlock);
            expect(await nftStaking.unbondingPeriod()).to.equal(
                unbondingPeriod
            );
            expect(await nftStaking.rewardClaimDelay()).to.equal(
                rewardClaimDelay
            );
        });
    });

    describe("Staking NFTs", function () {
        it("should allow user to stake NFTs", async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(user1).stakeNFTs([0, 1]);

            const userInfo = await nftStaking.userInfo(
                await user1.getAddress()
            );
            expect(userInfo.totalStaked).to.equal(2);

            // Accessing stakedNFTs and checking its length
            const stakedNFTs = await nftStaking.getStakedNFTs(
                await user1.getAddress()
            );
            expect(stakedNFTs.length).to.equal(2);
        });

        it("should emit NFTStaked event", async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await expect(nftStaking.connect(user1).stakeNFTs([0]))
                .to.emit(nftStaking, "NFTStaked")
                .withArgs(await user1.getAddress(), 0);
        });

        it("should fail if NFT is not approved", async function () {
            await expect(
                nftStaking.connect(user1).stakeNFTs([0])
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "ERC721InsufficientApproval"
            );
        });
    });

    describe("Unstaking NFTs", function () {
        beforeEach(async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(user1).stakeNFTs([0, 1]);
        });

        it("should allow user to unstake NFTs", async function () {
            await nftStaking.connect(user1).unstakeNFTs([0]);

            const userInfo = await nftStaking.userInfo(
                await user1.getAddress()
            );
            expect(userInfo.totalStaked).to.equal(1);
            // Accessing stakedNFTs and checking its length
            const stakedNFTs = await nftStaking.getStakedNFTs(
                await user1.getAddress()
            );
            expect(stakedNFTs.length).to.equal(2); // NFT still in the array until withdrawal
        });

        it("should emit NFTUnstaked event", async function () {
            await expect(nftStaking.connect(user1).unstakeNFTs([0]))
                .to.emit(nftStaking, "NFTUnstaked")
                .withArgs(await user1.getAddress(), 0);
        });

        it("should fail if NFT is not staked", async function () {
            await expect(
                nftStaking.connect(user1).unstakeNFTs([2])
            ).to.be.revertedWith("NFT not staked by user");
        });
    });

    describe("Withdrawing NFTs", function () {
        beforeEach(async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(user1).stakeNFTs([0, 1]);
            await nftStaking.connect(user1).unstakeNFTs([0, 1]);
        });

        // it("should allow user to withdraw NFTs after unbonding period", async function () {
        //     await time.increase((unbondingPeriod + 1) * 15); // Assuming 15 seconds per block

        //     await nftStaking.connect(user1).withdrawNFTs([0, 1]);
        //     expect(await dzapNFT.ownerOf(0)).to.equal(await user1.getAddress());
        //     expect(await dzapNFT.ownerOf(1)).to.equal(await user1.getAddress());
        // });

        it("should fail if unbonding period is not over", async function () {
            await expect(
                nftStaking.connect(user1).withdrawNFTs([0])
            ).to.be.revertedWith("NFT still in unbonding period");
        });
    });

    describe("Claiming Rewards", function () {
        beforeEach(async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(user1).stakeNFTs([0, 1]);
        });

        // it("should allow user to claim rewards after delay period", async function () {
        //     // Increase time by reward claim delay period
        //     await time.increase((rewardClaimDelay + 1) * 15); // Assuming 15 seconds per block

        //     // Check balance before claiming rewards
        //     const balanceBefore = await rewardToken.balanceOf(
        //         await user1.getAddress()
        //     );

        //     // Claim rewards
        //     const claimTx = await nftStaking.connect(user1).claimRewards();
        //     await claimTx.wait();

        //     // Check balance after claiming rewards
        //     const balanceAfter = await rewardToken.balanceOf(
        //         await user1.getAddress()
        //     );

        //     // Calculate expected rewards
        //     const expectedRewards = rewardPerBlock * 2 * (rewardClaimDelay + 1); // 2 NFTs staked for (rewardClaimDelay + 1) blocks

        //     expect(balanceAfter.sub(balanceBefore)).to.equal(expectedRewards);

        //     // Check event
        //     await expect(claimTx)
        //         .to.emit(nftStaking, "RewardClaimed")
        //         .withArgs(await user1.getAddress(), expectedRewards);
        // });

        it("should fail if claim delay period is not over", async function () {
            await expect(
                nftStaking.connect(user1).claimRewards()
            ).to.be.revertedWith("Claim delay not reached");
        });
    });

    describe("Admin Functions", function () {
        it("should allow owner to update reward per block", async function () {
            await nftStaking.setRewardPerBlock(20);
            expect(await nftStaking.rewardPerBlock()).to.equal(20);
        });

        it("should allow owner to update unbonding period", async function () {
            await nftStaking.setUnbondingPeriod(200);
            expect(await nftStaking.unbondingPeriod()).to.equal(200);
        });

        it("should allow owner to update reward claim delay", async function () {
            await nftStaking.setRewardClaimDelay(400);
            expect(await nftStaking.rewardClaimDelay()).to.equal(400);
        });

        it("should allow owner to pause and unpause the contract", async function () {
            await nftStaking.pause();
            expect(await nftStaking.paused()).to.equal(true);

            await nftStaking.unpause();
            expect(await nftStaking.paused()).to.equal(false);
        });

        it("should fail if non-owner tries to update reward per block", async function () {
            await expect(
                nftStaking.connect(user1).setRewardPerBlock(20)
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should fail if non-owner tries to update unbonding period", async function () {
            await expect(
                nftStaking.connect(user1).setUnbondingPeriod(200)
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should fail if non-owner tries to update reward claim delay", async function () {
            await expect(
                nftStaking.connect(user1).setRewardClaimDelay(400)
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should fail if non-owner tries to pause the contract", async function () {
            await expect(
                nftStaking.connect(user1).pause()
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should fail if non-owner tries to unpause the contract", async function () {
            await nftStaking.pause();
            await expect(
                nftStaking.connect(user1).unpause()
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "OwnableUnauthorizedAccount"
            );
        });
    });

    describe("Edge Cases and Failure Scenarios", function () {
        it("should fail to stake if not approved", async function () {
            await expect(
                nftStaking.connect(user1).stakeNFTs([0])
            ).to.be.revertedWithCustomError(
                dzapNFT,
                "ERC721InsufficientApproval"
            );
        });

        it("should fail to unstake if not staked", async function () {
            await expect(
                nftStaking.connect(user1).unstakeNFTs([3])
            ).to.be.revertedWith("NFT not staked by user");
        });

        it("should fail to withdraw if not unstaked", async function () {
            await expect(
                nftStaking.connect(user1).withdrawNFTs([0])
            ).to.be.revertedWith("NFT still in unbonding period");
        });

        it("should fail to claim rewards if no NFTs are staked", async function () {
            await time.increase((rewardClaimDelay + 1) * 15); // Assuming 15 seconds per block

            await expect(
                nftStaking.connect(user2).claimRewards()
            ).to.be.revertedWith("No rewards to claim");
        });

        // it("should fail to claim rewards if reward tokens are insufficient", async function () {
        //     await dzapNFT
        //         .connect(user1)
        //         .setApprovalForAll(await nftStaking.getAddress(), true);
        //     await nftStaking.connect(user1).stakeNFTs([0, 1]);

        //     // Transfer reward tokens out of the staking contract to simulate insufficient balance
        //     await rewardToken.transfer(
        //         await owner.getAddress(),
        //         ethers.parseEther("1000")
        //     );

        //     await time.increase((rewardClaimDelay + 1) * 15);

        //     await expect(
        //         nftStaking.connect(user1).claimRewards()
        //     ).to.be.revertedWithCustomError(
        //         rewardToken,
        //         "ERC20InsufficientBalance"
        //     );
        // });
    });

    describe("Pause Functionality", function () {
        it("should allow owner to pause and unpause the contract", async function () {
            await nftStaking.pause();
            expect(await nftStaking.paused()).to.equal(true);

            await nftStaking.unpause();
            expect(await nftStaking.paused()).to.equal(false);
        });

        it("should not allow non-owner to pause the contract", async function () {
            await expect(
                nftStaking.connect(user1).pause()
            ).to.be.revertedWithCustomError(
                nftStaking,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should not allow non-owner to unpause the contract", async function () {
            await nftStaking.pause();
            await expect(
                nftStaking.connect(user1).unpause()
            ).to.be.revertedWithCustomError(
                nftStaking,
                "OwnableUnauthorizedAccount"
            );
        });

        it("should not allow staking when paused", async function () {
            await nftStaking.pause();
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await expect(
                nftStaking.connect(user1).stakeNFTs([0, 1])
            ).to.be.revertedWithCustomError(nftStaking, "EnforcedPause");
        });

        it("should not allow unstaking when paused", async function () {
            await dzapNFT
                .connect(user1)
                .setApprovalForAll(await nftStaking.getAddress(), true);
            await nftStaking.connect(user1).stakeNFTs([0, 1]);
            await nftStaking.pause();
            await expect(
                nftStaking.connect(user1).unstakeNFTs([0, 1])
            ).to.be.revertedWithCustomError(nftStaking, "EnforcedPause");
        });
    });
});
