const form = document.getElementById('expense-form');
const transactionsList = document.getElementById('transactions-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
let transactions = [];
// Scroll to the transaction form on Get Started button click
document.querySelector('.cta-btn').addEventListener('click', () => {
  document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth' });
});

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = new Date(document.getElementById('date').value);
    const type = document.getElementById('type').value;

    const transaction = { id: Date.now(), amount, category, date, type };
    transactions.push(transaction);

    form.reset();
    updateUI();
    updateChart();
});

function updateUI() {
    transactionsList.innerHTML = '';
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        const { id, amount, category, date, type } = transaction;
        const transactionItem = document.createElement('li');
        transactionItem.innerHTML = `
            ${type === 'income' ? '+' : '-'}$${amount} | ${category} | ${date.toLocaleDateString()}
            <button onclick="deleteTransaction(${id})">Delete</button>
        `;
        transactionsList.appendChild(transactionItem);

        if (type === 'income') {
            totalIncome += amount;
        } else {
            totalExpenses += amount;
        }
    });

    const balance = totalIncome - totalExpenses;
    totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    balanceEl.textContent = `$${balance.toFixed(2)}`;
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateUI();
    updateChart();
}

// Export transactions as CSV
document.getElementById('export-csv').addEventListener('click', () => {
    if (transactions.length === 0) return alert("No transactions to export.");

    let csvContent = "data:text/csv;charset=utf-8,Amount,Category,Date,Type\n";
    transactions.forEach(({ amount, category, date, type }) => {
        const formattedDate = new Date(date).toLocaleDateString();
        csvContent += `${amount},${category},${formattedDate},${type}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Chart setup
const ctx = document.getElementById('expense-chart').getContext('2d');
let expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Expenses',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const category = tooltipItem.label;
                        const expensesForCategory = transactions.filter(t => t.category === category && t.type === 'expense');
                        const dates = expensesForCategory.map(t => t.date.toLocaleDateString()).join(', ');
                        return `${category}: $${tooltipItem.raw} ${dates}`;
                    }
                }
            }
        }
    }
});

// Update chart data
function updateChart() {
    const dataByDate = {};

    // Group transactions by date and category
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            const dateKey = transaction.date.toLocaleDateString(); // Group by date
            if (!dataByDate[dateKey]) dataByDate[dateKey] = {};
            if (!dataByDate[dateKey][transaction.category]) dataByDate[dateKey][transaction.category] = 0;
            dataByDate[dateKey][transaction.category] += transaction.amount;
        }
    });

    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];

    // Loop through grouped data to prepare chart labels and values
    Object.entries(dataByDate).forEach(([date, categories]) => {
        Object.entries(categories).forEach(([category, amount]) => {
            labels.push(`${date} - ${category}`);
            data.push(amount);
            backgroundColors.push('rgba(54, 162, 235, 0.6)');
            borderColors.push('rgba(54, 162, 235, 1)');
        });
    });

    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.data.datasets[0].backgroundColor = backgroundColors;
    expenseChart.data.datasets[0].borderColor = borderColors;
    expenseChart.update();
}

// Interactive Gradient Animation
document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector('.interactive');
    let curX = 0, curY = 0, tgX = 0, tgY = 0;

    const move = () => {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(move);
    };

    window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
    });

    move();
});
