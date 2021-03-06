import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col, Grid } from "react-bootstrap";
import RetinaImage from "react-retina-image";
import cryptoxmasService from "../../services/cryptoxmasService";
import ButtonPrimary from "./../common/ButtonPrimary";
import { SpinnerOrError, Loader, ButtonLoader } from "./../common/Spinner";
import { getNetworkNameById } from "../../utils";
const qs = require("querystring");
import { claimGift } from "./../../actions/transfer";
import styles from "./styles";

class ReceiveScreen extends Component {
  constructor(props) {
    super(props);

    const queryParams = qs.parse(props.location.search.substring(1));
    const transitPrivateKey = queryParams.pk;
    this.networkId = queryParams.chainId || queryParams.n || "1";

    this.state = {
      errorMessage: "",
      fetching: true,
      gift: null,
      transitPrivateKey,
      claiming: false
    };
  }

  async componentDidMount() {
    try {
      const gift = await cryptoxmasService.getGift(
        this.state.transitPrivateKey
      );
      this.setState({
        fetching: false,
        gift
      });
    } catch (err) {
      console.log(err);
      this.setState({
        errorMessage: "Error occured while getting gift from blockchain!"
      });
    }
  }

  _checkNetwork() {
    if (this.networkId && this.networkId !== this.props.networkId) {
      const networkNeeded = getNetworkNameById(this.networkId);
      const currentNetwork = getNetworkNameById(this.props.networkId);
      const msg = `Transfer is for ${networkNeeded} network, but you are on ${currentNetwork} network`;
      alert(msg);
      throw new Error(msg);
    }
  }

  async _withdrawWithPK() {
    try {
      const { transitPrivateKey, gift } = this.state;
      const result = await this.props.claimGift({ transitPrivateKey, gift });
      this.props.history.push(`/transfers/${result.id}`);
    } catch (err) {
      console.log(err);
      this.setState({
        fetching: false,
        errorMessage: err.message,
        transfer: null
      });
    }
  }

  _onSubmit() {
    // // disabling button
    this.setState({ claiming: true });

    this._withdrawWithPK();
  }

  _renderForm() {
    if (this.state.fetching) {
      return <Loader text="Getting gift" />;
    }

    // if gift was already claimed
    if (this.state.gift.status !== "1") {
      return (
        <Row>
          <div style={styles.textContainer}>
            <div
              style={{
                ...styles.greenTitle,
                marginBottom: 25
              }}
            >
              Oops!
            </div>
            <div style={styles.whiteTitle}>Link is already claimed</div>
          </div>
          <img
            style={styles.gifContainer}
            src={
              "https://raw.githubusercontent.com/VolcaTech/eth2-assets/master/images/boom.gif"
            }
          />
        </Row>
      );
    }
    return (
      <div style={styles.textContainer}>
        <div
          style={{
            ...styles.greenTitle,
            marginBottom: 45
          }}
        >
          Your friend
          <br />
          sent you a gift
        </div>
        <RetinaImage
          className="img-responsive"
          style={{ margin: "auto" }}
          src="https://raw.githubusercontent.com/VolcaTech/eth2-assets/master/images/letter.png"
        />
        <div style={styles.button}>
          <ButtonPrimary
            handleClick={this._onSubmit.bind(this)}
            disabled={this.state.fetching}
            buttonColor="#2bc64f"
          >
            {this.state.claiming ? <ButtonLoader /> : "Claim"}
          </ButtonPrimary>
          <SpinnerOrError fetching={false} error={this.state.errorMessage} />
        </div>
      </div>
    );
  }

  render() {
    if (this.state.fetching) {
      return (
        <div style={{ height: window.innerHeight }}>
          <Loader
            text="Getting transfer details..."
            textLeftMarginOffset={-40}
          />
        </div>
      );
    }

    if (this.state.errorMessage) {
      return (
        <SpinnerOrError fetching={false} error={this.state.errorMessage} />
      );
    }

    return <div>{this._renderForm()}</div>;
  }
}

export default connect(
  state => ({
    networkId: state.web3Data.networkId,
    receiverAddress: state.web3Data.address
  }),
  { claimGift }
)(ReceiveScreen);
