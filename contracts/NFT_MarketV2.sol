// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title NFT_Market contract update
  *@author ljrr3045
  *@notice This is a contract to simulate the update of the NFT_Market contract, inheriting 
  all the functionalities from NFT_Market and adding new ones.
*/

import "./NFT_Market.sol";

contract NFT_MarketV2 is NFT_Market {

    function upDate() public pure returns(bool){
        return true;
    }
}