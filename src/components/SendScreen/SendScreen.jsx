import React, { Component } from "react";
import { connect } from "react-redux";
import TokenImage from "./../common/TokenImage";
import { buyGift } from "../../actions/transfer";
import NumberInput from "./../common/NumberInput";
import ButtonPrimary from "./../common/ButtonPrimary";
import { Error, ButtonLoader } from "./../common/Spinner";
import QuestionButton from "./../common/QuestionButton";
import CharityPopUp from "./../common/CharityPopUp";
import { utils } from "ethers";
import cryptoxmasService from "../../services/cryptoxmasService";
import styles from "./styles";
import BigNumber from "bignumber.js";

class SendScreen extends Component {
  constructor(props) {
    super(props);

    const cardId = props.match.params.cardId;
    const card = cryptoxmasService.getCard(cardId);
    this.state = {
      amount: utils.parseEther(String(card.price)),
      addedEther: 0,
      errorMessage: "",
      fetching: false,
      buttonDisabled: false,
      numberInputError: false,
      cardId,
      card,
      cardMessage: "",
      charityPopupShown: false,
      tokensLeft: 0,
      addFieldsShown: false,
      totalShown: false,
      fullDescriptionShown: false,
      DAIAmount: utils.parseEther("0")
    };
  }

  async componentDidMount() {
    const category = await cryptoxmasService.getCardCategory(
      this.state.card.tokenUri
    );
    const tokensLeft = this.state.card.maxQnty - category.minted;
    this.setState({
      tokensLeft
    });
  }

  async _buyGift() {
    //   try {
    const transfer = await this.props.buyGift({
      message: this.state.cardMessage,
      amount: utils.formatEther(this.state.amount),
      cardId: this.state.cardId,
      DAIAmount: utils.formatEther(this.state.DAIAmount)
    });
    this.props.history.push(`/transfers/${transfer.id}`);
    /*  } catch (err) {
      let errorMsg = err.message;
      if (err.isOperational) errorMsg = "User denied transaction";
      this.setState({ fetching: false, errorMessage: errorMsg });
     }*/
  }

  _onSubmit() {
    // check amount
    if (this.state.amount <= 0) {
      this.setState({
        fetching: false,
        errorMessage: "Amount should be more than 0",
        numberInputError: true
      });
      return;
    }

    // disabling button
    this.setState({ fetching: true });

    // sending transfer
    setTimeout(() => {
      // let ui update
      this._buyGift();
    }, 100);
  }

  _renderForm() {
    const description = this.state.card.metadata.description;
    let messageInputHeight = 50;
    let nftPrice = this.state.card.price;
    let claimFee = 0.01;
    let descriptionHeight = 44;
    let descriptionWidth = 270;
    if (this.state.fullDescriptionShown || description.length < 64) {
      descriptionHeight = "unset";
      descriptionWidth = 300;
    }
    if (this.state.cardMessage.length) {
      messageInputHeight = 100;
    }
    if (this.state.cardMessage.length > 60) {
      messageInputHeight = 50 + (this.state.cardMessage.length / 20) * 25;
    }
    return (
      <div>
        <div style={styles.sendscreenTitleContainer}>
          <div style={styles.sendscreenGreenTitle}>Pack your gift</div>
          <div style={styles.subtitle}>
            Send card to your friend &<br /> donate card price to Venezuela
          </div>
        </div>

        <div style={styles.tokensLeft}>
          {this.state.tokensLeft} out of {this.state.card.maxQnty} left
        </div>
        <TokenImage
          price={nftPrice}
          rarity={this.state.card.category}
          url={this.state.card.metadata.image || ""}
          name={this.state.card.metadata.name}
        />
        <div
          onClick={() => this.setState({ fullDescriptionShown: true })}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <div
            style={{
              ...styles.description,
              height: descriptionHeight,
              width: descriptionWidth
            }}
          >
            {description}
          </div>
          {this.state.fullDescriptionShown || description.length < 64 ? (
            ""
          ) : (
            <div style={styles.fullDescriptionArrowContainer}>
              <span>... </span>
              <i
                className="fa fa-caret-down"
                style={styles.fullDescriptionArrow}
              />
            </div>
          )}
        </div>
        {this.state.addFieldsShown ? (
          <div>
            <NumberInput
              onChange={({ target }) => {
                const amount = utils
                  .parseEther(String(target.value) || "0")
                  .add(utils.parseEther(String(nftPrice)));
                this.setState({
                  amount,
                  addedEther: parseFloat(target.value || 0),
                  numberInputError: false,
                  errorMessage: ""
                });
              }}
              disabled={false}
              style={{ touchInput: "manipulation" }}
              className="no-spinners"
              min="0"
              placeholder="Add ETH amount"
              type="number"
              readOnly={false}
              error={this.state.numberInputError}
            />
            <div style={{ marginTop: 20 }}>
              <NumberInput
                onChange={({ target }) => {
                  const DAIAmount = utils.parseEther(
                    String(target.value) || "0"
                  );
                  this.setState({ DAIAmount });
                }}
                disabled={false}
                style={{ touchInput: "manipulation" }}
                className="no-spinners"
                min="0"
                placeholder="Add DAI amount"
                type="number"
                readOnly={false}
                error={this.state.numberInputError}
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <NumberInput
                onChange={({ target }) =>
                  this.setState({
                    cardMessage: target.value
                  })
                }
                componentClass="textarea"
                rows={3}
                height={messageInputHeight}
                disabled={false}
                placeholder="Add gift message?"
                type="text"
                readOnly={false}
                error={this.state.numberInputError}
                maxLength={80}
                textAlign={this.state.cardMessage ? "left" : "center"}
              />
            </div>
          </div>
        ) : (
          ""
        )}
        <div style={styles.sendButton}>
          <ButtonPrimary
            disabled={this.state.tokensLeft === 0}
            handleClick={this._onSubmit.bind(this)}
          >
            {this.state.fetching ? <ButtonLoader /> : "Buy & Send"}
          </ButtonPrimary>

          <div>
            {this.state.fetching || this.state.errorMessage ? (
              <Error
                fetching={this.state.fetching}
                error={this.state.errorMessage}
              />
            ) : null}
          </div>
          <div>
            <div
              onClick={() =>
                this.setState({ addFieldsShown: !this.state.addFieldsShown })
              }
              className="hover"
              style={styles.infoTextContainer}
            >
              Add personal message &<br />
              ETH &/or DAI for your friend{" "}
              <i
                className={
                  this.state.addFieldsShown
                    ? "fa fa-caret-up"
                    : "fa fa-caret-down"
                }
              />
            </div>
          </div>
        </div>

        <div style={{ ...styles.sendscreenGreyText, color: "white" }}>
          <span
            onClick={() => this.setState({ totalShown: true })}
            style={{ fontFamily: "Inter UI Bold" }}
          >
            Total price: {utils.formatEther(this.state.amount)} ETH{"  "}
            <i className={this.state.totalShown ? "" : "fa fa-caret-down"} />
          </span>
          {this.state.totalShown ? (
            <div>
              {this.state.addedEther ? (
                <div>Receiver will get: {this.state.addedEther} ETH</div>
              ) : (
                ""
              )}
              <span>
                Donation: {(nftPrice - 0.01).toFixed(2)} ETH (NFT price minus
                network fees)
              </span>
              <br />
              <span>Network fee: {claimFee} ETH (for Gas)</span>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }

  render() {
    return <div>{this._renderForm()}</div>;
  }
}

export default connect(
  state => ({
    networkId: state.web3Data.networkId,
    balanceUnformatted: state.web3Data.balance
  }),
  { buyGift }
)(SendScreen);
