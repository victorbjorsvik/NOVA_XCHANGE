fetch('/API_history') // Assuming your Flask server is serving the API at this endpoint
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('#trans_table');
    const table = document.createElement('table');
    table.className = 'style-table';

    // Create table header
    const thead = document.createElement('thead');
    thead.className = 'style-thead';
    const headerRow = document.createElement('tr');
    ['Symbol', 'Amount', 'Price per Coin', 'Total Price', 'Transaction Date'].forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    tbody.className = 'style-tbody';

    // Reverse the order of the transactions
    const reversedTransactions = data.transactions.slice().reverse(); // Use slice() to copy and reverse() to reverse the order

    reversedTransactions.forEach(transaction => {
      const row = document.createElement('tr');
      ['symbol', 'amount', 'price', 'total', 'date'].forEach(key => {
        const cell = document.createElement('td');
        if (key === 'date') {
          const date = new Date(transaction[key]);
          cell.textContent = date.toLocaleString();
        } else if (key === 'price' || key === 'total') {
          const value = parseFloat(transaction[key]).toFixed(2);
          cell.textContent = `$${value}`;
        } else if (key === 'amount') {
          cell.textContent = parseFloat(transaction[key]).toFixed(4);
        } else if (key === 'symbol') {
          cell.textContent = transaction[key];
        } else {
          cell.textContent = "N/A";
        }
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  })
  .catch(error => { // Correct placement of .catch
    console.error('Error fetching API:', error);
  });