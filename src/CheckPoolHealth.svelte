<script>
  import { onMount } from 'svelte';
  import { PhantasmaAPI, ScriptBuilder, Decoder } from 'phantasma-ts';
  import { writable } from 'svelte/store';

  // Declare Svelte stores to hold the fetched data
  export let KcalReserve = writable('Loading...');
  export let SoulReserve = writable('Loading...');
  export let CaSoulBalance = writable('Loading...');
  export let CaKcalBalance = writable('Loading...');
  export let KcalFeePool = writable('Loading...');
  export let SoulFeePool = writable('Loading...');

  const TestnetURL = 'https://testnet.phantasma.info/rpc';
  const RPC = new PhantasmaAPI(TestnetURL, null, 'testnet'); // Replace with the actual RPC URL
  const contractName = 'zelxgna'; // Replace with your actual contract name

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  async function fetchContractData(methodName, decimals, symbol) {
    let sb = new ScriptBuilder();
    sb.CallContract(contractName, methodName, []);
    const script = sb.EndScript();

    try {
      const response = await RPC.invokeRawScript('main', script);
      const decoder = new Decoder(response.result);
      const result = decoder.readVmObject();
      console.log(`${methodName} result:`, result);

      // Assuming result is a number; if it's not, additional parsing may be required
      const number = parseInt(result, 10) / Math.pow(10, decimals);
      return `${formatNumber(number, decimals)} ${symbol}`;
    } catch (error) {
      console.error(`Error fetching data for ${methodName}:`, error);
      return 'Error fetching data';
    }
  }

  async function loadData() {
    KcalReserve.set(await fetchContractData('getKCALReserve', 10, 'KCAL'));
    SoulReserve.set(await fetchContractData('getSOULReserve', 8, 'SOUL'));
    CaSoulBalance.set(await fetchContractData('getSOULBalance', 8, 'SOUL'));
    CaKcalBalance.set(await fetchContractData('getKCALBalance', 10, 'KCAL')); // Adjust if necessary
    KcalFeePool.set(await fetchContractData('getKCALFeePool', 10, 'KCAL'));
    SoulFeePool.set(await fetchContractData('getSOULFeePool', 8, 'SOUL'));
  }

  onMount(() => {
    loadData();
  });
</script>
<style>
  .liquidity-container {
    display: flex;
    flex-direction: column;
    align-items: center; /* Centers the input fields horizontally */
    width: 100%; /* Ensures the container takes full width */
  }

  input {
    width: 50%; /* Adjust the width as needed */
    text-align: center; /* Centers the text inside the input fields */
    margin-bottom: 1rem;
    padding: 10px; /* Adds some padding inside the input fields */
    background-color: transparent; /* Makes the input fields transparent */
    border: 1px solid #00FF00; /* Adds a white border to the input fields */
    color: #00FF00; /* Sets the text color to white */
    font-size: 1.2rem; /* Increases the font size */
  }

  
</style>

<div class="liquidity-container">
  <h1>Pool Statistics</h1>
  <h2>KCAL Reserve</h2>
  <input type="text" bind:value={$KcalReserve} placeholder="KCAL Reserve" disabled />
  <h2>SOUL Reserve</h2>
  <input type="text" bind:value={$SoulReserve} placeholder="SOUL Reserve" disabled />
  <h2>Contract SOUL Balance</h2>
  <input type="text" bind:value={$CaSoulBalance} placeholder="Contract SOUL Balance" disabled />
  <h2>Contract KCAL Balance</h2>
  <input type="text" bind:value={$CaKcalBalance} placeholder="Contract KCAL Balance" disabled />
  <h2>KCAL Fee Pool</h2>
  <input type="text" bind:value={$KcalFeePool} placeholder="KCAL Fee Pool" disabled />
  <h2>SOUL Fee Pool</h2>
  <input type="text" bind:value={$SoulFeePool} placeholder="SOUL Fee Pool" disabled />
</div>