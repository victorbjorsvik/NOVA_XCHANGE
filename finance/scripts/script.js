// Get references to search bar, coin list element, and potential buy buttons
const searchBar = document.getElementById("search-bar");
const coinList = document.getElementById("coin-list");

// Function to filter coins based on search term
function filterCoins(searchTerm) {
  // Replace this with logic to fetch the complete coin list from your database or API
  const allCoins = [
    { symbol: "BTC", name: "Bitcoin", priceUsd: 23000 },
    { symbol: "ETH", name: "Ethereum", priceUsd: 1500 },
    // Add more coin objects
  ];

  // Filter coins based on search term case-insensitively
  const filteredCoins = allCoins.filter(
    (coin) => coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clear the existing coin list
  coinList.innerHTML = "";

  // Generate HTML for each filtered coin
  filteredCoins.forEach((coin) => {
    const coinElement = document.createElement("div");
    coinElement.classList.add("coin");
    coinElement.innerHTML = `
      <span class="coin-symbol">${coin.symbol}</span>
      <span class="coin-name">${coin.name}</span>
      <span class="coin-price">$${coin.priceUsd.toFixed(2)}</span>
      <button class="buy-button">Buy</button>
      <input type="number" min="0" placeholder="Amount">
    `;

    // Add click event listener to buy button (implementation not provided)
    coinElement.querySelector(".buy-button").addEventListener("click", () => {
      // Implement buy action here (e.g., call a function to handle the buy logic)
      console.log(`Buy button clicked for ${coin.symbol}`);
    });

    coinList.appendChild(coinElement);
  });
}

// Add event listener to search form submission
searchBar.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission behavior
  const searchTerm = searchBar.value.trim();
  filterCoins(searchTerm);
});

// Call filterCoins initially to display the full list on page load
filterCoins("");