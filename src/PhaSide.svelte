<script lang="ts">
  import { writable } from 'svelte/store';
  import { Address, PhantasmaLink, ScriptBuilder, Base16 } from 'phantasma-ts';
  import { PhantasmaAPI } from 'phantasma-ts/src/core';
  import ConnectWalletModal from './ConnectWalletModal.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { LinkWallet, showModal, userAddress } from './store';
  import BigNumber from 'bignumber.js';

  let modal;
  let toEthereumAddress = ''; // Variable to store the user's input
  let availableCIT = writable(''); // Svelte store for available LOPL balance

  onMount(() => {
    showModal.subscribe(value => {
      if (value) {
        modal = new ConnectWalletModal({
          target: document.body,
          props: { showModal },
        });
      } else if (modal) {
        modal.$destroy();
      }
    });
  });

  onDestroy(() => {
    if (modal) {
      modal.$destroy();
    }
  });

  function ConnectToPhantasma() {
    connectWallet.set(true);
    showModal.set(true);
    console.log(modal)
  }

  let api, link;
  const SoftwareName = 'Phantasma Deposit';
  const TestnetURL = 'https://testnet.phantasma.io/rpc';
  const PhantasmaAPIClient = writable(new PhantasmaAPI(TestnetURL, null, 'testnet'));
  LinkWallet.set(new PhantasmaLink(SoftwareName, true));
  const connectWallet = writable(false);

  PhantasmaAPIClient.subscribe((value) => {
    api = value;
  });

  LinkWallet.subscribe((value) => {
    link = value;
  });

  function DisconnectPhantasmaWallet() {
    LinkWallet.set(new PhantasmaLink('', false));
    console.log('Wallet Disconnected!', 'Disconnected from Phantasma Wallet');
  }

  let address: string;
  userAddress.subscribe(value => {
    address = value;
  });

  function showPHAAddress() {
    console.log("phantasma address", address)
  }

  const gasPrice = 1000000;
  const gasLimit = 210000;

// Function to fetch the LOPL token balance for the connected wallet
async function fetchLOPLBalance(account, tokenSymbol, chainName) {
  try {
    const balanceInfo = await api.getTokenBalance(account, tokenSymbol, chainName);
    if (balanceInfo && balanceInfo.amount) {
      // Convert the balance to a human-readable format
      const balance = new BigNumber(balanceInfo.amount).shiftedBy(-18); // Adjust the -18 based on the number of decimals

      // Format the number with commas
      const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0, // You can adjust these values
        maximumFractionDigits: 18, // Adjust based on how many decimal places you want to show
      });
      const formattedBalance = formatter.format(balance);

      availableCIT.set(formattedBalance); // Set the formatted balance
    } else {
      availableCIT.set('0'); // If the balance info doesn't have the amount, set to '0' or appropriate default
    }
  } catch (error) {
    console.error('Error fetching LOPL balance:', error);
    availableCIT.set('Error fetching balance'); // Provide an error message or handle accordingly
  }
}



// Reactive statement to fetch the LOPL balance when the wallet connects
$: if (address && link) {
  fetchLOPLBalance(address, 'LOPL', 'main'); // Replace 'main' with the actual chain name if different
}

  async function GetTransactionByHash(txHash) {
    return await api.getTransaction(txHash);
  }

  // Svelte store for user input
  let transferAmount = writable(0);

  // Function to execute the Phantasma burn transaction
  export async function SendRawTransaction() {
    try {
      //const fromAddressString = Address.FromText(String(address)).Text;
      const fromAddressString = Address.FromText(String(link.account.address));
      console.log('FromAddressString:', fromAddressString);

      const contractName = "lopik";
      const methodName = "burn";
      const decimals = 18;

      const userAmount = new BigNumber($transferAmount).shiftedBy(decimals).toFixed();

      // Building the transaction script
      const sb = new ScriptBuilder();
      sb.AllowGas(fromAddressString, Address.Null.Text, gasPrice, gasLimit)
        .CallContract(contractName, methodName, [fromAddressString, toEthereumAddress, userAmount])
        .SpendGas(fromAddressString);
      const script = sb.EndScript();
      console.log('Script formed:', script);
      console.log('Script formed:', userAmount);
      
      // Define a payload if needed, encode to Base16
      const payload = Base16.encode('Burn from contract: ' + contractName);
      console.log('Payload:', payload);
      console.log('Script:', script);

      await link.signTx(script, payload, async  (txHash) => {
        console.log('Transaction sent:', txHash);
      }, async (error) => {
        console.error('Error sending transaction:', error);
      });

    } catch (error) {
      console.error("Error in SendRawTransaction:", error);
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
  <h1 class="mb-10">PHA To BSC Bridge</h1>

  {#if !address}
      <button
        id="connectToPhantasma"
        on:click={ConnectToPhantasma}
        class="transfer-button">Connect to Phantasma Wallet</button>
  {:else}
      <p class="address-container">Connected to Phantasma <br /><b>{address}</b></p>
      {#if $availableCIT !== ''}
      <p class="address-container">Available CIT: <br /><b>{$availableCIT}</b></p>
      {:else}
        <p class="balance-container">Fetching CIT balance...</p>
      {/if}
      <button
        id="signOutPhantasma"
        on:click={DisconnectPhantasmaWallet}
        class="transfer-button">Disconnect from Phantasma Wallet</button>
  {/if}

  <div class="input-container">
    <input
      class="amount-input"
      type="number"
      bind:value={$transferAmount}
      min="0"
      step="1"
      placeholder="Enter amount to transfer"
    />

    <input
      class="address-input"
      type="text"
      bind:value={toEthereumAddress}
      placeholder="Enter Ethereum address"
    />

    <button
      on:click={SendRawTransaction}
      class="transfer-button">
      Transfer CIT to BSC
    </button>
</div>

</main>
