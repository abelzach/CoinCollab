// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRoscaGroup {
    struct GroupDetails {
        uint256 amount;
        uint256 members;
        uint256 currentRound;
        uint256 createdAt;
        uint256 startTime;
        uint256 endTime;
        address groupAddress;
    }

    function initialize(
        uint256 amount,
        uint256 members,
        address manager,
        address stablecoin,
        address owner
    ) external;

    function getGroupDetails() external view returns (GroupDetails memory);
}