//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/*
 * @title NFTStaking.sol
 * @author Prathmesh Ranjan 2024
 *
 * @dev This contract allows users to stake their NFTs to earn ERC20 reward tokens.
 * It includes functionalities for staking, unstaking, withdrawing, and claiming rewards,
 * with added control mechanisms for pausing the contract and updating configurations.
 *
 * Features:
 * - Users can stake one or more NFTs and earn reward tokens per block.
 * - Users can unstake their NFTs and must wait for an unbonding period before withdrawal.
 * - Accumulated rewards can be claimed after a specified delay period.
 * - The contract is upgradeable using the UUPS proxy pattern.
 * - Owner can pause/unpause the staking process and update reward rates and periods.
 * 
 * @notice 
 * - This contract uses OpenZeppelin's libraries for ERC721, ERC20, security, access control,
 *   and upgradeability.
 * - Proper approvals are required before staking NFTs.
 * - The reward rate, unbonding period, and claim delay period can be updated by the owner.
 * - The contract can be paused by the owner to prevent staking and unstaking during emergencies.
 *
 * @dev 
 * - Users earn rewards based on the number of blocks their NFTs are staked.
 * - No additional rewards are given during the unbonding period after unstaking.
 * - Reward claiming resets the delay period, ensuring controlled reward distribution.
*/


contract NFTStaking is Initializable, UUPSUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    using SafeERC20 for IERC20;

    IERC721 public nftToken;
    IERC20 public rewardToken;
    uint256 public rewardPerBlock;
    uint256 public unbondingPeriod;
    uint256 public rewardClaimDelay;

    struct StakedNFT {
        uint256 tokenId;
        uint256 stakeTimestamp;
        uint256 unstakeTimestamp;
    }

    struct UserInfo {
        uint256 totalStaked;
        uint256 rewardDebt;
        uint256 lastRewardClaim;
        StakedNFT[] stakedNFTs;
    }

    mapping(address => UserInfo) public userInfo;

    event NFTStaked(address indexed user, uint256 tokenId);
    event NFTUnstaked(address indexed user, uint256 tokenId);
    event RewardClaimed(address indexed user, uint256 amount);

    function initialize(
        address _nftToken,
        address _rewardToken,
        uint256 _rewardPerBlock,
        uint256 _unbondingPeriod,
        uint256 _rewardClaimDelay
    ) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        __UUPSUpgradeable_init();

        nftToken = IERC721(_nftToken);
        rewardToken = IERC20(_rewardToken);
        rewardPerBlock = _rewardPerBlock;
        unbondingPeriod = _unbondingPeriod;
        rewardClaimDelay = _rewardClaimDelay;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function stakeNFTs(uint256[] calldata tokenIds) external whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        updateRewards(msg.sender);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            nftToken.transferFrom(msg.sender, address(this), tokenIds[i]);
            user.stakedNFTs.push(StakedNFT({tokenId: tokenIds[i], stakeTimestamp: block.number, unstakeTimestamp: 0}));
            emit NFTStaked(msg.sender, tokenIds[i]);
        }

        user.totalStaked += tokenIds.length;
        user.rewardDebt = user.totalStaked * rewardPerBlock;
    }

    function unstakeNFTs(uint256[] calldata tokenIds) external whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        updateRewards(msg.sender);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(isNFTStakedByUser(msg.sender, tokenIds[i]), "NFT not staked by user");
            markNFTAsUnstaked(msg.sender, tokenIds[i]);
            emit NFTUnstaked(msg.sender, tokenIds[i]);
        }

        user.totalStaked -= tokenIds.length;
        user.rewardDebt = user.totalStaked * rewardPerBlock;
    }

    function withdrawNFTs(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(isNFTUnbonded(msg.sender, tokenIds[i]), "NFT still in unbonding period");
            removeNFTFromStakedList(msg.sender, tokenIds[i]);
            nftToken.transferFrom(address(this), msg.sender, tokenIds[i]);
        }
    }

    function claimRewards() external whenNotPaused {
        UserInfo storage user = userInfo[msg.sender];
        require(block.number >= user.lastRewardClaim + rewardClaimDelay, "Claim delay not reached");
        
        updateRewards(msg.sender);
        
        uint256 rewards = user.rewardDebt;
        require(rewards > 0, "No rewards to claim");

        rewardToken.safeTransfer(msg.sender, rewards);
        emit RewardClaimed(msg.sender, rewards);

        user.rewardDebt = 0;
        user.lastRewardClaim = block.number;
    }

    function updateRewards(address userAddress) internal {
        UserInfo storage user = userInfo[userAddress];
        uint256 pendingRewards = user.totalStaked * rewardPerBlock * (block.number - user.lastRewardClaim);
        user.rewardDebt += pendingRewards;
        user.lastRewardClaim = block.number;
    }

    function isNFTStakedByUser(address userAddress, uint256 tokenId) internal view returns (bool) {
        UserInfo storage user = userInfo[userAddress];
        for (uint256 i = 0; i < user.stakedNFTs.length; i++) {
            if (user.stakedNFTs[i].tokenId == tokenId && user.stakedNFTs[i].unstakeTimestamp == 0) {
                return true;
            }
        }
        return false;
    }

    function isNFTUnbonded(address userAddress, uint256 tokenId) internal view returns (bool) {
        UserInfo storage user = userInfo[userAddress];
        for (uint256 i = 0; i < user.stakedNFTs.length; i++) {
            if (user.stakedNFTs[i].tokenId == tokenId && user.stakedNFTs[i].unstakeTimestamp > 0 && block.number >= user.stakedNFTs[i].unstakeTimestamp + unbondingPeriod) {
                return true;
            }
        }
        return false;
    }

    function markNFTAsUnstaked(address userAddress, uint256 tokenId) internal {
        UserInfo storage user = userInfo[userAddress];
        for (uint256 i = 0; i < user.stakedNFTs.length; i++) {
            if (user.stakedNFTs[i].tokenId == tokenId && user.stakedNFTs[i].unstakeTimestamp == 0) {
                user.stakedNFTs[i].unstakeTimestamp = block.number;
                break;
            }
        }
    }

    function removeNFTFromStakedList(address userAddress, uint256 tokenId) internal {
        UserInfo storage user = userInfo[userAddress];
        for (uint256 i = 0; i < user.stakedNFTs.length; i++) {
            if (user.stakedNFTs[i].tokenId == tokenId) {
                user.stakedNFTs[i] = user.stakedNFTs[user.stakedNFTs.length - 1];
                user.stakedNFTs.pop();
                break;
            }
        }
    }

    function getStakedNFTs(address user) external view returns (StakedNFT[] memory) {
    return userInfo[user].stakedNFTs;
    }


    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        rewardPerBlock = _rewardPerBlock;
    }

    function setUnbondingPeriod(uint256 _unbondingPeriod) external onlyOwner {
        unbondingPeriod = _unbondingPeriod;
    }

    function setRewardClaimDelay(uint256 _rewardClaimDelay) external onlyOwner {
        rewardClaimDelay = _rewardClaimDelay;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}