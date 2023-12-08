// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRoscaGroup.sol";

contract RoscaGroup is IRoscaGroup, Initializable {
    address[] _members;
    GroupDetails _groupDetails;

    address public STABLECOIN_ADDRESS;
    address public MANAGER_ADDRESS;
    address public owner;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 id_,
        uint256 amount_,
        uint256 members_,
        address manager_,
        address stablecoin_,
        address owner_
    ) 
        initializer 
        external 
    {
        _groupDetails.id = id_;
        _groupDetails.amount = amount_;
        _groupDetails.members = members_;
        _groupDetails.currentMembers = 0;
        _groupDetails.createdAt = block.timestamp;
        _groupDetails.groupAddress = address(this);
        MANAGER_ADDRESS = manager_;
        STABLECOIN_ADDRESS = stablecoin_;
        owner = owner_;
    }

    function getGroupDetails() public view returns (GroupDetails memory) {
        return _groupDetails;
    }
}