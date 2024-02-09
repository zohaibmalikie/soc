import { PhantasmaLink } from 'phantasma-ts';
import { writable} from 'svelte/store';

export const userAddress = writable('');
export const showModal = writable(false);
export const LinkWallet = writable(new PhantasmaLink('', true));