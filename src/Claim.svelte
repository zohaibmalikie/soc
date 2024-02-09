<script lang="ts">
    import { ethers } from 'ethers';
    import { writable, get } from 'svelte/store';
    import BridgeMintABI from "./lib/Commands/BscBridgeMint.json"; // Ensure correct path to ABI

  
    /* ----------------------------------- Connect to MetaMask ----------------------------------- */
  
    const EthereumProvider = writable();
    const EthereumSigner = writable();
    const EthereumAddress = writable('');
    const claimableTokensStore = writable([]);
  
    let provider = null;
    let signer = null;
    let account = null;
    let bridgeMintContract;
  
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

        // Initialize the contract
        bridgeMintContract = new ethers.Contract(
            '0xb71E11834B7c0a39FbfC4FB058fc129C82DbA374', // Contract address
            BridgeMintABI.abi, // ABI
            signer
        );

        alert('Connected to MetaMask');
        console.log('Account:', account);
        console.log('Signer:', signer);
        console.log('balances', await signer.provider.getBalance(account));
    } else {
        alert('Please Install Metamask.');
    }
    }

    export async function DisconnectFromMetamask() {
    EthereumProvider.set(null);
    EthereumSigner.set(null);
    EthereumAddress.set('');
    }
  
    /* ----------------------------------- Claim function ----------------------------------- */
  
    async function claimTokens(nonce) {
        try {
            if (!bridgeMintContract) throw new Error("Contract not initialized");

            const claim = $claimableTokensStore.find(claim => claim.nonce === nonce);
            console.log('Claim:', claim); // Debugging log

            if (!claim) {
                throw new Error("Claim not found");
            }

            // Ensure gasCost is a string in Wei
            const gasCost = claim.gasCost.toString();

            // Execute the claim
            console.log('Calling claimTokens with nonce:', nonce, 'and gasCost:', gasCost);
            console.log('Account Address:', account);
            console.log('Claim From Address:', claim[0]); // Adjust index based on how address is stored
            const tx = await bridgeMintContract.claimTokens(nonce, { value: gasCost });
            console.log('Transaction response:', tx);
            await tx.wait();
            

            alert('Tokens claimed successfully!');
            loadClaimableTokens(); // Refresh the list of claimable tokens
        } catch (error) {
            console.error(`Error while claiming tokens: ${error}`);
            alert(`Error while claiming tokens: ${error.message}`);
        }
    }

    // Unique identifier for each claim, combining nonce and timestamp
    function getClaimId(claim) {
        return `${claim.nonce}-${claim.timestamp}`;
    }

    async function loadClaimableTokens() {
        const address = get(EthereumAddress);
        if (!address || !bridgeMintContract) {
            console.log('Address or contract not available for loading tokens');
            return;
        }

        console.log('Fetching claimable tokens for', address);
        const currentTime = Math.floor(Date.now() / 1000);
        const [claims, nonces] = await bridgeMintContract.getPendingClaims(address);
        let uniqueClaimIds = new Set();

        const formattedClaims = claims.map((claim, index) => {
            const nonce = nonces[index];
            const claimTimestamp = claim.timestamp ? Number(claim.timestamp) : 0;

            const claimId = getClaimId({ nonce, timestamp: claimTimestamp });
            if (uniqueClaimIds.has(claimId)) {
                return null; // Skip duplicate claims
            }
            uniqueClaimIds.add(claimId);

            const expiryTime = claim.expiry ? Number(claim.expiry) : 0;
            const timeLeft = expiryTime > 0 ? expiryTime - currentTime : 0;
            const gasCost = claim.gasCost ? ethers.formatUnits(claim.gasCost, 'wei') : '0';

            return {
                ...claim,
                formattedAmount: claim.amount ? ethers.formatUnits(claim.amount, 18) : 'Unavailable',
                gasCost: gasCost,
                nonce: nonce,
                formattedGasCost: claim.gasCost ? ethers.formatUnits(claim.gasCost, 'wei') : 'Unavailable',
                formattedClaimableAmount: claim.claimableAmount ? ethers.formatUnits(claim.claimableAmount, 18) : 'Unavailable',
                formattedTimestamp: claimTimestamp > 0 ? new Date(claimTimestamp * 1000).toLocaleString() : 'Unavailable',
                formattedExpiry: expiryTime > 0 ? new Date(expiryTime * 1000).toLocaleString() : 'Unavailable',
                timeLeft: timeLeft > 0 ? timeLeft : 0,
                expired: claim.expired
            };
        }).filter(c => c !== null);

        claimableTokensStore.set(formattedClaims);
    }




</script>
  
  
 <!-- ...existing HTML and style... -->
<main>
    <h1 class="mb-10">Claim CIT Tokens On BSC</h1>

    {#if $EthereumAddress}
    <div class="address-container">
        <p>Connected to BSC <br /><b>{$EthereumAddress}</b></p>
    </div>
      <button on:click={DisconnectFromMetamask} class="transfer-button">Disconnect from MetaMask</button>
    {:else}
      <button on:click={ConnectToMetamask} class="transfer-button">Connect to MetaMask</button>
    {/if}

    <button on:click={loadClaimableTokens} class="transfer-button">Check Claimable Tokens</button>

    <div>
        <h2>Claimable Tokens</h2>
        {#if $claimableTokensStore.length === 0}
            <p>No tokens available to claim.</p>
        {:else}
            <ul>
                {#each $claimableTokensStore as claim}
                <li class="claim-item">
                    <div role="button" tabindex="0" on:click={() => claimTokens(claim.nonce)} on:keydown={(event) => event.key === 'Enter' && claimTokens(claim.nonce)}>
                        <p>Amount: {claim.formattedAmount} CIT</p>
                        <p>Gas Cost: {claim.formattedGasCost} ETH</p>
                        <p>Claimable Amount: {claim.formattedClaimableAmount} CIT</p>
                        <p>Timestamp: {claim.formattedTimestamp}</p>
                        <p>Expiry Date: {claim.formattedExpiry}</p>
                        <p>Time left to claim: {claim.timeLeft > 0 ? `${claim.timeLeft} seconds` : 'Expired'}</p>
                        <p>Expired: {claim.expired ? 'Yes' : 'No'}</p>
                    </div>
                </li>
                {/each}


            </ul>
        {/if}
    </div>
</main>