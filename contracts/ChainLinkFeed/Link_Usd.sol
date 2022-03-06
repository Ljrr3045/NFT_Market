// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Link_Usd {

    AggregatorV3Interface private priceFeed;
    bool private init;

    function constLink() public {
        require(init == false);
        priceFeed = AggregatorV3Interface(0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c);
        init = true;
    }

    function _getLatestPriceLink() internal view returns (int) {

        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function priceInTokenLink() public view returns(uint){
        uint tokenValue;

        tokenValue = uint(_getLatestPriceLink()) / 100000000;

        return tokenValue;
    }
}