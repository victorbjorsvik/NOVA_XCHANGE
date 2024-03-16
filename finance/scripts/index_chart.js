
function generateHSLColors(saturation, lightness, count) {
    let colors = [];
    for (let i = 0; i < count; i++) {
        const hue = i * (360 / count);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}

async function fetchPortfolioData() {
    try {
        const response = await fetch('/API_portfolio');
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
    const values = [data.cash.cash, ...data.portfolio.map(item => item.total_current)];

    // Use the generateHSLColors function to create as many colors as there are data points
    const pieColors = generateHSLColors(70, 50, labels.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: pieColors,
                borderColor: pieColors.map(color => color.replace('hsl', 'hsla').replace('%)', ', 1%)')), // darker border
                borderWidth: 0.0
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


async function fetchAPI_balanceData() {
    try {
        const response = await fetch('API_balance');
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
    const balanceByDate = transactions.reduce((acc, { date, balance }) => {
        // Format date to YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split('T')[0];
        if (!acc[formattedDate]) {
            acc[formattedDate] = { totalBalance: 0, count: 0 };
        }
        acc[formattedDate].totalBalance += balance;
        acc[formattedDate].count += 1;
        return acc;
    }, {});

    const averageBalancePerDay = Object.entries(balanceByDate).map(([date, { totalBalance, count }]) => {
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