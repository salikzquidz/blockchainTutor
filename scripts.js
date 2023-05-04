let contract;
let provider = null;

let currentAccount = null;
let chairperson;
let candidates = [];
let numberOfVoters;
let currElectionState;
let winningCandidate;

// Set the provider with Infura API Key
const network = "sepolia";
provider = ethers.getDefaultProvider(network, {
  infura: "", // Infura API KEY ---- keep it secret
});

// Set the contract object with the provider
contract = new ethers.Contract(contractAddress, abi, provider);

$(document).ready(function () {
  provider = ethers.getDefaultProvider(network, {
    infura: "", // Infura API KEY ---- keep it secret
  });

  window.ethereum
    .request({ method: "eth_accounts" })
    .then(handleAccountsChanged)
    .catch((err) => {
      console.error(err);
    });

  $(".enableEthereumButton").click(function () {
    getAccount();
  });

  async function getAccount() {
    const accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        if (err.code === 4001) {
          console.log("Please connect to MetaMask.");
        } else {
          console.error(err);
        }
      });
    const account = accounts[0];
    $(".showAccount").html("Account: " + currentAccount);
  }
});

// Detect Account Changes
window.ethereum.on("accountsChanged", handleAccountsChanged);

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    currentAccount = null;
    $(".enableEthereumButton").show();
    $(".showAccount").html("Please connect to MetaMask to cast your vote!");
    $(".contractAddress").hide();
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    $(".enableEthereumButton").hide();
    $(".contractAddress").show();
    $(".showAccount").html("Account: " + currentAccount);
    $(".contractAddress").html("Contract Address Provided: " + contractAddress);
  }
}

// Clickable hyperlink to Sepolia Explorer

$(".showAccount").click(function () {
  window.open(`https://sepolia.etherscan.io/address/${currentAccount}`);
});
$(".contractAddress").click(function () {
  window.open(`https://sepolia.etherscan.io/address/${contractAddress}`);
});

// Declare Getter Functions
async function getCandidates() {
  console.log("in getCandidates function");
  try {
    for (let i = 0; i < 5; i++) {
      let candidate = await contract.candidates(i);
      if (candidate) {
        console.log(i);
        candidates.push(candidate);
        $(".candidatesName").append(
          `\
          <li>${candidates[i][0]} - ${i}</li>\
        `
        );
        $(".candidatesNumber").append(
          `\
          <option value=${i}>${candidates[i][0]}</option>
          `
        );
      } else {
        break;
      }
    }
  } catch (error) {
    console.log(error);
  }
  console.log(candidates);
}

async function getChairPerson() {
  console.log("in getChairPerson function");
  try {
    chairperson = await contract.chairperson();
    $(".chairPerson").html(`${chairperson}`);
  } catch (error) {
    console.log(error);
  }
}

async function getNoOfVoters() {
  console.log("in getNoOfVoters function");
  try {
    numberOfVoters = await contract.numberOfVoters();
    $(".numberOfVoters").html(`${numberOfVoters}`);
  } catch (error) {
    console.log(error);
  }
}

async function getCurrElectionState() {
  console.log("in getCurrElectionState function");
  try {
    let state = await contract.state();
    if (state == 0) {
      currElectionState = "Created";
    } else if (state == 1) {
      currElectionState = "Started";
    } else {
      currElectionState = "Ended";
    }
    $(".currElectionState").html(`${currElectionState}`);
  } catch (error) {
    console.log(error);
  }
}

async function getWinningCandidate() {
  console.log("in getWinningCandidate function");
  try {
    winningCandidate = await contract.winningCandidate();
    $(".winningCandidate").html(`${winningCandidate}`);
  } catch (error) {
    console.log(error);
    if (error.message.includes("Ended")) {
      $(".winningCandidate")
        .html("<i>Election is not ended yet</i>")
        .css("color", "red");
    }
    console.log(error.message);
  }
}

// Call the contract - not changing any state
getCurrElectionState();
getWinningCandidate();
getCandidates();
getChairPerson();
getNoOfVoters();

// Admin Functions Click Button Handler

$(".giveRightToVoteButton").click(async function () {
  console.log("in giveRightToVoteButton handler");
  let address = $(".addressToGiveRightToVote").val();
  if (address.length !== 40) {
    console.log("Invalid length of Ethereum address");
    return;
  }

  window.ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount, // The user's active address.
          to: contractAddress, // 6Required except during contract publications.
          data:
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("giveRightToVote(address)"))
              .substring(0, 10) +
            "000000000000000000000000" +
            address, // The function selector plus the argument which is the address, the zero padding is to make it 64 length long
          // gasPrice: "0x09184e72aa00", // Customizable by the user during MetaMask confirmation.
          gas: "21000", // Customizable by the user during MetaMask confirmation.
        },
      ],
    })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error(error));
});

$(".startTheElection").click(async function () {
  console.log("in startTheElection handler");

  window.ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount, // The user's active address.
          to: contractAddress, // 6Required except during contract publications.
          data: ethers.utils
            .keccak256(ethers.utils.toUtf8Bytes("startVote()"))
            .substring(0, 10),
          // gasPrice: "0x09184e72aa00", // Customizable by the user during MetaMask confirmation.
          gas: "21000", // Customizable by the user during MetaMask confirmation.
        },
      ],
    })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error(error));
});

$(".endTheElection").click(async function () {
  console.log("in endTheElection handler");

  window.ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount, // The user's active address.
          to: contractAddress, // 6Required except during contract publications.
          data: ethers.utils
            .keccak256(ethers.utils.toUtf8Bytes("endVote()"))
            .substring(0, 10),
          // gasPrice: "0x09184e72aa00", // Customizable by the user during MetaMask confirmation.
          gas: "21000", // Customizable by the user during MetaMask confirmation.
        },
      ],
    })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error(error));
});

// Voter Click Button Handler

$(".registerAsVoter").click(async function () {
  console.log("in registerAsVoter handler");

  let address = $(".addressToRegister").val();
  if (address.length !== 7) {
    console.log("Invalid length of Matric Number");
    return;
  }

  let matricNoInHex = ethers.utils
    .hexZeroPad(ethers.utils.hexlify(1711083), 32)
    .slice(2); // remove the 0x

  window.ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount, // The user's active address.
          to: contractAddress, // 6Required except during contract publications.
          data:
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("registerAsVoter(uint256)"))
              .substring(0, 10) + matricNoInHex,
          // gasPrice: "0x09184e72aa00", // Customizable by the user during MetaMask confirmation.
          gas: "21000", // Customizable by the user during MetaMask confirmation.
        },
      ],
    })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error(error));
});

$(".vote").click(async function () {
  console.log("in vote handler");

  let selectedCandidate = $(".candidatesNumber").val();
  console.log(selectedCandidate);

  let selectedCandidateInHex = ethers.utils
    .hexZeroPad(ethers.utils.hexlify(+selectedCandidate), 32)
    .slice(2); // remove the 0x

  window.ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount, // The user's active address.
          to: contractAddress, // 6Required except during contract publications.
          data:
            ethers.utils
              .keccak256(ethers.utils.toUtf8Bytes("vote(uint256)"))
              .substring(0, 10) + selectedCandidateInHex,
          // gasPrice: "0x09184e72aa00", // Customizable by the user during MetaMask confirmation.
          gas: "21000", // Customizable by the user during MetaMask confirmation.
        },
      ],
    })
    .then((txHash) => console.log(txHash))
    .catch((error) => console.error(error));
});
