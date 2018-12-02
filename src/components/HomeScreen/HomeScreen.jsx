import React, { Component } from "react";
import { connect } from "react-redux";
import { Row, Col } from "react-bootstrap";
import RetinaImage from "react-retina-image";
import { buyGift } from "../../actions/transfer";
import { Loader } from "./../common/Spinner";
import * as eth2gift from "./../../services/eth2gift";
import Footer from "./../common/poweredByVolca";

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: "",
      fetching: true,
      tokens: []
    };
  }

  async componentDidMount() {
    const tokens = await eth2gift.getGiftsForSale();
    this.setState({ fetching: false, tokens });
  }

  _renderToken(token, position) {
    const { tokenId, metadata } = token;
    return (
      <a style={{ display: "block" }} href={`/#/send/${tokenId}`} key={tokenId}>
        <div
          style={{
            display: "block",
            width: 170,
            height: 170,
            float: position,
            backgroundColor: "white",
            backgroundImage:
              "url(https://raw.githubusercontent.com/VolcaTech/eth2-assets/master/images/nft_border.png)",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: 5,
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            marginBottom: 30
          }}
        >
          <span
            style={{
              float: "right",
              margin: "8px 8px 0px 0px",
              color: "#4CD964",
              fontFamily: "Inter UI Bold",
              fontSize: 14
            }}
          >
            0.05 ETH
          </span>
          <RetinaImage
            className="img-responsive"
            style={{ margin: "auto" }}
            src={metadata.image}
          />
          <div
            style={{
              textAlign: "center",
              color: "black",
              fontFamily: "Inter UI Bold",
              fontSize: 14
            }}
          >
            {metadata.name}
          </div>
        </div>
      </a>
    );
  }

  render() {
    const column1 = this.state.tokens.filter((token, index) => index % 2 === 0);
    const column2 = this.state.tokens.filter((token, index) => index % 2 !== 0);
    return (
        <div style={{}}>
        <div
          style={{
            width: 414,
            margin: "auto",
            backgroundColor: "#474D5B",
            height: window.innerHeight,
            backgroundImage:
              "url(https://raw.githubusercontent.com/VolcaTech/eth2-assets/master/images/sparkles_tree.png)",
            backgroundPosition: "right top",
            backgroundRepeat: "no-repeat"
          }}
        >
          <Row>
            <div
              style={{
                width: 354,
                margin: "auto",
                marginTop: 50,
                textAlign: "left"
              }}
            >
              <div
                style={{
                  marginBottom: 25,
                  fontFamily: "Inter UI Medium",
                  fontSize: 30,
                  color: "#4CD964",
                  textAlign: "left"
                }}
              >
                Surprise your friend
                <br />
                with a Nifty & send
                <br />
                some Ether to charity
              </div>
              <div
                style={{
                  marginBottom: 50,
                  fontFamily: "Inter UI Regular",
                  fontSize: 18,
                  color: "#8B8B8B",
                  textAlign: "left"
                }}
              >
                *receiver doesn’t need a<br /> crypto wallet
              </div>
              <div
                style={{
                  marginBottom: 40,
                  fontFamily: "Inter UI Medium",
                  fontSize: 24,
                  color: "white",
                  textAlign: "left"
                }}
              >
                First, choose a Nifty
              </div>
            </div>
            <Col
              xs={6}
              sm={6}
              lg={6}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end"
              }}
            >
              {this.state.fetching || this.state.errorMessage ? (
                <Loader text="Getting tokens" />
              ) : (
                <div>{column1.map(t => this._renderToken(t, "right"))}</div>
              )}
            </Col>
            <Col
              xs={6}
              sm={6}
              lg={6}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
            >
              {this.state.fetching || this.state.errorMessage ? (
                <Loader text="Getting tokens" />
              ) : (
                <div>{column2.map(t => this._renderToken(t, "left"))}</div>
              )}
            </Col>
          </Row>
        </div>
        <Footer />
        </div>
    );
  }
}

export default connect(
  state => ({
    networkId: state.web3Data.networkId,
    balanceUnformatted: state.web3Data.balance
  }),
  { buyGift }
)(HomeScreen);
