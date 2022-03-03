// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Eth_Usd.sol";
import "./Dai_Usd.sol";
import "./Link_Usd.sol";

contract NFT_Market is AccessControlUpgradeable, Eth_Usd, Dai_Usd, Link_Usd {

    address internal owner;
    bool internal initContract;
    uint public feeAmount;
    uint internal _IdOfSale;

    enum TipeERC {Dai, Link}

    mapping (uint => Data) public saleData;

    struct Data {
        address seller;
        address tokenAdrress;
        uint tokenId;
        uint amountOfToken;
        uint deadline;
        uint priceOfSale;
    }
    
    function cont() public {
        require (initContract == false);

        owner = msg.sender;
        _setupRole("Owner", msg.sender);
        _setupRole("Admin", msg.sender);
        _setRoleAdmin("Owner", "Owner");
        _setRoleAdmin("Admin", "Owner");
        feeAmount = 1;
        initContract = true;

    }

    function registTokenSale(address _tokenAdrress, uint _tokenId, uint _amountOfToken, uint _deadline, uint _priceOfSale) public {

        _deadline += block.timestamp;
        _IdOfSale++;

        saleData[_IdOfSale] = Data(msg.sender, _tokenAdrress, _tokenId, _amountOfToken,  _deadline, _priceOfSale);

    }

    function buyTokenWithEth (uint saleID) public payable {

        Data memory token = saleData[saleID];
        uint finalPriceToken = (_calculateCostInToken(priceInTokenEth(), token.priceOfSale) * (10**18));

        require (msg.value >= finalPriceToken);

        if(msg.value > finalPriceToken){
            uint change = msg.value - finalPriceToken;
            payable(msg.sender).transfer(change);
        }

        IERC1155(token.tokenAdrress).safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
        _delateSale(saleID);

        uint payFee = calculateFee(finalPriceToken);
        payable(owner).transfer(payFee);
        finalPriceToken -= payFee;
        payable(token.seller).transfer(finalPriceToken);

    }

    function buyTokenWithERC20 (uint saleID, TipeERC _TipeERC) public {

        Data memory token = saleData[saleID];

        if(_TipeERC == TipeERC.Dai){

            uint finalPriceToken = _calculateCostInToken(priceInTokenDai(), token.priceOfSale);
            uint payFee = calculateFee(finalPriceToken);
            finalPriceToken -= payFee;

            require(IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).transferFrom(msg.sender, owner,payFee));
            require(IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).transferFrom(msg.sender, token.seller, finalPriceToken));

            IERC1155(token.tokenAdrress).safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
            _delateSale(saleID);

        }else{

            uint finalPriceToken = _calculateCostInToken(priceInTokenDai(), token.priceOfSale);
            uint payFee = calculateFee(finalPriceToken);
            finalPriceToken -= payFee;

            require(IERC20(0x514910771AF9Ca656af840dff83E8264EcF986CA).transferFrom(msg.sender, owner,payFee));
            require(IERC20(0x514910771AF9Ca656af840dff83E8264EcF986CA).transferFrom(msg.sender, token.seller, finalPriceToken));

            IERC1155(token.tokenAdrress).safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
            _delateSale(saleID);

        }

    }

    function sellerDelateSale (uint saleID) public {

        Data memory token = saleData[saleID];
        require (msg.sender == token.seller);
        _delateSale(saleID);

    }

    function modificateFee (uint newFee) public onlyRole("Admin"){
        require ( newFee > 0 && newFee < 100 );
        feeAmount = newFee;

    }

    function _calculateCostInToken(uint _priceToken, uint _priceSale) internal pure returns (uint){

        uint totalAmount;

        totalAmount = _priceSale / _priceToken;

        return totalAmount;

    }

    function _delateSale(uint idSale) internal {

        delete saleData[idSale];

    }

    function calculateFee(uint _amount) internal view returns(uint){

        uint payFee = (_amount * feeAmount)/100;

        return payFee;

    }

}