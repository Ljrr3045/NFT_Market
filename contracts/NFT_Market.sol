// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**@title Contract for an NFT Marketplace
  *@author ljrr3045
  *@notice This contract is in charge of executing the functions corresponding to managing a 
  marketplace for nft, which range from the sale to the purchase of nft
*/

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./ChainLinkFeed/Eth_Usd.sol";
import "./ChainLinkFeed/Dai_Usd.sol";
import "./ChainLinkFeed/Link_Usd.sol";

contract NFT_Market is AccessControlUpgradeable, Eth_Usd, Dai_Usd, Link_Usd {

    address internal owner;
    bool internal initContract;
    uint public feeAmount;
    uint internal _IdOfSale;
    ///@dev variable necessary to control the contract

//Enums and Mappins

    ///@dev enum in charge of managing the payment method
    enum TipeERC {Dai, Link, Eth}

    /**@dev The saleDate mappin is in charge of storing the data of each registered sale and 
    the sellerAcount mappin is in charge of registering the sales registered by a person */
    mapping (uint => Data) public saleData;
    mapping (address => sellerRegist[]) public sellerAcount;

//Strucs

    struct Data {
        address seller;
        address tokenAdrress;
        uint saleId;
        uint tokenId;
        uint amountOfToken;
        uint deadline;
        uint priceOfSale;
        bool exist;
    }

    struct sellerRegist {
        address token;
        uint tokenId;
        uint amountOfToken;
        uint saleId;
    }

//Events

    event selling (
        address _seller, 
        uint _saleId, 
        address _tokenAdrress, 
        uint _tokenId, 
        uint _amountOfToken, 
        uint _priceOfSale, 
        string _data
    );

    event buying (
        address _buyer, 
        uint _saleId, 
        address _seller, 
        uint _priceOfSale, 
        string _data
    );

    event canceling (
        address _owner, 
        uint _saleId, 
        string _data
    );

//Modifiers

    ///@dev Modifier in charge of verifying if the time limit for a sale has expired
    modifier timeOfBuy(uint _saleID){

        if(block.timestamp > saleData[_saleID].deadline){
            revert("The time for buy this token ended");
        }
        _;
    }

    /**@dev Modifier commissioned to know if a seller owns tokens and if he has enough tokens available to publish, 
    preventing him from publishing sales without sufficient balance */
    modifier evitRepublication(address _tokenAdrress, uint _tokenId, uint _amountOfToken){

        uint tokensAvailable = IERC1155(_tokenAdrress).balanceOf(msg.sender, _tokenId);

        require(tokensAvailable > 0, "The seller not are owner of tokens");

        for(uint i=0; i < sellerAcount[msg.sender].length; i++){
            if(sellerAcount[msg.sender][i].token == _tokenAdrress){
                if(sellerAcount[msg.sender][i].tokenId == _tokenId){
                    tokensAvailable -= sellerAcount[msg.sender][i].amountOfToken;
                }
            }
        }

        require(tokensAvailable >= _amountOfToken, "You don't have enough token to publish");
        _;
    }

    ///@dev Modifier to verify if the entered data is valid
    modifier confirmDates(address _tokenAdrress, uint _amountOfToken, uint _deadline,  uint _priceOfSale){
        require(_tokenAdrress != address(0), "Date is invalidid");
        require(_amountOfToken > 0, "Date is invalidid");
        require(_deadline > 0, "Date is invalidid");
        require(_priceOfSale > 0, "Date is invalidid");
        _;
    }

    ///@dev Modifier in charge to know if a sell order exists
    modifier saleExist(uint _saleID){
        require(saleData[_saleID].exist, "This order for sale no exist");
        _;
    }

//Public functions
    
    ///@notice constructor function to initialize the contract
    function cont() public {
        require (initContract == false, "This contract are init");

        owner = msg.sender;
        _setupRole("Owner", msg.sender);
        _setupRole("Admin", msg.sender);
        _setRoleAdmin("Owner", "Owner");
        _setRoleAdmin("Admin", "Owner");

        constLink();
        constEth();
        constDai();
        
        feeAmount = 1;
        initContract = true;
    }

    /**@notice function in charge of registering a sale offer by a user, assigning a unique id for each 
       sale and saving the data in their respective mappins
      *@dev before executing it passes the data through the modifiers verifying that they are good and 
       the seller has a sufficient balance of tokens
    */
    function registTokenSale(
        address _tokenAdrress, 
        uint _tokenId, 
        uint _amountOfToken, 
        uint _deadline, 
        uint _priceOfSale
        )
        confirmDates(
            _tokenAdrress,
            _amountOfToken,
            _deadline,
            _priceOfSale
        )
        evitRepublication(
            _tokenAdrress, 
            _tokenId, 
            _amountOfToken
        ) 
        public{
    
        _deadline += block.timestamp;
        _IdOfSale++;

        saleData[_IdOfSale] = Data(
            msg.sender, 
            _tokenAdrress, 
            _IdOfSale, _tokenId, 
            _amountOfToken, 
            _deadline, 
            _priceOfSale, 
            true
        );

        sellerAcount[msg.sender].push(sellerRegist(_tokenAdrress,_tokenId,_amountOfToken, _IdOfSale));

        emit selling(msg.sender,_IdOfSale,_tokenAdrress,_tokenId,_amountOfToken,_priceOfSale,"Posted sale");
    }

    /**@notice Function in charge of carrying out the purchase of an offer accepted as a means of payment ETH, if the buyer 
      exceeds the payment, the change will be returned and the corresponding fees will be paid to the owner and seller. 
      *@dev The id of the sale must be passed as a parameter. In order for the token to be transferred, the seller must approve 
       the NFT_Market to use their token first.
    */
    function buyTokenWithEth (uint saleID) public payable saleExist(saleID) timeOfBuy(saleID){

        Data memory token = saleData[saleID];
        uint finalPriceToken = _calculateCostInToken(priceInTokenEth(), token.priceOfSale, TipeERC.Eth);
        require(finalPriceToken > 0, "This price in token not is valid for buy");
        require (msg.value >= finalPriceToken, "Pay is not enaugh");

        if(msg.value > finalPriceToken){
            uint change = msg.value - finalPriceToken;
            payable(msg.sender).transfer(change);
        }

        IERC1155(token.tokenAdrress).
        safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
        _delateSale(saleID);
        _delateSellerAcount(saleID, token.seller);

        uint payFee = _calculateFee(finalPriceToken);
        payable(owner).transfer(payFee);
        finalPriceToken -= payFee;
        payable(token.seller).transfer(finalPriceToken);

        emit buying(msg.sender, token.saleId, token.seller, token.priceOfSale, "Bought with ETH");
    }

    /**@notice Function in charge of carrying out the purchase of an offer accepted as a means of payment DAI OR LINK 
      (the buyer must approve NFT_Market so that he can spend his ERC20 token) and the corresponding fees will be paid to 
      the owner and seller. 
      *@dev The id of the sale and the type of token with which it will pay must be passed as a parameter. In order for the 
      token to be transferred, the seller must approve the NFT_Market to use their token first.
    */
    function buyTokenWithERC20 (uint saleID, TipeERC _TipeERC) public saleExist(saleID) timeOfBuy(saleID){

        Data memory token = saleData[saleID];
        if(_TipeERC == TipeERC.Dai){

            uint finalPriceToken = _calculateCostInToken(priceInTokenDai(), token.priceOfSale, TipeERC.Dai);
            require(finalPriceToken > 0, "This price in token not is valid for buy");

            uint payFee = _calculateFee(finalPriceToken);
            finalPriceToken -= payFee;

            require(
                IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).
                transferFrom(msg.sender, owner,payFee));
            require(
                IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F).
                transferFrom(msg.sender, token.seller, finalPriceToken));

            IERC1155(token.tokenAdrress).
            safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
            _delateSale(saleID);
            _delateSellerAcount(saleID, token.seller);

            emit buying(msg.sender, token.saleId, token.seller, token.priceOfSale, "Bought with DAI");

        }else{

            uint finalPriceToken = _calculateCostInToken(priceInTokenLink(), token.priceOfSale, TipeERC.Link);
            require(finalPriceToken > 0, "This price in token not is valid for buy");

            uint payFee = _calculateFee(finalPriceToken);
            finalPriceToken -= payFee;

            require(
                IERC20(0x514910771AF9Ca656af840dff83E8264EcF986CA).
                transferFrom(msg.sender, owner, payFee));
            require(
                IERC20(0x514910771AF9Ca656af840dff83E8264EcF986CA).
                transferFrom(msg.sender, token.seller, finalPriceToken));

            IERC1155(token.tokenAdrress).
            safeTransferFrom(token.seller, msg.sender, token.tokenId, token.amountOfToken,"");
            _delateSale(saleID);
            _delateSellerAcount(saleID, token.seller);

            emit buying(msg.sender, token.saleId, token.seller, token.priceOfSale, "Bought with LINK");
        }
    }

    ///@notice Function in charge of eliminating a sale offer
    ///@dev only the owner of the sale can delete it
    function sellerDelateSale (uint saleID) public saleExist(saleID){

        Data memory token = saleData[saleID];
        require (msg.sender == token.seller, "Not be owner of sale");
        _delateSale(saleID);
        _delateSellerAcount(saleID, token.seller);

        emit canceling(msg.sender, saleID, "Sale canceled");
    }

    ///@notice Function in charge of modifying the fee for the owner of the contract
    ///@dev only the admin can modify the fees
    function modificateFee (uint newFee) public onlyRole("Admin"){

        require ( newFee > 0 && newFee < 100, "This % not is valid" );
        feeAmount = newFee;
    }

//Internal functions

    ///@dev Function in charge of calculating the sale price of an offer in token or ETH
    function _calculateCostInToken(uint _priceToken, uint _priceSale, TipeERC _tipeERC) internal pure returns (uint){

        uint totalAmount;
        uint priceSaleFinal;

        if(_tipeERC == TipeERC.Eth){
            totalAmount = ((_priceSale * (10**8))/ _priceToken) * (10**10);
        }else{
            priceSaleFinal = _priceSale * 100;
            totalAmount = Math.ceilDiv(priceSaleFinal, _priceToken);
        }

        return totalAmount;
    }

    ///@dev Function in charge of calculating the amount of token or ETH that corresponds to the owner depending on the fee rate
    function _calculateFee(uint _amount) internal view returns(uint){

        uint payFee = (_amount * feeAmount)/100;
        return payFee;
    }

    ///@dev Function responsible for removing an offer from the sales record
    function _delateSale(uint idSale) internal {
        delete saleData[idSale];
    }

    ///@dev Function responsible for removing an offer from the sales record of a particular user to avoid re-entries
    function _delateSellerAcount(uint _Id, address sellerAddress) internal {

        for(uint i = 0; i < sellerAcount[sellerAddress].length; i++){
            if(_Id == sellerAcount[sellerAddress][i].saleId){

                for(uint j = i; j < sellerAcount[sellerAddress].length - 1; j++){
                    sellerAcount[sellerAddress][j] = sellerAcount[sellerAddress][j+1];
                }
                
                sellerAcount[sellerAddress].pop();
                break;
            }
        }
    }
}