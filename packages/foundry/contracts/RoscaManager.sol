// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IRoscaGroup.sol";

contract RoscaManager is Ownable {
    uint256 _nextGroupId;
    mapping(uint256 => address) _groups;

    address public immutable baseImplementation;
    address public STABLECOIN_ADDRESS;

    event GroupCreated(address groupAddress, address creator);

    constructor(
        address initialOwner,
        address stablecoinAddress,
        address baseImplementation_
    ) Ownable(initialOwner) {
        STABLECOIN_ADDRESS = stablecoinAddress;
        baseImplementation = baseImplementation_;
    }

    function setStablecoinAddress(address stablecoinAddress) external onlyOwner {
        STABLECOIN_ADDRESS = stablecoinAddress;
    }

    function createGroup(uint256 amount, uint256 members) public {
        uint256 groupId = _nextGroupId++;
        address clone = Clones.clone(baseImplementation);
        _groups[groupId] = clone;
    }

    function numberOfGroups() public view returns (uint256) {
        return _nextGroupId;
    }

    function getGroup(uint256 groupId) public view returns (address) {
        return _groups[groupId];
    }
}
