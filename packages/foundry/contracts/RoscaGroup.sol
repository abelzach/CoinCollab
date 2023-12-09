// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IRoscaGroup.sol";

contract RoscaGroup is IRoscaGroup, Initializable {
    address[] _members;
    GroupDetails _groupDetails;
    mapping(uint256 => mapping(address => bool)) _memberContributed;
    mapping(uint256 => bytes) proofs;

    uint8 public constant PLATFORM_FEE = 5;
    uint16 public constant MIN_CREDIT_SCORE = 400;
    address public STABLECOIN_ADDRESS;
    address public MANAGER_ADDRESS;
    address public MULTI_SIG_ADDRESS;
    address public owner;
    address public oracle;

    mapping(address => bool) public isMember;
    mapping(address => bool) public isWinner;
    mapping(address => bool) public isBlacklisted;
    mapping(address => uint256) public unclaimedAmount;

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

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }

    modifier onlyMember() {
        require(isMember[msg.sender], "Only member");
        _;
    }

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == MULTI_SIG_ADDRESS || msg.sender == owner,
            "Only multisig or owner"
        );
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
            emit GroupStarted(block.timestamp);
            emit RoundStarted(_groupDetails.currentRound, block.timestamp);
        }
    }

    function contribute() external onlyMember {
        require(groupStage == GroupStage.ONGOING, "Group not ongoing");
        uint256 round = _groupDetails.currentRound;
        require(roundStage[round] == RoundStage.COLLECTION, "Not in collection stage");
        require(!_memberContributed[round][msg.sender], "Already contributed");
        
        address vault = MULTI_SIG_ADDRESS != address(0) ? MULTI_SIG_ADDRESS : owner;
        IERC20(STABLECOIN_ADDRESS).transferFrom(
            msg.sender,
            vault,
            _groupDetails.amount
        );
        _memberContributed[round][msg.sender] = true;
        if (allMembersContributed()) {
            roundStage[round] = RoundStage.BIDDING;
        }
    }

    function distribute(uint256 winningBid, address winner) external onlyMultiSigOrOwner {
        require(groupStage == GroupStage.ONGOING, "Group not ongoing");
        uint256 round = _groupDetails.currentRound;
        require(roundStage[round] == RoundStage.BIDDING, "Not in bidding stage");
        require(isMember[winner], "Not a member");
        require(!isWinner[winner], "Already won");
        require(winningBid > 0, "Bid cannot be zero");

        uint256 poolFund = _groupDetails.amount * _groupDetails.members;
        IERC20(STABLECOIN_ADDRESS).transferFrom(
            msg.sender,
            address(this),
            poolFund
        );
        uint256 fee = (poolFund * PLATFORM_FEE) / 100;
        uint256 totalDividend = poolFund - fee - winningBid;

        if (totalDividend > 0) {
            uint256 dividend = totalDividend / (_groupDetails.members - 1);
            for (uint256 i = 0; i < _members.length; i++) {
                if (_members[i] != winner) {
                    unclaimedAmount[_members[i]] += dividend;
                } else {
                    unclaimedAmount[_members[i]] += winningBid;
                }
            }
        } else {
            unclaimedAmount[winner] += winningBid;
        }
        IERC20(STABLECOIN_ADDRESS).transferFrom(
            address(this),
            MANAGER_ADDRESS,
            fee
        );
        isWinner[winner] = true;
        roundStage[round] = RoundStage.ENDED;
        emit RoundEnded(round, block.timestamp);

        if (round != _groupDetails.members) {
            _groupDetails.currentRound++;
            roundStage[_groupDetails.currentRound] = RoundStage.COLLECTION;
            emit RoundStarted(_groupDetails.currentRound, block.timestamp);
        } else {
            groupStage = GroupStage.ENDED;
            _groupDetails.endTime = block.timestamp;
            emit GroupEnded(block.timestamp);
        }
    }

    function claim() external onlyMember {
        require(!isBlacklisted[msg.sender], "Blacklisted");
        require(unclaimedAmount[msg.sender] > 0, "Nothing to claim");
        IERC20(STABLECOIN_ADDRESS).transfer(
            msg.sender,
            unclaimedAmount[msg.sender]
        );
        unclaimedAmount[msg.sender] = 0;
    }

    function cancelGroup() external onlyOwner {
        require(
            groupStage != GroupStage.ENDED &&
            groupStage != GroupStage.CANCELLED,
            "Group already ended or cancelled"
        );
        groupStage = GroupStage.CANCELLED;
        _groupDetails.endTime = block.timestamp;
        emit GroupCancelled(block.timestamp);
    }

    function setMultiSigAddress(address multiSigAddress) external onlyOwner {
        MULTI_SIG_ADDRESS = multiSigAddress;
    }

    function setOracleAddress(address oracleAddress) external onlyOwner {
        oracle = oracleAddress;
    }

    function setMemberReputation(address member, uint256 score) external onlyOracle {
        if (score <= MIN_CREDIT_SCORE) {
            isBlacklisted[member] = true;
        }
    }

    function publishProof(uint256 round, bytes memory proof) external onlyMultiSigOrOwner {
        require(round <= _groupDetails.members, "Invalid round");
        require(roundStage[round] == RoundStage.ENDED, "Round not ended");
        require(proofs[round].length == 0, "Proof already published");
        proofs[round] = proof;
    }

    function getProof(uint256 round) public view returns (bytes memory) {
        return proofs[round];
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

    function getCurrentRoundStage() public view returns (RoundStage) {
        return roundStage[_groupDetails.currentRound];
    }

    function hasMemberContributed(address member) public view returns (bool) {
        return _memberContributed[_groupDetails.currentRound][member];
    }

    function allMembersContributed() public view returns (bool) {
        uint256 round = _groupDetails.currentRound;
        for (uint256 i = 0; i < _members.length; i++) {
            if (!_memberContributed[round][_members[i]]) {
                return false;
            }
        }
        return true;
    }

    function getNonPrizedMembers() public view returns (address[] memory) {
        uint256 nonPrizedMembersCount = 0;
        for (uint256 i = 0; i < _members.length; i++) {
            if (!isWinner[_members[i]]) {
                nonPrizedMembersCount++;
            }
        }

        address[] memory nonPrizedMembers = new address[](nonPrizedMembersCount);
        uint256 nonPrizedMembersIndex = 0;
        for (uint256 i = 0; i < _members.length; i++) {
            if (!isWinner[_members[i]]) {
                nonPrizedMembers[nonPrizedMembersIndex] = _members[i];
                nonPrizedMembersIndex++;
            }
        }
        return nonPrizedMembers;
    }
}