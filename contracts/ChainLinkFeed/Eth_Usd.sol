// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title Chainlink instance contract for the ETH/USD pair
  *@author ljrr3045
  *@notice This contract has the function of communicating with the ChainLink contract for the 
  ETH/USD pair and extracting the market price for it.
*/

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Eth_Usd {

    AggregatorV3Interface private priceFeed;
    bool private init;

    ///@notice Constructor function to instantiate the ChainLink contract
    function constEth() public {
        require(init == false, "This contract are init");
        priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);
        init = true;
    }

    ///@notice Function that extracts the price of the token and converts it to a number without 8 excess decimals
    function priceInTokenEth() public view returns(uint){
        uint tokenValue;

        tokenValue = uint(_getLatestPriceEth()) / 100000000;

        return tokenValue;
    }

    ///@notice Private function that extracts the ETH/USD token exchange price from the ChainLink contract
    function _getLatestPriceEth() private view returns (int) {

        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}