<script lang="ts">
  import { ethers } from 'ethers';
  import { writable, get } from 'svelte/store';
  import { parseUnits } from 'ethers';
  import { solidityPackedKeccak256 } from 'ethers';
  import { toBeArray } from 'ethers';

/* ----------------------------------- Connect to metamask ----------------------------------- */

const EthereumProvider = writable();
const EthereumSigner = writable();
const EthereumAddress = writable('');
const phaAddress = writable(''); // Store for the user-entered Phantasma address
const amountToTransfer = writable(0);

/* Reactive variables for the stores */
$: PHAAddress = get(phaAddress);
$: amount = get(amountToTransfer);

let provider = null;
let signer = null;
let account = null;
let availableCIT = '';  // Reactive variable to store the available CIT amount

const BRIDGE_ADDRESS = "0x2d63bdc5cd109d25657bD4b7c13c278d17b664bA";
const TOKEN_ADDRESS = "0x6Af108144ad69d22b6967fEB4988A4178AC86DC1";

 // Call the function when the account or signer changes
 $: if (account && signer) {
      fetchAvailableCIT();
    }

EthereumProvider.subscribe((_provider) => {
  provider = _provider;
});

EthereumSigner.subscribe((_signer) => {
  signer = _signer;
});

EthereumAddress.subscribe((_account) => {
  account = _account;
});

export async function ConnectToMetamask() {
  if (typeof window.ethereum !== 'undefined') {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);

    signer = await provider.getSigner();
    account = await signer.getAddress();

    EthereumSigner.set(signer);
    EthereumProvider.set(provider);
    EthereumAddress.set(account);

    alert('Connected to MetaMask');
    console.log('Account:', account);
    console.log('Signer:', signer);
    console.log('balances', await signer.provider.getBalance(account));
  } else {
      alert('Please Install Metamask.');
  }
}

export async function DisconnectFromMetamask() {
  // Reset the Ethereum provider, signer, and address states
  EthereumProvider.set(null);
  EthereumSigner.set(null);
  EthereumAddress.set('');

  // Additional logic to handle the disconnection might be necessary,
  // such as disabling any Ethereum-related functionality until reconnected.
}

// Function to fetch the available CIT amount for the connected wallet
async function fetchAvailableCIT() {
  if (!signer || !account) {
    console.error('Wallet not connected');
    return;
  }

  try {
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, token, signer);
    const balance = await tokenContract.balanceOf(account);
    const decimals = await tokenContract.decimals();
    let balanceInUnits = ethers.formatUnits(balance, decimals);

    // Format the balance with commas
    balanceInUnits = balanceInUnits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    availableCIT = balanceInUnits; // Assign the formatted balance
  } catch (error) {
    console.error('Error fetching available CIT:', error);
  }
}

/* ----------------------------------- TransferETH function ----------------------------------- */

 // Importing ABI of the contracts
  import BridgeBscABI from "./lib/Commands/BscBridgeBurn.json";
  import TokenBscABI from "./lib/Commands/CIT.json";

  const bridge = [...BridgeBscABI.abi, {
    "constant": true,
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getLatestNonce",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }];

  const token = TokenBscABI.abi;

  // Function to execute the eth transfer
  async function transferEth() {
    if (!signer) {
      alert('Please, connect your wallet first.');
      return;
    }

    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, token, signer);
    const bridgeContract = new ethers.Contract(BRIDGE_ADDRESS, bridge, signer);

    const nonce = await bridgeContract.getLatestNonce(account);


    console.log("Current nonce", nonce);

   
    let amount;
    amountToTransfer.subscribe(value => {
      amount = value; // Use the user-specified amount
    })();

    try {
      const decimals = await tokenContract.decimals();
      const amountInWei = parseUnits(amount.toString(), decimals);

      // Approve the bridgeContract to spend tokens
      const approval = await tokenContract.approve(BRIDGE_ADDRESS, amountInWei);
      await approval.wait();


      // Creating the hash and sending it
      const message = solidityPackedKeccak256(
        ['address', 'string', 'uint256', 'uint256'],
        [account, PHAAddress, amountInWei, nonce]
      );
      const signature = await signer.signMessage(toBeArray(message));

      // Calling the function of the BridgeEth contract
      const tx = await bridgeContract.burn(PHAAddress, amountInWei, nonce, signature);

      //Listening the events emited in eth side
      bridgeContract.on("Transfer", (from, to, amount, date, nonce, signature) => {
        let data = {
          from, to, amount, date, nonce, signature
        };
        console.log("emitted event:",data);
      });

      await tx.wait();
      console.log('Transfer completed successfully');
    } catch (error) {
      console.error('Error while transferring:', error);
    }

    
}

</script>

<style>
  .input-container {
    margin: 20px 0;
  }

  .amount-input {
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
    width: 100%; /* Responsive width */
    box-sizing: border-box; /* So padding doesn't affect width */
    margin-bottom: 10px;
  }
</style>

<main>
  <h1 class="mb-10">BSC To PHA Bridge</h1>

  {#if $EthereumAddress}
    <div class="address-container">
      <p>Connected to Ethereum <br /><b>{$EthereumAddress}</b></p>
    </div>
    <div class="address-container">
      <p>Available CIT for Transfer: <br /><b>{availableCIT}</b></p>
    </div>
    <button
      id="disconnectMetamask"
      class="transfer-button"
      on:click={DisconnectFromMetamask}>Disconnect from Metamask</button>
  {:else}
    <button
      id="connectMetamask"
      class="transfer-button"
      on:click={ConnectToMetamask}>Connect to Metamask</button>
  {/if}

  <div class="input-container">
    <input 
      class="amount-input"
      type="number" 
      bind:value={$amountToTransfer}
      placeholder="Enter amount to transfer"
    />
    
    <!-- Phantasma Address Input -->
    <input
      class="address-input"
      type="text"
      bind:value={PHAAddress}
      placeholder="Enter Phantasma address"
    />
    
    <button
      on:click={transferEth}
      class="transfer-button">
      Transfer CIT To Phantasma
    </button>
  </div>

  <!-- You can include other components or HTML elements here as needed -->
</main>




