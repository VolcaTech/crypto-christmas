import chai from 'chai';
import {createMockProvider, deployContract, getWallets, solidity} from 'ethereum-waffle';
import {utils} from 'ethers';
import BasicNFT from './../build/NFT';
import CryptoxmasEscrow from './../build/cryptoxmasEscrow';
import { buyNFT } from './helpers';

chai.use(solidity);

const {expect} = chai;


describe('CryptoxmasEscrow', () => {
    let provider;
    let nft;
    let transitWallet;
    let escrow;
    let deployerWallet;
    let sellerWallet;
    let buyerWallet;
    let receiverWallet;
    let nftPrice;

    
    beforeEach(async () => {
	provider = createMockProvider();
	[deployerWallet, sellerWallet, buyerWallet, receiverWallet, transitWallet] = await getWallets(provider);

	// deploy NFT token
	nft = await deployContract(sellerWallet, BasicNFT, ["NFT Name", "NFT"]);
	await nft.mint(sellerWallet.address, 1);

	// deploy escrow contract
	nftPrice = utils.parseEther('0.05');
	escrow = await deployContract(deployerWallet, CryptoxmasEscrow, [nftPrice]);

	
	// add Seller for this token
	await escrow.addSeller(sellerWallet.address, nft.address);
	await nft.setApprovalForAll(escrow.address, true);
	
    });

    describe("Buying NFT", () =>  { 
	describe("without ETH for receiver", () => {
	    beforeEach(async () => {
		await buyNFT({
		    nftPrice,
		    transitAddress: transitWallet.address,
		    nftAddress: nft.address,
		    escrowAddress: escrow.address,
		    buyerWallet
		});
	    });
	    
	    
	    it('transfers token from seller to escrow', async () => {
		expect(await nft.ownerOf(1)).to.be.eq(escrow.address);
	    });

	    it('it saves gift to escrow', async () => {
		const gift = await escrow.getGift(transitWallet.address);
		expect(gift.sender).to.eq(buyerWallet.address);
		expect(gift.amount).to.eq(0);
		expect(gift.tokenAddress).to.eq(nft.address);
		expect(gift.tokenId).to.eq(1);
		expect(gift.status).to.eq(1); // not claimed
	    });

	    xit('transfers eth from buyer to escrow', async () => {
		
	    });
	});
	
	describe("with ETH for receiver", () => {
	    beforeEach(async () => {
		await buyNFT({
		    nftPrice: nftPrice * 2 ,
		    transitAddress: transitWallet.address,
		    nftAddress: nft.address,
		    escrowAddress: escrow.address,
		    buyerWallet
		});
	    });

	    it('transfers token from seller to escrow', async () => {
		expect(await nft.ownerOf(1)).to.be.eq(escrow.address);
	    });

	    it('it saves gift to escrow', async () => {
		const gift = await escrow.getGift(transitWallet.address);
		expect(gift.sender).to.eq(buyerWallet.address);
		expect(gift.amount).to.eq(nftPrice);
		expect(gift.tokenAddress).to.eq(nft.address);
		expect(gift.tokenId).to.eq(1);
		expect(gift.status).to.eq(1); // not claimed
	    });

	    xit('transfers eth from buyer to escrow', async () => {
		
	    }); 
	});

	
	describe("when seller doesn't have NFT", () => {
	    xit("it reverts", async () => {
		
	    });
	});
	describe("with less ETH than NFT price", () => {		
	    xit("it reverts", async () => {
	    });
	});		

    });

    describe("Cancelling", () =>  {
	describe("existing gift", () => { 
	    xit("it changes gift status", async () => {
	    });

	    xit("cannot cancel gift if not sender", async () => {
	    });
	});
	
	describe("not existing gift", () => { 
	    xit("can't cancel ", async () => {
	    });
	});
    });

    describe("Claiming", () =>  {
	describe("pending gift", () => {
	    describe("with correct signature ", () => { 
		xit("token goes to receiver", async () => {	    
		});

		xit("gift status updated to claimed", async () => {	    
		});		
		
		xit("eth goes to receiver", async () => {
		});
		
		xit("(NFT price - gas costs) goes to Giveth campaign", async () => {		    
		});

		xit("relayer is refunded for gas costs", () => {
		});
	    });
	    
	    describe("with incorrect signature ", () => { 
		xit("transaction reverts", async () => {
		});
	    });
	});

	describe("claimed gift", () => {
	    xit("can't claim the same gift twice", async () => {
	    });	    
	});

	describe("cancelled gift", () => {
	    xit("can't claim cancelled gift", async () => {
	    });	    
	});
	describe("not existing gift", () => {
	    xit("it reverts", async () => {
	    });	    
	});	
	
    });

    
});