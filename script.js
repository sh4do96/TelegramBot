
// Konfiguracja TON Connect
const tonConnectUI = new TONConnect.UI({
    manifestUrl: 'https://sh4do96.github.io/TelegramBot/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// Adres kontraktu tokena DOGS (zmień na właściwy)
const DOGS_TOKEN_ADDRESS = 'EQDcwc2whoTvG3Q81iztMKE1CHLZZdXGXgth2mxJ1cNmGgTi';
const DOGS_TOKEN_AMOUNT = '100000000'; // 100 DOGS (z odpowiednią liczbą zer)

// Elementy DOM
const connectButton = document.getElementById('connect-button');
const claimButton = document.getElementById('claim-button');
const tokenInfo = document.getElementById('token-info');

// Stan połączenia
let walletAddress = null;

// Funkcja inicjalizująca
async function init() {
    // Sprawdź czy portfel jest już połączony
    const walletConnectionData = await tonConnectUI.getWalletConnectionData();
    if (walletConnectionData) {
        walletAddress = walletConnectionData.address;
        onWalletConnected();
    }
}

// Obsługa połączenia portfela
connectButton.addEventListener('click', async () => {
    try {
        const wallet = await tonConnectUI.connectWallet();
        walletAddress = wallet.address;
        onWalletConnected();
    } catch (error) {
        console.error('Błąd połączenia:', error);
        alert('Nie udało się połączyć z portfelem');
    }
});

// Po połączeniu portfela
function onWalletConnected() {
    connectButton.style.display = 'none';
    tokenInfo.style.display = 'block';
    claimButton.disabled = false;
}

// Funkcja do tworzenia transakcji transferu tokenów
async function createTokenTransfer() {
    try {
        // Przygotowanie transakcji
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360, // 5 minut ważności
            messages: [
                {
                    address: 'EQDcwc2whoTvG3Q81iztMKE1CHLZZdXGXgth2mxJ1cNmGgTi',
                    amount: '10000000', // 0.01 TON na opłaty
                    payload: {
                        abi: 'te6ccgEBAQEAXQAA3wHAAwEBMQEwAgIDPQMCAQFIBAUAEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQBAgPNBgcAQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
                        method: 'mint',
                        params: {
                            to: walletAddress,
                            amount: DOGS_TOKEN_AMOUNT
                        }
                    }
                }
            ]
        };

        // Wysłanie transakcji
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transakcja wysłana:', result);
        alert('Tokeny zostały wysłane! Sprawdź swój portfel.');
    } catch (error) {
        console.error('Błąd transakcji:', error);
        alert('Wystąpił błąd podczas wysyłania tokenów');
    }
}

// Obsługa przycisku odbioru tokenów
claimButton.addEventListener('click', createTokenTransfer);

// Inicjalizacja
init();
