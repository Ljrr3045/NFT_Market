// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title Chainlink instance contract for the LINK/USD pair
  *@author ljrr3045
  *@notice This contract has the function of communicating with the ChainLink contract for the 
  LINK/USD pair and extracting the market price for it.
*/

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Link_Usd {

    AggregatorV3Interface private priceFeed;
    bool private init;

    ///@notice Constructor function to instantiate the ChainLink contract
    function constLink() public {
        require(init == false, "This contract are init");
        priceFeed = AggregatorV3Interface(0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c);
        init = true;
    }

    ///@notice Function that extracts the price of the token and converts it to a number without 8 excess decimals
    function priceInTokenLink() public view returns(uint){
        uint tokenValue;

        tokenValue = uint(_getLatestPriceLink()) / 1000000;

        return tokenValue;
    }

    ///@notice Private function that extracts the LINK/USD token exchange price from the ChainLink contract
    function _getLatestPriceLink() private view returns (int) {

        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }
}