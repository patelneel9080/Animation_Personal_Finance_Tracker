// Get DOM elements
const form = document.getElementById('expense-form');
const transactionsList = document.getElementById('transactions-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');

// Data storage
let transactions = [];
// Export transactions as CSV with correct date formatting
function exportCSV() {
  if (transactions.length === 0) {
    document.getElementById('export-message').innerText = 'No transactions to export.';
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Amount,Category,Date,Type\n"; // CSV headers

  transactions.forEach(transaction => {
    const { amount, category, date, type } = transaction;
    const formattedDate = date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString(); // Format the date
    csvContent += `${amount},${category},${formattedDate},${type}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link); // Required for FF

  link.click();
  link.remove(); // Clean up

  document.getElementById('export-message').innerText = 'Exported successfully!';
}

// Attach the export function to the button
document.getElementById('export-csv').addEventListener('click', exportCSV);

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get form values
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = new Date(document.getElementById('date').value);
  const type = document.getElementById('type').value;

  // Create a new transaction object
  const transaction = { id: Date.now(), amount, category, date, type };
  transactions.push(transaction);

  // Clear the form
  form.reset();

  // Update the UI
  updateUI();
  updateChart();
});

// Update the UI with new transaction data
function updateUI() {
  // Clear the transaction list
  transactionsList.innerHTML = '';

  // Calculate total income, total expenses, and balance
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(transaction => {
    const { id, amount, category, date, type } = transaction;

    // Add transaction to the list
    const transactionItem = document.createElement('li');
    transactionItem.innerHTML = `
      ${type === 'income' ? '+' : '-'}$${amount} | ${category} | ${date.toLocaleDateString()}
      <button onclick="deleteTransaction(${id})">Delete</button>
    `;
    transactionsList.appendChild(transactionItem);

    // Calculate totals
    if (type === 'income') {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }
  });

  // Calculate balance
  const balance = totalIncome - totalExpenses;

  // Update the summary UI
  totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
  totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
  balanceEl.textContent = `$${balance.toFixed(2)}`;
}

// Delete transaction function
function deleteTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateUI();
  updateChart();
}

// Chart configuration
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
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            const category = tooltipItem.label;
            const expensesForCategory = transactions.filter(t => t.category === category && t.type === 'expense');
            const dates = expensesForCategory.map(t => t.date.toLocaleDateString()).join(', ');
            return `${category}: $${tooltipItem.raw} (Dates: ${dates})`;
          }
        }
      }
    }
  }
});

// Update the chart with all expenses, but highlight the latest month
function updateChart() {
  const months = {};
  
  // Group transactions by month and category
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`; // YYYY-MM format
      if (!months[monthKey]) {
        months[monthKey] = {};
      }
      if (!months[monthKey][transaction.category]) {
        months[monthKey][transaction.category] = 0;
      }
      months[monthKey][transaction.category] += transaction.amount;
    }
  });

  // Get the latest month (by key sorting)
  const sortedMonths = Object.keys(months).sort();
  const latestMonthKey = sortedMonths[sortedMonths.length - 1]; // Last month in the sorted array

  // Prepare data for the chart
  const labels = [];
  const data = [];
  const backgroundColors = [];
  const borderColors = [];

  Object.entries(months).forEach(([month, categories]) => {
    Object.entries(categories).forEach(([category, amount]) => {
      labels.push(`${month} - ${category}`);
      data.push(amount);

      // Highlight the latest month
      if (month === latestMonthKey) {
        backgroundColors.push('rgba(54, 162, 235, 0.6)');  // Highlighted color for latest month
        borderColors.push('rgba(54, 162, 235, 1)');
      } else {
        backgroundColors.push('rgba(255, 99, 132, 0.2)');  // Default color
        borderColors.push('rgba(255, 99, 132, 1)');
      }
    });
  });

  // Update chart data
  expenseChart.data.labels = labels;
  expenseChart.data.datasets[0].data = data;
  expenseChart.data.datasets[0].backgroundColor = backgroundColors;
  expenseChart.data.datasets[0].borderColor = borderColors;
  expenseChart.update();
}
document.addEventListener('DOMContentLoaded', () => {
  const interBubble = document.querySelector('.interactive');
  let curX = 0;
  let curY = 0;
  let tgX = 0;
  let tgY = 0;

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
