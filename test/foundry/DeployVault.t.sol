// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {NFTXVaultFactoryUpgradeable} from "@src/NFTXVaultFactoryUpgradeable.sol";
import {NFTXVaultUpgradeable} from "@src/NFTXVaultUpgradeable.sol";
import {NFTXSimpleFeeDistributor} from "@src/NFTXSimpleFeeDistributor.sol";
import {MultiProxyController} from "@src/proxy/MultiProxyController.sol";

import {Test} from "forge-std/Test.sol";

contract DeployVaultTest is Test {
    NFTXVaultFactoryUpgradeable public vaultFactory;
    NFTXVaultUpgradeable public vaultImpl;
    NFTXSimpleFeeDistributor public feeDistributor;

    // ETH Mainnet
    uint256 internal constant BLOCK_NUMBER = 23488969;
    NFTXVaultFactoryUpgradeable public vaultFactoryProxy = NFTXVaultFactoryUpgradeable(0xBE86f647b167567525cCAAfcd6f881F1Ee558216);
    MultiProxyController multiProxyController = MultiProxyController(0x35fb4026dcF19f8cA37dcca4D2D68A549548750C);
    address constant MULTISIG = 0x673A039f6a959Fa9dB65D16781e6deFDe30375D9;
    address assetAddress = 0xc447597EfC493E36cCCA16707559Fb7238D0367c;

    function setUp() public {
        feeDistributor = new NFTXSimpleFeeDistributor();
        feeDistributor.__SimpleFeeDistributor__init__({
            _lpStaking: makeAddr("lpStaking"),
            _treasury: makeAddr("treasury")
        });

        vaultImpl = new NFTXVaultUpgradeable();
        vaultFactory = new NFTXVaultFactoryUpgradeable();
        vaultFactory.__NFTXVaultFactory_init({
            _vaultImpl: address(vaultImpl),
            _feeDistributor: address(feeDistributor)
        });

        feeDistributor.setNFTXVaultFactory(address(vaultFactory));
    }

    function test_createVault_Success() public {
        vm.startPrank(makeAddr("vaultCreator"));

        vm.mockCall(
            address(feeDistributor),
            abi.encodeWithSelector(NFTXSimpleFeeDistributor.initializeVaultReceivers.selector, 0),
            abi.encode('')
        );
        uint256 vaultId = vaultFactory.createVault({
            name: "Test Vault",
            symbol: "TV",
            _assetAddress: makeAddr("assetAddress"),
            is1155: false,
            allowAllItems: true
        });

        assertEq(vaultId, 0);
        
        NFTXVaultUpgradeable vault = NFTXVaultUpgradeable(vaultFactory.vault(vaultId));
        assertEq(vault.manager(), makeAddr("vaultCreator"));
        assertEq(vault.owner(), vaultFactory.owner());
    }

    function test_deployVault_Success_ForkedMainnet() public {
        // create fork
        vm.createSelectFork(vm.envString("MAINNET_RPC_URL"));
        vm.rollFork(BLOCK_NUMBER);
        assertEq(block.number, BLOCK_NUMBER);

        // upgrade Vault Factory implementation
        NFTXVaultFactoryUpgradeable newVaultFactoryImpl = new NFTXVaultFactoryUpgradeable();
        vm.prank(MULTISIG);
        multiProxyController.upgradeProxyTo(
            0,
            address(newVaultFactoryImpl)
        );
        
        // set new Vault implementation
        vaultImpl = new NFTXVaultUpgradeable();
        vm.prank(MULTISIG);
        vaultFactoryProxy.upgradeChildTo(address(vaultImpl));

        // deploy vault
        startHoax(makeAddr("vaultCreator"));
        uint256 vaultId = vaultFactoryProxy.createVault({
            name: "Test Vault",
            symbol: "TV",
            _assetAddress: assetAddress,
            is1155: false,
            allowAllItems: true
        });

        NFTXVaultUpgradeable vault = NFTXVaultUpgradeable(vaultFactoryProxy.vault(vaultId));
        assertEq(vault.manager(), makeAddr("vaultCreator"));
        assertEq(vault.owner(), vaultFactoryProxy.owner());
    }
}