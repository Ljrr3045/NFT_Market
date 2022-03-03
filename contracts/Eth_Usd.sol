// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Eth_Usd {

    AggregatorV3Interface private priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
    }

    function _getLatestPriceEth() internal view returns (int) {

        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function priceInTokenEth() public view returns(uint){
        uint tokenValue;

        tokenValue = uint(_getLatestPriceEth()) / 100000000;

        return tokenValue;
    }
}