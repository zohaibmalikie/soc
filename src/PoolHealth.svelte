<script>
    import { onMount } from 'svelte';
    import { PhantasmaAPI, ScriptBuilder, Decoder } from 'phantasma-ts';
    import { writable } from 'svelte/store';
  
    // Declare Svelte stores to hold the fetched data
    export let KcalReserve = writable('');
    export let SoulReserve = writable('');
    export let CaSoulBalance = writable('');
    export let CaKcalBalance = writable('');
    export let TotalFeePool = writable('');
    export let KcalFeePool = writable('');
    export let SoulFeePool = writable('');
  
    const TestnetURL = 'https://testnet.phantasma.info/rpc';
    const RPC = new PhantasmaAPI(TestnetURL, null, 'testnet'); // Replace with the actual RPC URL
    const contractName = 'aaadexfinh'; // Replace with your actual contract name
    
    async function fetchContractData(methodName) {
      let sb = new ScriptBuilder();
      sb.CallContract(contractName, methodName, []);
      const script = sb.EndScript();
  
      try {
        const response = await RPC.invokeRawScript('main', script);
        const result = new Decoder(response.result).readVmObject();
        // If result is an object with properties, handle appropriately
        // Assuming the result has a 'value' property that is the actual data
        console.log('RESULT FROM QUERY:', result);
        return result.value; // Adjust based on your contract's return structure
      } catch (error) {
        console.error(`Error fetching data for ${methodName}:`, error);
        return 'Error'; // Placeholder for error handling
      }
    }
  
    onMount(async () => {
      try {
        const kcalReserve = await fetchContractData('getKCALReserve');
        KcalReserve.set(kcalReserve);
  
        const soulReserve = await fetchContractData('getSOULReserve');
        SoulReserve.set(soulReserve);
  
        const caSoulBalance = await fetchContractData('getSOULBalance');
        CaSoulBalance.set(caSoulBalance);
  
        const caKcalBalance = await fetchContractData('getKCALBalance');
        CaKcalBalance.set(caKcalBalance);
  
        const totalFeePool = await fetchContractData('getTotalFeePool');
        TotalFeePool.set(totalFeePool);
  
        const kcalFeePool = await fetchContractData('getKCALFeePool');
        KcalFeePool.set(kcalFeePool);
  
        const soulFeePool = await fetchContractData('getSOULFeePool');
        SoulFeePool.set(soulFeePool);
      } catch (error) {
        console.error('Error fetching data from the contract:', error);
      }
    });
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
  
  
  </style>
  
  <div class="liquidity-container">
    <h1>Add Liquidity</h1>
    <input type="text" bind:value={KcalReserve} placeholder="KCAL Reserve" disabled />
    <input type="text" bind:value={SoulReserve} placeholder="SOUL Reserve" disabled />
    <input type="text" bind:value={CaSoulBalance} placeholder="Contract SOUL Balance" disabled />
    <input type="text" bind:value={CaKcalBalance} placeholder="Contract KCAL Balance" disabled />
    <input type="text" bind:value={KcalFeePool} placeholder="KCAL Fee Pool" disabled />
    <input type="text" bind:value={SoulFeePool} placeholder="SOUL Fee Pool" disabled />
    <input type="text" bind:value={TotalFeePool} placeholder="Total Fee Pool" disabled />
    <!-- Removed the button since the stats will load on component mount -->
  </div>
  