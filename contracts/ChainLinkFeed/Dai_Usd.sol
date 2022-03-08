// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title Contract for the DAI/USD pair
  *@author ljrr3045
  *@notice This contract extracts the price of the DAI/USD pair
*/

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Dai_Usd {

  AggregatorV3Interface private priceFeed;
  bool private init;

  ///@notice Constructor function to instantiate the ChainLink contract
  function constDai() public {
    require(init == false, "This contract are init");
    priceFeed = AggregatorV3Interface(0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9);
    init = true;
  }

  ///@notice Function that extracts the price of the token and converts it to a number without 8 excess decimals
  function priceInTokenDai() public view returns(uint){
    uint tokenValue;

    tokenValue = uint(_getLatestPriceDai()) / 1000000;

    return tokenValue;
  }

  ///@notice Private function that extracts the DAI/USD token exchange price from the ChainLink contract
  function _getLatestPriceDai() private view returns (int) {

    (,int price,,,) = priceFeed.latestRoundData();
    return price;
  }
}