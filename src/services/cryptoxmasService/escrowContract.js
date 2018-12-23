import Promise from "bluebird";
import { utils } from "ethers";
import CryptoxmasEscrow from "../../../cryptoxmas-contracts/build/CryptoxmasEscrow.json";
import config from "../../../dapp-config.json";

class EscrowContractService {
  setup({ web3, network }) {
    this.web3 = web3;
    this.contractAddress = config[network].ESCROW_CONTRACT;
    this.network = network;
    // init contract object
    this.contract = web3.eth
      .contract(JSON.parse(CryptoxmasEscrow.interface))
      .at(this.contractAddress);
    Promise.promisifyAll(this.contract, { suffix: "Promise" });
  }

  async buyGift(
    tokenUri,
    transitAddress,
    amount,
    msgHash,
    erc20Address,
    erc20Value
  ) {
    console.log(...arguments)
    const weiAmount = this.web3.toWei(amount, "ether");
    const weiErc20Value = this.web3.toWei(erc20Value, "ether");
    const from = (await this.web3.eth.getAccountsPromise())[0];
    return this.contract.buyGiftPromise(
      tokenUri,
      this.web3.toHex(transitAddress),
      msgHash,
      erc20Address,
      weiErc20Value,
      {
        from,
        value: weiAmount
        //gas: 110000
      }
    );
  }

  async getBuyEvents(params) {
    return new Promise((resolve, reject) => {
      //
      const fromBlock = config[this.network].CONTRACT_BLOCK_DEPLOYMENT || 0;
      const eventsGetter = this.contract.LogBuy(params, { fromBlock });
      eventsGetter.get((error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    });
  }

  async getClaimEvents(params) {
    return new Promise((resolve, reject) => {
      //
      const fromBlock = config[this.network].CONTRACT_BLOCK_DEPLOYMENT || 0;
      const eventsGetter = this.contract.LogClaim(params, { fromBlock });
      eventsGetter.get((error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    });
  }

  async getCardCategory(tokenUri) {
    const c = await this.contract.getTokenCategoryPromise(tokenUri);
    return {
      categoryId: c[0].toNumber(),
      minted: c[1].toNumber(),
      maxQnty: c[2].toNumber(),
      price: c[3]
    };
  }

  async claimGift({ transitWallet, receiverAddress }) {
    const gasPrice = utils.parseUnits("20", "gwei");
    //const gasLimit = 200000;

    const args = [receiverAddress];
    const data = new utils.Interface(
      CryptoxmasEscrow.interface
    ).functions.claimGift.encode(args);
    const tx = await transitWallet.sendTransaction({
      to: this.contractAddress,
      value: 0,
      data,
      gasPrice
      //gasLimit
    });
    return tx;
  }
}

export default EscrowContractService;
