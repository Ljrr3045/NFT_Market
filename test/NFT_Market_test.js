const { expect } = require("chai");
const { ethers } = require("hardhat");
const linkAbi = require("./ContractJson/Link.json");
const daiAbi = require("./ContractJson/Dai.json");
const tokenAbi = require("./ContractJson/Erc1155.json");

describe("NFT_Market", async ()=> {
    let NftMarket,nftMarket,link,dai,erc1155,owner,per1,per2Dai,per3Link,seller1,balanceOwner,balanceSeller;

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

        await network.provider.send("hardhat_setBalance", [
            per2Dai.address,
            ethers.utils.formatBytes32String("5000000000000000000"),
        ]);

        await network.provider.send("hardhat_setBalance", [
            per3Link.address,
            ethers.utils.formatBytes32String("5000000000000000000"),
        ]);
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

    describe ("Process of removing sale", async ()=> {

        it("Error: Only seller can delete", async ()=> {
            await expect(nftMarket.connect(per1).sellerDelateSale(1)).to.be.revertedWith("Not be owner of sale");
        });

        it("Seller should be able to remove", async ()=> {
            await nftMarket.connect(seller1).sellerDelateSale(1);

            let [,,,,,,,exist] = await nftMarket.connect(owner).saleData(1);
            expect(exist).to.equal(false);
        });

        after(async ()=> {
            await nftMarket.connect(seller1).registTokenSale(erc1155.address, 77, 10, 86400, 100);
        });
    });

    describe("Purchasing process", async ()=> {

        describe("Buy with ETH", async ()=> {

            it("Error: If there is no offer to sell, do not buy", async ()=> {
                await expect(nftMarket.connect(per1).
                buyTokenWithEth(
                    1,
                    {value: ethers.utils.parseEther("0.036")}
                )).to.be.revertedWith("This order for sale no exist");
            });

            it("Error: If the time limit passes, you should not buy", async ()=> {
                await network.provider.send("evm_increaseTime", [86450]);

                await expect(nftMarket.connect(per1).
                buyTokenWithEth(
                    2,
                    {value: ethers.utils.parseEther("0.036")}
                )).to.be.revertedWith("The time for buy this token ended");

                await nftMarket.connect(seller1).sellerDelateSale(2);

                let [,,,,,,,exist] = await nftMarket.connect(owner).saleData(2);
                expect(exist).to.equal(false);
            });

            it("Error: If don't pay enough you shouldn't buy", async ()=> {
                await nftMarket.connect(seller1).registTokenSale(erc1155.address, 77, 10, 86400, 100);

                await expect(nftMarket.connect(per1).
                buyTokenWithEth(
                    3,
                    {value: ethers.utils.parseEther("0.000000005")}
                )).to.be.revertedWith("Pay is not enaugh");
            });

            it("Error: If there is no aprove you should not buy", async ()=> {

                await expect(nftMarket.connect(per1).
                buyTokenWithEth(
                    3,
                    {value: ethers.utils.parseEther("0.036")}
                )).to.be.revertedWith("ERC1155: caller is not owner nor approved");
            });

            it("User should be able to buy", async ()=> {

                balanceOwner = await ethers.provider.getBalance(owner.address);
                balanceSeller = await ethers.provider.getBalance(seller1.address);
                await erc1155.connect(seller1).setApprovalForAll(nftMarket.address, true);

                await nftMarket.connect(per1).
                buyTokenWithEth(
                    3,
                    {value: ethers.utils.parseEther("0.037")}
                );

                expect(await erc1155.connect(seller1).balanceOf(seller1.address, 77)).to.equal(3);
                expect(await erc1155.connect(per1).balanceOf(per1.address, 77)).to.equal(10);
            });

            it("The owner and the seller must receive their percentages", async ()=> {

                let payOwner = "356506200000000";
                let paySeller = "35294113800000000";

                let newBalanceOwner = await ethers.provider.getBalance(owner.address);
                let newBalanceSeller = await ethers.provider.getBalance(seller1.address);

                let ownerWin = (newBalanceOwner - balanceOwner);
                let ownerLossWithGas = Number(payOwner) - ownerWin;

                let sellerWin = (newBalanceSeller - balanceSeller);
                let sellerLossWithGas = Number(paySeller) - sellerWin;

                expect(ownerLossWithGas + ownerWin).to.equal(Number(payOwner));
                expect(sellerLossWithGas + sellerWin).to.equal(Number(paySeller));
            });

            it("The sale should be removed", async ()=> {

                let [,,,,,,,exist] = await nftMarket.connect(owner).saleData(3);
                expect(exist).to.equal(false);
                await expect(nftMarket.connect(owner).sellerAcount(seller1.address,0)).to.be.reverted;
            });

            it("Should return the change", async ()=> {

                let balance = await ethers.provider.getBalance(nftMarket.address);
                expect(balance).to.equal(ethers.utils.parseEther("0"));
            });

            after(async()=> {
                await nftMarket.connect(per1).registTokenSale(erc1155.address, 77, 10, 86400, 100);
                await nftMarket.connect(seller1).registTokenSale(erc1155.address, 77, 3, 86400, 100);
            });
        });

        describe("Buy with Tokens ERC20", async()=> {

            describe("Buy with DAI Token", async ()=> {
                it("Error: If there is no aprove you should not buy", async ()=> {
                    
                    await expect(nftMarket.connect(per2Dai).
                        buyTokenWithERC20(
                        4,
                        0
                    )).to.be.revertedWith("Dai/insufficient-allowance");

                    await dai.connect(per2Dai).approve(nftMarket.address, 200);

                    await expect(nftMarket.connect(per2Dai).
                        buyTokenWithERC20(
                        4,
                        0
                    )).to.be.revertedWith("ERC1155: caller is not owner nor approved");
                });

                it("Should be able to buy", async ()=> {
                    await erc1155.connect(per1).setApprovalForAll(nftMarket.address, true);

                    await nftMarket.connect(per2Dai).
                        buyTokenWithERC20(
                        4,
                        0
                    );

                    expect(await erc1155.connect(per2Dai).balanceOf(per2Dai.address, 77)).to.equal(10);
                    expect(await erc1155.connect(per1).balanceOf(per1.address, 77)).to.equal(0);
                });

                it("The sale should be removed", async ()=> {

                    let [,,,,,,,exist] = await nftMarket.connect(owner).saleData(4);
                    expect(exist).to.equal(false);
                    await expect(nftMarket.connect(owner).sellerAcount(per1.address,0)).to.be.reverted;
                });

                it("The owner and the seller must receive their percentages", async ()=> {

                    let balanceSellerDai = await dai.connect(owner).balanceOf(per1.address);
                    let balanceOwnerDai = await dai.connect(owner).balanceOf(owner.address);
    
                    expect(balanceSellerDai).to.equal(99);
                    expect(balanceOwnerDai).to.equal(1);
                }); 
            });

            describe("Buy with LINK Token", async ()=> {

                it("Error: If there is no aprove you should not buy", async ()=> {
                    
                    await expect(nftMarket.connect(per3Link).
                        buyTokenWithERC20(
                        5,
                        1
                    )).to.be.reverted;
                });

                it("Should be able to buy", async ()=> {

                    await link.connect(per3Link).approve(nftMarket.address, 7);

                    await nftMarket.connect(per3Link).
                        buyTokenWithERC20(
                        5,
                        1
                    );

                    expect(await erc1155.connect(per3Link).balanceOf(per3Link.address, 77)).to.equal(3);
                    expect(await erc1155.connect(seller1).balanceOf(seller1.address, 77)).to.equal(0);
                });

                it("The sale should be removed", async ()=> {

                    let [,,,,,,,exist] = await nftMarket.connect(owner).saleData(5);
                    expect(exist).to.equal(false);
                    await expect(nftMarket.connect(owner).sellerAcount(seller1.address,0)).to.be.reverted;
                });

                it("The owner and the seller must receive their percentages", async ()=> {

                    let balanceSellerLink = await link.connect(owner).balanceOf(seller1.address);
                    let balanceOwnerLink = await link.connect(owner).balanceOf(owner.address);
    
                    expect(balanceSellerLink).to.equal("70000000000000000007");
                    expect(balanceOwnerLink).to.equal(0);
                });
            });
        });
    });

    describe("Fee Changes", async ()=> {

        it("Error: Only admin changes fee", async ()=> {
            await expect(nftMarket.connect(per1).modificateFee(5)).to.be.reverted;
        });

        it("Error: Invalid fee amount", async ()=> {

            await expect(nftMarket.connect(owner).modificateFee(0)).to.be.revertedWith("This % not is valid");
            await expect(nftMarket.connect(owner).modificateFee(100)).to.be.revertedWith("This % not is valid");
        });

        it("Admin changes fee", async ()=> {
            await nftMarket.connect(owner).modificateFee(5);

            expect(await nftMarket.connect(owner).feeAmount()).to.equal(5);
        });
    });
});