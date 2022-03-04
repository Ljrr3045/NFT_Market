const { expect } = require("chai");
const { ethers } = require("hardhat");
const linkAbi = require("./ContractJson/Link.json");
const daiAbi = require("./ContractJson/Dai.json");
const tokenAbi = require("./ContractJson/Erc1155.json");

describe("NFT_Market", async ()=> {
    let NftMarket,nftMarket,link,dai,erc1155,owner, per1,per2Dai,per3Link,seller1;

    before (async ()=> {
        await hre.network.provider.request({ method: "hardhat_impersonateAccount",params: ["0x1060120df794e226540ad41c5875c562af3419e0"],});
        await hre.network.provider.request({ method: "hardhat_impersonateAccount",params: ["0x04eab3e8ab9d6aaa09953bf6d4d2f0aa105c6d11"],});
        await hre.network.provider.request({ method: "hardhat_impersonateAccount",params: ["0x20b38b163765c3a9afEF81781F06cae22Fef3290"],});

        NftMarket = await ethers.getContractFactory("NFT_Market");
        nftMarket = await NftMarket.deploy();

        link = await new ethers.Contract( "0x514910771AF9Ca656af840dff83E8264EcF986CA" , linkAbi);
        dai = await new ethers.Contract( "0x6B175474E89094C44Da98b954EedeAC495271d0F" , daiAbi);
        erc1155 = await new ethers.Contract( "0xC50F11281b0821E5a9AD3DD77C33Eaf82d3094f4" , tokenAbi);

        [owner, per1] = await ethers.getSigners();
        per2Dai = await ethers.getSigner("0x1060120df794e226540ad41c5875c562af3419e0");
        per3Link = await ethers.getSigner("0x04eab3e8ab9d6aaa09953bf6d4d2f0aa105c6d11");
        seller1 = await ethers.getSigner("0x20b38b163765c3a9afEF81781F06cae22Fef3290");
    });

    describe("Start of the contract", async ()=> {
        it("Error: Should not start the contract twice", async ()=> {
            await nftMarket.connect(owner).cont();

            await expect(nftMarket.connect(owner).cont()).to.be.revertedWith("This contract are init");
        })
    });

    describe("Sales registration process", async ()=> {
        it("Error: If you do not own the tokens, do not publish", async ()=> {
            await expect(nftMarket.connect(per1).
            registTokenSale(
                erc1155.address, 
                77, 
                1, 
                86400, 
                100
            )).to.be.revertedWith("The seller not are owner of tokens");
        });

        it("Error: The data must be valid", async ()=> {
            await expect(nftMarket.connect(seller1).
            registTokenSale(
                "0x0000000000000000000000000000000000000000",  
                77, 
                1, 
                86400, 
                100
            )).to.be.revertedWith("Date is invalidid");

            await expect(nftMarket.connect(seller1).
            registTokenSale(
                erc1155.address, 
                77, 
                0, 
                86400, 
                100
            )).to.be.revertedWith("Date is invalidid");

            await expect(nftMarket.connect(seller1).
            registTokenSale(
                erc1155.address, 
                77, 
                1, 
                0, 
                100
            )).to.be.revertedWith("Date is invalidid");

            await expect(nftMarket.connect(seller1).
            registTokenSale(
                erc1155.address, 
                77, 
                1, 
                86400, 
                0
            )).to.be.revertedWith("Date is invalidid");
        });

        it("The sale should be stored",async ()=> {

            await nftMarket.connect(seller1).registTokenSale(erc1155.address, 77, 10, 86400, 100);

            let [
                seller, 
                tokenAdrress, 
                saleId, 
                tokenId, 
                amountOfToken, 
                deadline, 
                priceOfSale, 
                exist
            ] = await nftMarket.connect(owner).saleData(1);

            const blockNumBefore = await ethers.provider.getBlockNumber();
            const blockBefore = await ethers.provider.getBlock(blockNumBefore);
            const timestampBlock = blockBefore.timestamp;

            expect(seller).to.equal(seller1.address);
            expect(tokenAdrress).to.equal(erc1155.address);
            expect(saleId).to.equal(1);
            expect(tokenId).to.equal(77);
            expect(amountOfToken).to.equal(10);
            expect(deadline).to.equal(timestampBlock + 86400);
            expect(priceOfSale).to.equal(100);
            expect(exist).to.equal(true);

        });

        it("Error: Unable to republish a sale if there is not enough token to back it", async ()=> {

            await expect(nftMarket.connect(seller1).registTokenSale(erc1155.address, 77, 10, 86400, 100)).
            to.be.revertedWith("You don't have enough token to publish");

        });
    });
});