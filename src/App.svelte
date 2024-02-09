<script>
  import { Router, Route, Link } from 'svelte-routing';
  import SwapKCALtoSOUL from './SwapKcalSoul.svelte';
  import SwapSOULtoKCAL from './SwapSoulKcal.svelte';
  import AddLiquidity from './AddLP.svelte';
  import RemoveLiquidity from './RemoveLP.svelte';
  import CheckPoolHealth from './CheckPoolHealth.svelte';
</script>

<Router>

  <header class="header">
    <img src="/SOCLogo.png" alt="Company Logo" />
    <h1>Solar Operations Center</h1>
  </header>

  <nav class="flex justify-center space-x-4 my-4">
    <Link to="SwapKCALtoSOUL" class="transfer-button">
      Swap KCAL to SOUL
    </Link>
    <Link to="SwapSOULtoKCAL" class="transfer-button">
      Swap SOUL to KCAL
    </Link>
    <Link to="AddLiquidity" class="transfer-button">
      Add liquidity
    </Link>
    <Link to="RemoveLiquidity" class="transfer-button">
      Remove liquidity
    </Link>
    <Link to="CheckPoolHealth" class="transfer-button">
      Check pool status
    </Link>
  </nav>

  <Route path="SwapKCALtoSOUL" component={SwapKCALtoSOUL} />
  <Route path="SwapSOULtoKCAL" component={SwapSOULtoKCAL} />
  <Route path="AddLiquidity" component={AddLiquidity} />
  <Route path="RemoveLiquidity" component={RemoveLiquidity} />
  <Route path="CheckPoolHealth" component={CheckPoolHealth} />
</Router>

<style>
 .header {
  display: flex; /* Use flexbox */
  align-items: center; /* Vertically center the items in the header */
  justify-content: center; /* Center the items horizontally */
  padding: 20px;
}

.header img {
  max-width: 150px; /* Adjust as needed */
  height: auto;
  margin-right: 20px; /* Add some space between the logo and the title */
}

.header h1 {
  font-size: 3em;
  margin: 0; /* Remove margin to better align with the logo */
  color: #00FF00;
}

  /* Add other styles here */
</style>
