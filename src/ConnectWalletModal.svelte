<script lang="ts">
	import Modal from './lib/Modals/Modal.svelte';
	import { ModalType } from './lib/Modals/ModalType';
    import { writable} from 'svelte/store';
	import { PhantasmaLink } from 'phantasma-ts';
	import { createEventDispatcher } from 'svelte';
	import { LinkWallet, userAddress } from './store';
	import {showModal} from './store'

	let address;

	userAddress.subscribe(value => {
		address = value;
	});

	const SoftwareName = 'Phantasma Deposit';
	const connectWallet = writable(false);

	let _modalType = ModalType.Wallet;

	const dispatch = createEventDispatcher();

	const close = () => showModal.set(false);

	let Link: PhantasmaLink;

	LinkWallet.subscribe((value) => {
		Link = value;
	});

	const login = (providerHint: string | undefined) => {
		Link.login(
		function (success) {
			console.log('Wallet connected!', "You're now connected to your wallet.");
			LinkWallet.set(Link);
			userAddress.set(Link.account.address);
			connectWallet.set(false);
			close();
		},
		function (error) {
			console.log('Wallet connect Error!', "We couldn't connect to your wallet.");
			console.error('error');
		},
		2,
		'phantasma',
		providerHint
		);
	};

	LinkWallet.set(new PhantasmaLink(SoftwareName, true));
</script>

<Modal title="Connect wallet" modalType={_modalType} on:close={close}>
	<p class="text-sm font-normal text-gray-500 dark:text-gray-400">
		Connect with one of our available wallet providers or create a new one.
	</p>
	<ul class="my-4 space-y-3">
		<li>
			<a
				href="#"
				on:click={() => login('poltergeist')}
				class="flex items-center p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
			>
				<img src="SOUL.png" alt="poltergeist" class="w-8 h-8" />
				<span class="flex-1 ml-3 whitespace-nowrap">Poltergeist Wallet</span>
				<span
					class="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400"
					>Popular</span
				>
			</a>
		</li>
		<li>
			<a
				href="#"
				on:click={() => login('ecto')}
				class="flex items-center p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
			>
				<img src="ectoIcon.png" alt="poltergeist" class="w-8 h-8 rounded-full" />
				<span class="flex-1 ml-3 whitespace-nowrap">Ecto Wallet</span>
			</a>
		</li>
	</ul>
</Modal>
