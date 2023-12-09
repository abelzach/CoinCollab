// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IRoscaGroup.sol";
import "./RoscaGroup.sol";

contract RoscaManager is Ownable {
    uint256 _nextGroupId;
    mapping(uint256 => address) _groups;

    address public immutable baseImplementation;
    address public STABLECOIN_ADDRESS;

    event GroupCreated(address groupAddress, address creator);

    constructor(
        address initialOwner,
        address stablecoinAddress
    ) Ownable(initialOwner) {
        STABLECOIN_ADDRESS = stablecoinAddress;
        baseImplementation = address(new RoscaGroup());
    }

    function setStablecoinAddress(address stablecoinAddress) external onlyOwner {
        STABLECOIN_ADDRESS = stablecoinAddress;
    }

    function withdrawStablecoin() external onlyOwner {
        IERC20(STABLECOIN_ADDRESS).transfer(
            owner(), 
            IERC20(STABLECOIN_ADDRESS).balanceOf(address(this))
        );
    }

    function createGroup(uint256 amount, uint256 members) public {
        uint256 groupId = _nextGroupId++;
        address clone = Clones.clone(baseImplementation);
        IRoscaGroup(clone).initialize(
            groupId,
            amount,
            members,
            address(this),
            STABLECOIN_ADDRESS,
            owner()
        );
        _groups[groupId] = clone;
        emit GroupCreated(clone, msg.sender);
    }

    function numberOfGroups() public view returns (uint256) {
        return _nextGroupId;
    }

    function getGroup(uint256 groupId) public view returns (address) {
        return _groups[groupId];
    }

    function getOpenGroups() public view returns (IRoscaGroup.GroupDetails[] memory) {
        uint256 openGroupsCount = 0;
        for (uint256 i = 0; i < _nextGroupId; i++) {
            IRoscaGroup group = IRoscaGroup(_groups[i]);
            (IRoscaGroup.GroupDetails memory groupDetails) = group.getGroupDetails();
            if (groupDetails.startTime == 0) {
                openGroupsCount++;
            }
        }

        IRoscaGroup.GroupDetails[] memory openGroups = new IRoscaGroup.GroupDetails[](openGroupsCount);
        uint256 openGroupsIndex = 0;
        for (uint256 i = 0; i < _nextGroupId; i++) {
            IRoscaGroup group = IRoscaGroup(_groups[i]);
            (IRoscaGroup.GroupDetails memory groupDetails) = group.getGroupDetails();
            if (groupDetails.startTime == 0) {
                openGroups[openGroupsIndex] = groupDetails;
                openGroupsIndex++;
            }
        }
        return openGroups;
    }
}
