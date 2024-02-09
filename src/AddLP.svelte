<script lang="ts">
  import { writable } from 'svelte/store';
  import { Address, PhantasmaLink, ScriptBuilder, Base16 } from 'phantasma-ts';
  import { PhantasmaAPI } from 'phantasma-ts/src/core';
  import ConnectWalletModal from './ConnectWalletModal.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { LinkWallet, showModal, userAddress } from './store';
  import BigNumber from 'bignumber.js';

 
  // Svelte stores
  let kcalInput = writable('');
  let soulOutput = writable('');
  let slippage = writable('');
  let modal;
  let inputKCAL = writable('');
  let inputSOUL = writable('');
  let LP = writable('');


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
  const TestnetURL = 'https://testnet.phantasma.info/rpc';
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

  const RPC = new PhantasmaAPI(TestnetURL, null, 'testnet'); // Replace with the actual RPC URL
  const contractName = 'aaadexfind'; // Replace with your actual contract name
  const methodName = 'swap'; // Replace with the actual method of your swap contract

//****----****----****----****----PERFORM ADD LIQUIDITY----****----****----****----****----****----
    
  // Function to execute the Phantasma burn transaction
  export async function addLiquidity() {
    try {
      //const fromAddressString = Address.FromText(String(address)).Text;
      const fromAddressString = Address.FromText(String(link.account.address));
      console.log('FromAddressString:', fromAddressString);

      const contractName = "zelxgnd";
      const methodName = "addLiquiditySOUL";
      const tokenIn = 'SOUL'; // The token you are swapping from
      const decimals = 8;

      const userAmount = new BigNumber($inputSOUL).shiftedBy(decimals).toFixed();

      // Building the transaction script
      const sb = new ScriptBuilder();
      sb.AllowGas(fromAddressString, Address.Null.Text, gasPrice, gasLimit)
        .CallContract(contractName, methodName, [fromAddressString, userAmount, tokenIn])
        .SpendGas(fromAddressString);
      const script = sb.EndScript();
      console.log('Script formed:', script);
      console.log('Script formed:', userAmount);
      
      // Define a payload if needed, encode to Base16
      const payload = Base16.encode('Swap from contract: ' + contractName);
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
    /* Add your CSS here */
    .liquidity-container {
      display: flex;
      flex-direction: column;
    }
  
    input {
      margin-bottom: 1rem;
    }
  
    button {
      padding: 0.5rem;
      cursor: pointer;
    }
  </style>
  
  
  <main>
    <h1 class="mb-10">Connect wallet</h1>
  
    {#if !address}
        <button
          id="connectToPhantasma"
          on:click={ConnectToPhantasma}
          class="transfer-button">Connect to Phantasma Wallet</button>
    {:else}
      <p class="address-container">Connected to Phantasma <br /><b>{address}</b></p>
      <button on:click={DisconnectPhantasmaWallet} class="transfer-button">Disconnect from Phantasma Wallet</button>
    {/if}
  
    <div class="liquidity-container">
      <h1>Add SOUL/KCAL Liquidity </h1>
      <input class="address-input" type="number" bind:value={$inputSOUL} placeholder="Input SOUL" />
      <input class="address-input" type="number" bind:value={inputKCAL} placeholder="Input KCAL" />
      <input class="address-input" type="number" bind:value={LP} placeholder="LP Tokens Granted" />
      <button class="transfer-button" on:click={addLiquidity}>Add Liquidity</button>
    </div>
  </main>