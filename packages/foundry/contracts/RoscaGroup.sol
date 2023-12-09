// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRoscaGroup.sol";

contract RoscaGroup is IRoscaGroup, Initializable {
    address[] _members;
    GroupDetails _groupDetails;
    mapping(uint256 => mapping(address => bool)) _memberContributed;

    uint8 public constant PLATFORM_FEE = 5;
    address public STABLECOIN_ADDRESS;
    address public MANAGER_ADDRESS;
    address public owner;

    mapping(address => bool) public isMember;

    GroupStage public groupStage = GroupStage.INITIALIZED;
    mapping(uint256 => RoundStage) public roundStage;

    event GroupStarted(uint256 startTime);
    event GroupEnded(uint256 endTime);
    event GroupCancelled(uint256 endTime);

    event RoundStarted(uint256 round, uint256 startTime);
    event RoundEnded(uint256 round, uint256 endTime);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyMember() {
        require(isMember[msg.sender], "Only member");
        _;
    }

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

    function joinGroup() external {
        require(!isMember[msg.sender], "Already joined");
        require(_members.length < _groupDetails.members, "Group is full");
        require(groupStage == GroupStage.INITIALIZED, "Group started");

        address newMember = msg.sender;
        _members.push(newMember);
        isMember[newMember] = true;
        _groupDetails.currentMembers++;
        if (_members.length == _groupDetails.members) {
            groupStage = GroupStage.ONGOING;
            _groupDetails.startTime = block.timestamp;
            _groupDetails.currentRound = 1;
            roundStage[_groupDetails.currentRound] = RoundStage.COLLECTION;
        }
    }

    function getGroupDetails() public view returns (GroupDetails memory) {
        return _groupDetails;
    }

    function getMembers() public view returns (address[] memory) {
        return _members;
    }

    function getCurrentRound() public view returns (uint256) {
        return _groupDetails.currentRound;
    }
}