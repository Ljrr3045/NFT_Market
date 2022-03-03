// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Dai_Usd {

    AggregatorV3Interface private priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9);
    }

    function _getLatestPriceDai() internal view returns (int) {

        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function priceInTokenDai() public view returns(uint){
        uint tokenValue;

        tokenValue = uint(_getLatestPriceDai()) / 100000000;

        return tokenValue;
    }
} 