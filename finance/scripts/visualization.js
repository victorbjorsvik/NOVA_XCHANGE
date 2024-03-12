// ############################################ Api for History #############################################
// https://docs.coincap.io/
//var requestOptions = {
//    method: 'GET',
//    redirect: 'follow'
//  };

//  fetch("api.coincap.io/v2/assets/bitcoin/history?interval=d1", requestOptions)
//    .then(response => response.text())
//    .then(result => console.log(result))
//    .catch(error => console.log('error', error));


// ############################################ Pie Chart #############################################

//<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
//</head>
//<body>
//    <canvas id="myPieChart" width="400" height="400"></canvas>
//    <script src="script.js"></script>


async function fetchPortfolioData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/API_portfolio');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function createPieChart() {
    const data = await fetchPortfolioData();

    const ctx = document.getElementById('myPieChart').getContext('2d');
    const labels = ['Cash', ...data.portfolio.map(item => item.coin)];
    const values = [
        data.cash.cash,
        ...data.portfolio.map(item => item.total_current)
    ];

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Portfolio Distribution'
                }
            }
        }
    });
}

createPieChart();

// ############################################ Line Chart #############################################


async function fetchAPI_balanceData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/API_balance');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function createLineChart() {
    const rawData = await fetchAPI_balanceData();
    const transactions = rawData.transactions;

    // Preparing the data for the chart
    const labels = transactions.map(transaction => new Date(transaction.date).toLocaleString());
    const data = transactions.map(transaction => transaction.balance);

    const ctx = document.getElementById('balanceChart').getContext('2d');

    new Chart(ctx, {
        type: 'line', // Changing chart type to 'line'
        data: {
            labels: labels, // The dates of transactions
            datasets: [{
                label: 'Balance Over Time',
                data: data, // The balances of transactions
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        parser: 'YYYY-MM-DD HH:mm:ss',
                        tooltipFormat: 'll HH:mm'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Balance'
                    }
                }]
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Balance Evolution Over Time'
                }
            }
        }
    });
}

createLineChart();


//############################################# Line Chart balanced #############################################
async function fetchAPI_balanceData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/API_balance');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function createLineChart() {
    const rawData = await fetchAPI_balanceData();
    const transactions = rawData.transactions;

    // Grouping transactions by date and calculating average balance per day
    const balanceByDate = transactions.reduce((acc, {date, balance}) => {
        // Format date to YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split('T')[0];
        if (!acc[formattedDate]) {
            acc[formattedDate] = { totalBalance: 0, count: 0 };
        }
        acc[formattedDate].totalBalance += balance;
        acc[formattedDate].count += 1;
        return acc;
    }, {});

    const averageBalancePerDay = Object.entries(balanceByDate).map(([date, {totalBalance, count}]) => {
        return { date, averageBalance: totalBalance / count };
    });

    // Preparing the data for the chart
    const labels = averageBalancePerDay.map(item => item.date);
    const data = averageBalancePerDay.map(item => item.averageBalance);

    const ctx = document.getElementById('balanceChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Balance Over Time',
                data: data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'll',
                        displayFormats: {
                            day: 'YYYY-MM-DD'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Average Balance'
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Balance Evolution Over Time (Daily Average)'
                }
            }
        }
    });
}

createLineChart();