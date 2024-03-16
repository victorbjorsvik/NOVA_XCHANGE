fetch('/API_portfolio')
    .then(response => response.json())
    .then(data => {

        const accountNameElement = document.querySelector('#account-name');
        accountNameElement.textContent = data.cash.username;
        const container = document.querySelector('#positions');
        const table = document.createElement('table');
        table.className = 'style-table';

        // Create table header
        const thead = document.createElement('thead');
        thead.className = 'style-thead';
        const headerRow = document.createElement('tr');
        ['Coin', 'Amount', 'Price', 'Total', 'Sell Amount', 'Sell'].map((headerText, index) => {
            const th = document.createElement('th');
            th.textContent = headerText;
            if (index === 0 || index === 1 || index === 2 || index === 3) {
                th.style.width = '300px';
            } else {
                th.style.width = '50px';
            }
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        tbody.className = 'style-tbody';

        // Iterate over portfolio items
        data.portfolio.forEach((item, index) => {
            const row = document.createElement('tr');
            ['coin', 'amount', 'price_current', 'total_current', '', ''].forEach((key, cellIndex) => {
                const cell = document.createElement('td');
                if (cellIndex === 2 || cellIndex === 3) {
                    // Assuming the item[key] is a string that can be converted to a float
                    const roundedValue = parseFloat(item[key]).toFixed(2);
                    cell.textContent = roundedValue;
                    cell.textContent = `$${roundedValue}`;
                } else if (cellIndex === 4) {
                    // Create input field for 'Sell Amount' column
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = 'any'; // Allow floating-point values
                    input.min = 0;
                    input.max = item.amount;
                    cell.appendChild(input);
                } else if (cellIndex === 5) {
                    // Create sell button
                    const sellButton = document.createElement('button');
                    sellButton.className = "sell-button"; // Add the class for styling
                    sellButton.style.width = '50px';
                    sellButton.textContent = 'Sell';
                    sellButton.addEventListener('click', () => {
                        const sellAmount = row.getElementsByTagName('input')[0].value;
                        if (sellAmount > 0 && sellAmount <= item.amount) {
                            // Send form data to Flask server
                            const formData = {
                                coin: row.getElementsByTagName('td')[0].textContent,
                                amount: row.getElementsByTagName('input')[0].value,
                                index: index
                            };
                            sendFormToServer(formData);
                        } else {
                            alert('Invalid amount. Please enter amount between 0 and holdings amount');
                        }
                    });
                    cell.appendChild(sellButton);
                } else {
                    cell.textContent = item[key];
                }
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        // Function to send form data to Flask server
        function sendFormToServer(formData) {
            fetch('/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Sell order executed successfully');
                        // Refresh the page
                        window.location.reload();
                    } else {
                        return response.json().then(data => {
                            console.error('Error:', data.error);
                            alert(data.error);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        table.appendChild(tbody);
        container.appendChild(table);
    })
    .catch(error => {
        console.error('Error fetching API:', error);
    });
