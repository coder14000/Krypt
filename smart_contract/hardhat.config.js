require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const Private_Key = "4a20935ea7434256a12559bf3f0ef51174bf404397685f799f7eef1f354cb6a2"

module.exports = {
  solidity: "0.8.0",
  networks: {
  	goerli: {
  		url: `https://eth-goerli.g.alchemy.com/v2/vsWxjCAxv04l8VB3hrHsowAHFjmwoOTI`,
  		accounts: [`0x${Private_Key}`]
  	}
  }
};