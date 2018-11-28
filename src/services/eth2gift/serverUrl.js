// singleton - stores network info
const ServerUrlGetter = () => {
    let serverUrl = null;
    
    function setNetwork(networkId) {
	switch (networkId) {
	case '1':
	    serverUrl = 'http://ropsten.eth2phone.com:3006';
	    break;
	case '3':
	    //serverUrl = 'https://ropsten.eth2phone.com';
	    serverUrl = 'http://ropsten.eth2phone.com:3006';
	    break;	    
	default:
	    serverUrl = null;
	}
    }

    function getServerUrl() {
	if (!serverUrl) {
	    throw new Error("Verification server url error");
	}
	return serverUrl;
    }

    // api
    return {
	setNetwork,
	getServerUrl
    };
}

export default ServerUrlGetter();
