const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UpDate Proxy", async()=> {
    let NftMarket, nftMarket, NftMarketV2, nftMarketV2;

    before(async ()=> {

        NftMarket = await ethers.getContractFactory("NFT_Market");
        NftMarketV2 = await ethers.getContractFactory("NFT_MarketV2");

        nftMarket = await upgrades.deployProxy(NftMarket, {initializer: "cont"});
        nftMarketV2 = await upgrades.upgradeProxy(nftMarket.address, NftMarketV2);
    });

    it("Should update", async ()=> {

        expect(await nftMarketV2.upDate()).to.equal(true);
    });
});