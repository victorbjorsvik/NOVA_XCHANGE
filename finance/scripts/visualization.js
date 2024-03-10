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