document.addEventListener('DOMContentLoaded', async () => {
      // Function to populate the table with all coins
      async function populateTableWithAllCoins() {
        try {
            const response_3 = await fetch('https://api.coincap.io/v2/assets');
            const data_3 = await response_3.json();
            console.log(data_3);

            // Clear existing table rows
            const tbody = document.querySelector('.style-table tbody');
            tbody.innerHTML = '';
            // Populate the table with all coins' data
            data_3.data.forEach(coin => {
                const row = document.createElement('tr');
                ['id', 'symbol', 'priceUsd'].forEach((key, index) => { 
                    const cell = document.createElement('td');
                    if (index === 2) { 
                        const price = parseFloat(coin[key]).toFixed(2); 
                        cell.textContent = `$${price}`;
                    } else {
                        cell.textContent = coin[key];
                    }
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching all coins:', error);
        }
    }

    // Initial population of the table with all coins
    populateTableWithAllCoins();
    
    try {

      // Fetch api for all coins to populate table  
      const response_3 = await fetch('https://api.coincap.io/v2/assets');
      const data_3 = await response_3.json();
      console.log(data_3);

      // Extract the names of the coins for autocomplete
      const coinNames = data_3.data.map(coin => coin.id);
  
      // Get the search input element and datalist element
      const searchInput = document.getElementById('wide-search');
      const dataList = document.getElementById('coins-datalist');
  
      // Populate the datalist with options
      coinNames.forEach(coinName => {
        const option = document.createElement('option');
        option.value = coinName;
        dataList.appendChild(option);
      });
  
      const table = document.createElement('table');
      table.className = 'style-table';
   
      // Create table header
      const thead = document.createElement('thead');
      thead.className = 'style-thead';
      const headerRow = document.createElement('tr');
      ['ID', 'Symbol', 'Price'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      tbody.className = 'style-tbody';
   
      data_3.data.forEach(coin => {
      const row = document.createElement('tr');
      ['id', 'symbol', 'priceUsd'].forEach((key, index) => { // Make sure to include the index parameter here
          const cell = document.createElement('td');
          if (index === 2) { // Now index is defined and will be equal to 2 for the priceUsd column
              const price = parseFloat(coin[key]).toFixed(2); // Round to 2 decimal places
              cell.textContent = `$${price}`;
          } else {
              cell.textContent = coin[key];
          }
          row.appendChild(cell);
      });
      tbody.appendChild(row);
  });
      table.appendChild(tbody);
      const container = document.getElementById('all_coins');
      container.appendChild(table);
    } catch (error) {
      console.error('Error fetching all coins:', error);
    }
    const searchInput = document.getElementById('wide-search');
    const searchButton = document.getElementById('search-button');
  
    // Function to filter table rows based on the coin name
    function filterTableRows(coinName) {
      const table = document.querySelector('.style-table');
      const tbody = table.querySelector('tbody');
      const rows = tbody.getElementsByTagName('tr');
  
      Array.from(rows).forEach(row => {
        const cell = row.getElementsByTagName('td')[0]; // Assuming coin name is in the first column
        if (cell) {
          const cellText = cell.textContent || cell.innerText;
          if (cellText.toLowerCase() === coinName.toLowerCase()) {
            row.style.display = ""; // The row matches the search, so show it
          } else {
            row.style.display = "none"; // The row does not match the search, so hide it
          }
        }
      });
    }
  
    const priceWindow = document.createElement('div');
    priceWindow.classList.add('chart-box');
  
    // Create another div for the right side
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('chart-box');
    const searchCoinCanvas = document.createElement("canvas");
    searchCoinCanvas.id = "searchCoinCanvas";
  
    // Create a container div to hold both divs
    const divContainer = document.createElement('div');
    divContainer.classList.add('chart-container'); // Use this class for flexbox layout
    
    console.log('Event listener attached');
    searchButton.addEventListener('click', async () => {
      const coinName = searchInput.value.trim().replace(/\s+/g, '-').toLowerCase();
      const coinName_2 = searchInput.value.trim().toLowerCase();
      if (coinName) {
        filterTableRows(coinName_2);
        try {
          // Fetch coin price from CoinCap API
          const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}`);
          const data = await response.json();
          const { name, priceUsd } = data.data;
          const roundedPrice = parseFloat(priceUsd).toFixed(2);
          console.log(data);
   
          // Fetch user's cash balance from the server
          const response_2 = await fetch('/API_portfolio');
          const data_2 = await response_2.json();
          console.log(data_2);
          const cash = data_2.cash.cash.toFixed(2);
   
          priceWindow.innerHTML = `
                <h2>Do you want to buy ${name}?</h2>
                <p>Current Conditions:</p>
                <table class="price-table">
                  <tr>
                    <td>Price of 1 ${name}:</td>
                    <td>$${roundedPrice}</td>
                  </tr>
                  <tr>
                    <td>Available Cash:</td>
                    <td>$${cash}</td>
                  </tr>
                  <tr>
                    <td>Maximum Possible Amount:</td>
                    <td id='max_amount'>${(cash / roundedPrice).toFixed(2)}</td>
                </table>
                <br>
                <br>
                <br>
                <br>
                <p>Enter the Amount and Confirm the Transaction:</p>
                <div id="buy-form">
                <form action="/searchcoins" method="post">
                  <label for="amount">Amount:</label>
                  <input type="number" id="amount" name="amount" step="0.000001" min="0" required>
                  <input type="hidden" id="symbol" name="symbol" value="${coinName}">
                  <button type="submit" class="buy-button">Buy Now</button>
                </form>
                </div>
              `;
  
              async function fetchDataAndRenderChart() {
              try {
                  // Await the fetch call to complete and get the response
                  const response_searchChoin = await fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`);
  
                  // Await the conversion of the response to JSON
                  const data_searchChoin = await response_searchChoin.json();
  
                  // Once the data is obtained, call the function to render the chart
                  renderChart(data_searchChoin);
              } catch (error) {
                  // Log any errors that occur during the fetch or rendering process
                  console.error("Failed to fetch or render chart:", error);
              }
          }
  
          async function renderChart(data_searchChoin) {
              const ctx = document.getElementById('searchCoinCanvas').getContext('2d');
              const labels = data_searchChoin.data.map(item => new Date(item.time).toLocaleDateString());
              const dataPoints = data_searchChoin.data.map(item => parseFloat(item.priceUsd));
  
              const chart = new Chart(ctx, {
                  type: 'line',
                  data: {
                      labels: labels,
                      datasets: [{
                          label: 'Price USD',
                          data: dataPoints,
                          fill: false,
                          borderColor: 'rgb(75, 192, 192)',
                          tension: 0.1
                      }]
                  },
                  options: {
                      scales: {
                          y: {
                              beginAtZero: false
                          }
                      }
                  }
              });
          }
  
          fetchDataAndRenderChart();
  
  
            // Analytics Chart Content
            rightDiv.innerHTML = `
              <h2>${name} Development over Time</h2>
              <canvas id="searchCoinCanvas"></canvas>
            `;
            //rightDiv.appendChild(searchCoinCanvas);
  
            // Append both divs to the container
            divContainer.appendChild(priceWindow);
            divContainer.appendChild(rightDiv);
  
            // Append the container div to the main container instead of just the priceWindow
            const container = document.getElementById('container');
            container.appendChild(divContainer);
   
          // Pre-populate the symbol input field and show the buy form
          document.getElementById('symbol').value = coinName;
          document.getElementById('buy-form').style.display = 'block';
  
          // Show analytics graphs
          const analyticsWindow = document.getElementById('analytics');
          // JUSTIN add analytics code inside the try block here (All necessary data for analytics is in "data")
          const response_5 = await fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`)
          const data_5 = await response_5.json();
          console.log(data_5);
  
        } catch (error) {
          priceWindow.textContent = 'Error fetching coin price';
          document.getElementById('buy-form').style.display = 'none';
          document.getElementById('container').removeChild(divContainer);
          populateTableWithAllCoins();
          alert('Invalid coin name');
          searchInput.value = '';
        }
      } else {
        priceWindow.textContent = 'Please enter a coin name';
        document.getElementById('buy-form').style.display = 'none';
        populateTableWithAllCoins();
        alert('Invalid coin name');
        searchInput.value = '';
      }
  
      const buyForm = document.getElementById('buy-form');
      buyForm.addEventListener('submit', async (e) => {
      const numCoinsToBuy = parseFloat(document.getElementById('amount').value);
      const maxAmountElement = document.getElementById('max_amount'); // Get the max amount element
      const maxAmount = parseFloat(maxAmountElement.textContent); // Parse its content as float
      if (isNaN(numCoinsToBuy) || numCoinsToBuy <= 0) {
        e.preventDefault();
        alert('Please enter a valid amount');
      }
      else if (numCoinsToBuy > maxAmount) {
        e.preventDefault();
        alert('Insufficient funds');
      }
      else  {
        return;
      } 
    });
    });
  
  });