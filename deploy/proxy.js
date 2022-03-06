const CONTRACT_NAME = "NFT_Market";

module.exports = async ({ getNamedAccounts, deployments }) => {

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  
  const nftMarket = await deploy("NFT_Market", {
    from: deployer,
    proxy: {
      owner: deployer,
      execute: {
        init:"cont",
      },
    },
  });

  console.log("Proxy address is: ", nftMarket.address);
};

module.exports.tags = [CONTRACT_NAME];