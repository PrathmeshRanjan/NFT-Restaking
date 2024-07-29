const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(
        "Deploying contracts with the account:",
        await deployer.getAddress()
    );

    // Deploy the DZAPNFT contract (NFT)
    const DZAPNFT = await ethers.getContractFactory("DZAPNFT");
    const dzapNFT = await DZAPNFT.deploy(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    await dzapNFT.waitForDeployment();
    console.log("DZAPNFT deployed to:", await dzapNFT.getAddress());

    // Deploy the RewardToken contract (ERC20)
    const RewardToken = await ethers.getContractFactory("DZAPRewards");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.waitForDeployment();
    console.log("RewardToken deployed to:", await rewardToken.getAddress());

    // Add the deployer as a controller to mint tokens
    await rewardToken.addController(deployer.getAddress());
    console.log(`Added deployer as controller to mint tokens`);

    // Deploy the NFTStaking contract
    const NFTStaking = await ethers.getContractFactory("NFTStaking");
    const nftStaking = await NFTStaking.deploy();
    await nftStaking.waitForDeployment();
    console.log("NFTStaking deployed to:", await nftStaking.getAddress());

    // Initialize the NFTStaking contract
    const rewardPerBlock = 10;
    const unbondingPeriod = 100;
    const rewardClaimDelay = 200;

    await nftStaking.initialize(
        await dzapNFT.getAddress(),
        await rewardToken.getAddress(),
        rewardPerBlock,
        unbondingPeriod,
        rewardClaimDelay
    );
    console.log("NFTStaking initialized");

    // Mint reward tokens to deployer address
    const initialRewardTokens = ethers.parseEther("1000");
    await rewardToken.mint(deployer.getAddress(), initialRewardTokens);
    console.log(
        `Minted ${ethers.formatEther(
            initialRewardTokens
        )} reward tokens to deployer`
    );

    // Transfer some reward tokens to the NFTStaking contract
    await rewardToken.transfer(nftStaking.getAddress(), initialRewardTokens);
    console.log(
        `Transferred ${ethers.formatEther(
            initialRewardTokens
        )} reward tokens to NFTStaking contract`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
