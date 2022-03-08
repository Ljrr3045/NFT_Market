const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainLinkFeed", async ()=> {
    let  ETH,eth,DAI,dai,LINK,link,deployer;

    before(async ()=> {

        ETH = await ethers.getContractFactory("Eth_Usd");
        eth = await ETH.deploy();
        DAI = await ethers.getContractFactory("Dai_Usd");
        dai = await DAI.deploy();
        LINK = await ethers.getContractFactory("Link_Usd");
        link = await LINK.deploy();

        [deployer] = await ethers.getSigners();

        await link.connect(deployer).constLink();
        await eth.connect(deployer).constEth();
        await dai.connect(deployer).constDai();
    });

    it("Error: Should not instantiate two times", async ()=> {

        await expect(link.connect(deployer).constLink()).to.be.revertedWith("This contract are init");
        await expect(eth.connect(deployer).constEth()).to.be.revertedWith("This contract are init");
        await expect(dai.connect(deployer).constDai()).to.be.revertedWith("This contract are init");
    });

    describe("Eth_Usd", async ()=> {
        it("For block 14316371, the price of ETH should be 2805$", async ()=> {
            expect(await eth.priceInTokenEth()).to.equal(2805);
        });
    });

    describe("Dai_Usd", async ()=> {
        it("For block 14316371, the price of DAI should be 0.99$", async ()=> {
            expect(await dai.priceInTokenDai()).to.equal(99);
        });
    });

    describe("Link_Usd", async ()=> {
        it("For block 14316371, the price of LINK should be 14,62$", async ()=> {
            expect(await link.priceInTokenLink()).to.equal(1462);
        });
    });
});
