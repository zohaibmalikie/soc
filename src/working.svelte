<script>
    import { onMount } from 'svelte';
    import { PhantasmaAPI, ScriptBuilder, Decoder } from 'phantasma-ts';
    import { writable } from 'svelte/store';
  
    // Declare Svelte stores to hold the fetched data
    export let KcalReserve = writable('');
  
    const TestnetURL = 'https://testnet.phantasma.info/rpc';
    const RPC = new PhantasmaAPI(TestnetURL, null, 'testnet'); // Replace with the actual RPC URL
    const contractName = 'aaadexfin'; // Replace with your actual contract name
  
    // Function to fetch the KCAL reserve from the contract
    async function fetchKCALReserve() {
      // Create a new script builder
      let sb = new ScriptBuilder();
      // Build a script to call the 'getKCALReserve' method of the contract
      sb.CallContract(contractName, 'getKCALReserve', []);
      // Finalize the script
      let script = sb.EndScript();
  
      try {
        // Invoke the script on the mainnet and wait for the response
        let response = await RPC.invokeRawScript('main', script);
        // Decode the response using the Phantasma Decoder
        const decoder = new Decoder(response.result);  
        const result = decoder.readVmObject();
  
        // Log the decoded result to the console for debugging
        console.log('Decoded KCAL Reserve:', result);
  
        // Update the KCAL reserve writable store with the decoded result
        // This assumes the result is directly the value you want to display
        // If it's an object, you may need to access a specific property
        KcalReserve.set(result.toString());
      } catch (error) {
        // Log any errors to the console
        console.error('Error fetching KCAL reserve:', error);
        // Update the writable store to indicate an error occurred
        KcalReserve.set('Error');
      }
    }
  
    // When the component is mounted, fetch the KCAL reserve
    onMount(() => {
      fetchKCALReserve();
    });


    /*
// Derived store to automatically calculate the estimated SOUL output when KCAL input changes
  const estimateSoulOutput = derived(
    [kcalInput, KcalReserve, SoulReserve],
    ([$kcalInput, $KcalReserve, $SoulReserve]) => {
      if ($kcalInput && $KcalReserve && $SoulReserve) {
        const amountIn = parseFloat($kcalInput);
        const reserveIn = $KcalReserve; // KCAL reserve
        const reserveOut = $SoulReserve; // SOUL reserve
        const fee = 0.003; // 0.3% fee

        if (!isNaN(amountIn)) {
          // Calculate the estimated output using the formula provided
          const amountInWithFee = amountIn * (1 - fee);
          const numerator = amountInWithFee * reserveOut;
          const denominator = reserveIn + amountInWithFee;
          return (numerator / denominator).toFixed(8); // Assumes SOUL has 8 decimals
        }
      }
      return '0';
    }
  );

  // Subscribe to the derived store to set the estimated SOUL output
  estimateSoulOutput.subscribe($estimatedSoulOutput => {
    estimatedSoulOutput.set($estimatedSoulOutput);
  });

  
// Function to fetch the KCAL reserve from the contract
async function fetchKCALReserve() {
    let sb = new ScriptBuilder();
    sb.CallContract(contractName, 'getKCALReserve', []);
    const script = sb.EndScript();

    try {
      let response = await RPC.invokeRawScript('main', script);
      const decoder = new Decoder(response.result);  
      const result = decoder.readVmObject();

      console.log('Decoded KCAL Reserve:', result);
      KcalReserve.set(parseFloat(result));
    } catch (error) {
      console.error('Error fetching KCAL reserve:', error);
      KcalReserve.set(0);
    }
  }

  // Function to fetch the SOUL reserve from the contract
  async function fetchSOULReserve() {
    let sb = new ScriptBuilder();
    sb.CallContract(contractName, 'getSOULReserve', []);
    const script = sb.EndScript();

    try {
      let response = await RPC.invokeRawScript('main', script);
      const decoder = new Decoder(response.result);  
      const result = decoder.readVmObject();

      console.log('Decoded SOUL Reserve:', result);
      SoulReserve.set(parseFloat(result));
    } catch (error) {
      console.error('Error fetching SOUL reserve:', error);
      SoulReserve.set(0);
    }
  }

  // Function to fetch reserves from the smart contract
  async function fetchReserves() {
    await fetchKCALReserve();
    await fetchSOULReserve();
  }

  onMount(() => {
    fetchReserves();
  });
















    async function fetchKCALReserve() {
      let sb = new ScriptBuilder();
      sb.CallContract(contractName, 'getKCALReserve', []);
      let script = sb.EndScript();
  
      try {
        let response = await RPC.invokeRawScript('main', script);
        const decoder = new Decoder(response.result);  
        const result = decoder.readVmObject();
  
        console.log('Decoded KCAL Reserve:', result);
  
        KcalReserve.set(result.toString());
      } catch (error) {
        console.error('Error fetching KCAL reserve:', error);
        KcalReserve.set('Error');
      }
    }
    */
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
    <input type="text" bind:value={$KcalReserve} placeholder="KCAL Reserve" disabled />
    <!-- Removed the button since the stats will load on component mount -->
  </div>
  


