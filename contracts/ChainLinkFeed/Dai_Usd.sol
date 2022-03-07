// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title Contract for the DAI/USD pair
  *@author ljrr3045
  *@notice This contract extracts the price of the DAI/USD pair
*/

contract Dai_Usd {

    ///@notice Function that returns the price of DAI/USD (it will always be 1, since it is a StableCoin)
    function priceInTokenDai() public pure returns(uint){
        uint tokenValue = 1;
        return tokenValue;
    }
}