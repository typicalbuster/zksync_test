const hre = require('hardhat');
const { ether, expect, constants } = require('@1inch/solidity-utils');
const { utils, Wallet, Provider } = require('zksync-web3');
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

const ZK_SYNC_WALLET_PK = '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110'

describe('ZkSync 2.0 paymaster integration test', function () {

    async function initContracts () {
        const provider = Provider.getDefaultProvider();

        const addr1 = new Wallet(ZK_SYNC_WALLET_PK, provider, ethers.provider);

        const deployer = new Deployer(hre, addr1);
        const Empty = await deployer.loadArtifact('Empty');
        const empty = await deployer.deploy(Empty);
        const ERC20PermitMock = await deployer.loadArtifact('ERC20PermitMock');
        const TokenMock = await deployer.loadArtifact('TokenMock');
        const DAI = await deployer.deploy(TokenMock, ['DAI', 'DAI']);
        const WETH = await deployer.deploy(ERC20PermitMock, ['WETH', 'WETH', addr1.address, ether('1000')])
        await DAI.mint(addr1.address, ether('1000'))
        const USDC = await deployer.deploy(TokenMock, ['USDC', 'USDC'])
        await USDC.mint(addr1.address, ether('1000'))
        const tokens = {
            DAI,
            WETH,
            USDC,
            ETH: {
                address: constants.ZERO_ADDRESS,
                balanceOf: ethers.provider.getBalance,
                decimals: () => 18,
            },
        };
        return { addr1, tokens };
    };

    it('try deploy', async function () {
        const { addr1, tokens } = await loadFixture(initContracts);
    });
});
