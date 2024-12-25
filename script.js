// Shopping Cart System
let loggedIn = true;

// Product catalog with categories and prices
const productCatalog = {
    electronics: [
        { id: 'e1', name: 'Laptop', price: 999.99, stock: 5 },
        { id: 'e2', name: 'Smartphone', price: 699.99, stock: 10 },
        { id: 'e3', name: 'Headphones', price: 149.99, stock: 15 },
        { id: 'e4', name: 'Smart Watch', price: 299.99, stock: 8 },
        { id: 'e5', name: 'Tablet', price: 449.99, stock: 7 }
    ],
    clothing: [
        { id: 'c1', name: 'T-Shirt', price: 19.99, stock: 20 },
        { id: 'c2', name: 'Jeans', price: 49.99, stock: 15 },
        { id: 'c3', name: 'Sneakers', price: 79.99, stock: 12 },
        { id: 'c4', name: 'Hoodie', price: 39.99, stock: 18 },
        { id: 'c5', name: 'Hat', price: 14.99, stock: 25 }
    ],
    books: [
        { id: 'b1', name: 'JavaScript Guide', price: 29.99, stock: 10 },
        { id: 'b2', name: 'Python Basics', price: 24.99, stock: 8 },
        { id: 'b3', name: 'Web Development', price: 34.99, stock: 6 },
        { id: 'b4', name: 'Data Structures', price: 39.99, stock: 5 },
        { id: 'b5', name: 'Algorithms', price: 44.99, stock: 7 }
    ]
};

// Initialize shopping cart
let cart = [];

// Initialize account balance and transaction history
let balance = 1000;
let transactions = [];
let transactionChart = null;

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

// Update date/time every second
setInterval(updateDateTime, 1000);
updateDateTime();

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Function to calculate cart total
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to add item to cart
function addToCart(categoryId, productId) {
    if (!loggedIn) {
        updateBankingOutput("Please log in to add items to cart.", true);
        return;
    }

    const category = productCatalog[categoryId];
    const product = category.find(p => p.id === productId);

    if (product.stock <= 0) {
        updateBankingOutput("Sorry, this item is out of stock.", true);
        return;
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        if (cartItem.quantity < product.stock) {
            cartItem.quantity++;
            product.stock--;
        } else {
            updateBankingOutput("Maximum available quantity reached.", true);
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: categoryId
        });
        product.stock--;
    }

    updateCartDisplay();
    updateProductCatalog();
    updateBankingOutput(`Added ${product.name} to cart!`);
}

// Function to remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        const category = productCatalog[item.category];
        const product = category.find(p => p.id === productId);
        
        if (item.quantity > 1) {
            item.quantity--;
            product.stock++;
        } else {
            cart.splice(itemIndex, 1);
            product.stock++;
        }
        
        updateCartDisplay();
        updateProductCatalog();
        updateBankingOutput(`Removed ${product.name} from cart!`);
    }
}

// Function to update product catalog display
function updateProductCatalog() {
    const catalogDiv = document.getElementById('productCatalog');
    if (!catalogDiv) return;

    let catalogHtml = '';
    
    for (const [category, products] of Object.entries(productCatalog)) {
        catalogHtml += `
            <div class="category-section">
                <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div class="product-grid">
                    ${products.map(product => `
                        <div class="product-card ${product.stock <= 0 ? 'out-of-stock' : ''}">
                            <h4>${product.name}</h4>
                            <p class="price">${formatCurrency(product.price)}</p>
                            <p class="stock">Stock: ${product.stock}</p>
                            <button onclick="addToCart('${category}', '${product.id}')" 
                                    ${product.stock <= 0 ? 'disabled' : ''}>
                                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    catalogDiv.innerHTML = catalogHtml;
}

// Function to update cart display
function updateCartDisplay() {
    const cartDiv = document.getElementById('cartItems');
    const cartTotal = calculateCartTotal();
    
    if (!loggedIn) {
        cartDiv.innerHTML = '<p class="error-message">Please log in to view your cart.</p>';
        return;
    }

    if (cart.length === 0) {
        cartDiv.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        let cartHtml = `
            <div class="cart-summary">
                <h3>Shopping Cart Summary</h3>
                <p>Total Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</p>
                <p>Total Value: ${formatCurrency(cartTotal)}</p>
            </div>
            <div class="cart-grid">
        `;

        cart.forEach(item => {
            cartHtml += `
                <div class="cart-item">
                    <h4>${item.name}</h4>
                    <p>Price: ${formatCurrency(item.price)}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Subtotal: ${formatCurrency(item.price * item.quantity)}</p>
                    <div class="cart-item-controls">
                        <button onclick="addToCart('${item.category}', '${item.id}')" class="success">+</button>
                        <button onclick="removeFromCart('${item.id}')" class="danger">-</button>
                    </div>
                </div>
            `;
        });

        cartHtml += `</div>
            <div class="cart-actions">
                <button onclick="clearCart()" class="danger">Clear Cart</button>
                <button onclick="checkout()" class="success" ${cartTotal > balance ? 'disabled' : ''}>
                    Checkout (${formatCurrency(cartTotal)})
                </button>
            </div>
        `;
        
        cartDiv.innerHTML = cartHtml;
    }
    
    updateDashboard();
}

// Function to handle checkout
function checkout() {
    if (cart.length === 0) {
        updateBankingOutput("Your cart is empty!", true);
        return;
    }

    const total = calculateCartTotal();
    if (total > balance) {
        updateBankingOutput("Insufficient funds for checkout!", true);
        return;
    }

    balance -= total;
    addTransaction("Purchase", total, "Success");
    cart = [];
    updateCartDisplay();
    updateBankingOutput(`Checkout successful! Paid ${formatCurrency(total)}`);
}

// Function to generate random items
function generateRandomItems() {
    if (!loggedIn) {
        updateBankingOutput("Please log in to add items to cart.", true);
        return;
    }
    
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numItems; i++) {
        const category = Object.keys(productCatalog)[Math.floor(Math.random() * Object.keys(productCatalog).length)];
        const product = productCatalog[category][Math.floor(Math.random() * productCatalog[category].length)];
        addToCart(category, product.id);
    }
    updateCartDisplay();
    updateDashboard();
}

// Function to toggle login status
function toggleLogin() {
    loggedIn = !loggedIn;
    updateLoginStatus();
    updateCartDisplay();
}

// Function to update login status display
function updateLoginStatus() {
    const statusDiv = document.getElementById('loginStatus');
    statusDiv.innerHTML = `
        <div class="status-badge" style="background-color: ${loggedIn ? 'var(--success-color)' : 'var(--danger-color)'}">
            ${loggedIn ? 'Logged In' : 'Logged Out'}
        </div>
    `;
}

// Function to sort cart items
function sortCart() {
    if (!loggedIn) {
        updateBankingOutput("Please log in to sort cart items.", true);
        return;
    }
    cart.sort((a, b) => a.name.localeCompare(b.name));
    updateCartDisplay();
}

// Function to clear cart
function clearCart() {
    if (!loggedIn) {
        updateBankingOutput("Please log in to clear cart.", true);
        return;
    }
    cart = [];
    updateCartDisplay();
    updateDashboard();
}

// Function to update dashboard
function updateDashboard() {
    document.getElementById('balanceDisplay').textContent = formatCurrency(balance);
    document.getElementById('transactionCount').textContent = transactions.length;
    document.getElementById('cartCount').textContent = cart.length;
}

// Function to switch tabs
function switchTab(tabName) {
    document.getElementById('transactionsPanel').style.display = tabName === 'transactions' ? 'block' : 'none';
    document.getElementById('analyticsPanel').style.display = tabName === 'analytics' ? 'block' : 'none';
    
    document.getElementById('transactionsTab').classList.toggle('active', tabName === 'transactions');
    document.getElementById('analyticsTab').classList.toggle('active', tabName === 'analytics');

    if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Function to update analytics
function updateAnalytics() {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    
    // Prepare data
    const deposits = transactions.filter(t => t.type === 'Deposit' && t.status === 'Success')
        .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Success')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Destroy existing chart if it exists
    if (transactionChart) {
        transactionChart.destroy();
    }

    // Create new chart
    transactionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Deposits', 'Withdrawals'],
            datasets: [{
                label: 'Transaction Summary',
                data: [deposits, withdrawals],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.5)',
                    'rgba(231, 76, 60, 0.5)'
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => formatCurrency(context.raw)
                    }
                }
            }
        }
    });

    // Update transaction summary
    const successfulTransactions = transactions.filter(t => t.status === 'Success').length;
    const failedTransactions = transactions.filter(t => t.status !== 'Success').length;
    
    document.getElementById('transactionSummary').innerHTML = `
        <p>Total Deposits: ${formatCurrency(deposits)}</p>
        <p>Total Withdrawals: ${formatCurrency(withdrawals)}</p>
        <p>Successful Transactions: ${successfulTransactions}</p>
        <p>Failed Transactions: ${failedTransactions}</p>
        <p>Success Rate: ${((successfulTransactions / (successfulTransactions + failedTransactions)) * 100 || 0).toFixed(1)}%</p>
    `;
}

// Function to generate report
function generateReport() {
    const successfulTransactions = transactions.filter(t => t.status === 'Success');
    const failedTransactions = transactions.filter(t => t.status !== 'Success');
    
    // Calculate statistics
    const totalDeposits = successfulTransactions
        .filter(t => t.type === 'Deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = successfulTransactions
        .filter(t => t.type === 'Withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalPurchases = successfulTransactions
        .filter(t => t.type === 'Purchase')
        .reduce((sum, t) => sum + t.amount, 0);

    // Get transaction trends (last 7 days)
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const dailyTotals = last7Days.map(date => {
        const dayTransactions = successfulTransactions.filter(t => 
            t.timestamp.split(',')[0] === new Date(date).toLocaleDateString());
        return {
            date,
            deposits: dayTransactions.filter(t => t.type === 'Deposit')
                .reduce((sum, t) => sum + t.amount, 0),
            withdrawals: dayTransactions.filter(t => t.type === 'Withdrawal')
                .reduce((sum, t) => sum + t.amount, 0),
            purchases: dayTransactions.filter(t => t.type === 'Purchase')
                .reduce((sum, t) => sum + t.amount, 0)
        };
    });

    const reportHtml = `
        <div class="report-container">
            <div class="report-header">
                <h3>Banking & Shopping Analytics Dashboard</h3>
                <div class="report-tabs">
                    <button onclick="switchReportTab('overview')" class="report-tab active">Overview</button>
                    <button onclick="switchReportTab('transactions')" class="report-tab">Transactions</button>
                    <button onclick="switchReportTab('shopping')" class="report-tab">Shopping</button>
                    <button onclick="switchReportTab('trends')" class="report-tab">Trends</button>
                </div>
            </div>

            <div id="overview" class="report-tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h4>Current Balance</h4>
                            <div class="stat-value">${formatCurrency(balance)}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h4>Total Transactions</h4>
                            <div class="stat-value">${transactions.length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-info">
                            <h4>Success Rate</h4>
                            <div class="stat-value">${((successfulTransactions.length / transactions.length) * 100 || 0).toFixed(1)}%</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🛒</div>
                        <div class="stat-info">
                            <h4>Cart Value</h4>
                            <div class="stat-value">${formatCurrency(calculateCartTotal())}</div>
                        </div>
                    </div>
                </div>
                <div class="charts-container">
                    <div class="chart-wrapper">
                        <canvas id="transactionPieChart"></canvas>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="balanceTrendChart"></canvas>
                    </div>
                </div>
            </div>

            <div id="transactions" class="report-tab-content">
                <div class="transaction-summary">
                    <div class="summary-card">
                        <h4>Deposits</h4>
                        <div class="amount positive">${formatCurrency(totalDeposits)}</div>
                        <div class="trend">
                            <span class="arrow">↑</span>
                            <span class="percent">+${((totalDeposits / (totalDeposits + totalWithdrawals + totalPurchases)) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="summary-card">
                        <h4>Withdrawals</h4>
                        <div class="amount negative">${formatCurrency(totalWithdrawals)}</div>
                        <div class="trend">
                            <span class="arrow">↓</span>
                            <span class="percent">-${((totalWithdrawals / (totalDeposits + totalWithdrawals + totalPurchases)) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="summary-card">
                        <h4>Purchases</h4>
                        <div class="amount negative">${formatCurrency(totalPurchases)}</div>
                        <div class="trend">
                            <span class="arrow">↓</span>
                            <span class="percent">-${((totalPurchases / (totalDeposits + totalWithdrawals + totalPurchases)) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <div class="chart-wrapper full-width">
                    <canvas id="transactionHistoryChart"></canvas>
                </div>
            </div>

            <div id="shopping" class="report-tab-content">
                <div class="shopping-analytics">
                    <div class="category-distribution">
                        <h4>Shopping by Category</h4>
                        <div class="chart-wrapper">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                    <div class="cart-analysis">
                        <h4>Current Cart Analysis</h4>
                        <div class="cart-stats">
                            <div class="cart-stat-item">
                                <span>Items Count:</span>
                                <span>${cart.length}</span>
                            </div>
                            <div class="cart-stat-item">
                                <span>Average Item Price:</span>
                                <span>${formatCurrency(cart.reduce((sum, item) => sum + item.price, 0) / cart.length || 0)}</span>
                            </div>
                            <div class="cart-stat-item">
                                <span>Most Expensive Item:</span>
                                <span>${cart.length ? cart.reduce((max, item) => item.price > max.price ? item : max, cart[0]).name : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="trends" class="report-tab-content">
                <div class="trend-analysis">
                    <h4>7-Day Transaction Trend</h4>
                    <div class="chart-wrapper">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
                <div class="trend-metrics">
                    <div class="metric-card">
                        <h4>Daily Averages</h4>
                        <div class="metric-value">
                            Deposits: ${formatCurrency(dailyTotals.reduce((sum, day) => sum + day.deposits, 0) / 7)}
                        </div>
                        <div class="metric-value">
                            Withdrawals: ${formatCurrency(dailyTotals.reduce((sum, day) => sum + day.withdrawals, 0) / 7)}
                        </div>
                        <div class="metric-value">
                            Purchases: ${formatCurrency(dailyTotals.reduce((sum, day) => sum + day.purchases, 0) / 7)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create and show modal
    const modalHtml = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Financial Analytics Dashboard</h2>
                    <button onclick="closeModal()" class="close-button">&times;</button>
                </div>
                ${reportHtml}
            </div>
        </div>
    `;

    // Add modal to body
    const modalDiv = document.createElement('div');
    modalDiv.id = 'reportModal';
    modalDiv.innerHTML = modalHtml;
    document.body.appendChild(modalDiv);

    // Initialize charts after modal is added
    initializeReportCharts(dailyTotals, {
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        purchases: totalPurchases
    });
}

// Function to initialize all charts in the report
function initializeReportCharts(dailyTotals, totals) {
    // Transaction Distribution Pie Chart
    new Chart(document.getElementById('transactionPieChart'), {
        type: 'doughnut',
        data: {
            labels: ['Deposits', 'Withdrawals', 'Purchases'],
            datasets: [{
                data: [totals.deposits, totals.withdrawals, totals.purchases],
                backgroundColor: ['#4CAF50', '#f44336', '#2196F3']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Transaction Distribution'
                }
            }
        }
    });

    // Balance Trend Line Chart
    new Chart(document.getElementById('balanceTrendChart'), {
        type: 'line',
        data: {
            labels: dailyTotals.map(day => day.date),
            datasets: [{
                label: 'Net Daily Change',
                data: dailyTotals.map(day => day.deposits - day.withdrawals - day.purchases),
                borderColor: '#2196F3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Balance Trend'
                }
            }
        }
    });

    // Transaction History Stacked Bar Chart
    new Chart(document.getElementById('transactionHistoryChart'), {
        type: 'bar',
        data: {
            labels: dailyTotals.map(day => day.date),
            datasets: [
                {
                    label: 'Deposits',
                    data: dailyTotals.map(day => day.deposits),
                    backgroundColor: '#4CAF50'
                },
                {
                    label: 'Withdrawals',
                    data: dailyTotals.map(day => day.withdrawals),
                    backgroundColor: '#f44336'
                },
                {
                    label: 'Purchases',
                    data: dailyTotals.map(day => day.purchases),
                    backgroundColor: '#2196F3'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Transaction History'
                }
            }
        }
    });

    // Shopping Category Distribution
    const categoryData = {};
    cart.forEach(item => {
        categoryData[item.category] = (categoryData[item.category] || 0) + item.price * item.quantity;
    });

    new Chart(document.getElementById('categoryChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#4CAF50', '#f44336', '#2196F3', '#FFC107', '#9C27B0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Shopping Category Distribution'
                }
            }
        }
    });

    // 7-Day Trend Line Chart
    new Chart(document.getElementById('trendChart'), {
        type: 'line',
        data: {
            labels: dailyTotals.map(day => day.date),
            datasets: [
                {
                    label: 'Deposits',
                    data: dailyTotals.map(day => day.deposits),
                    borderColor: '#4CAF50',
                    tension: 0.4
                },
                {
                    label: 'Withdrawals',
                    data: dailyTotals.map(day => day.withdrawals),
                    borderColor: '#f44336',
                    tension: 0.4
                },
                {
                    label: 'Purchases',
                    data: dailyTotals.map(day => day.purchases),
                    borderColor: '#2196F3',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '7-Day Transaction Trend'
                }
            }
        }
    });
}

// Function to switch report tabs
function switchReportTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.report-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Deactivate all tabs
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Activate selected tab
    event.target.classList.add('active');
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.remove();
    }
}

// Function to add transaction to history
function addTransaction(type, amount, status) {
    const transaction = {
        type,
        amount,
        status,
        timestamp: new Date().toLocaleString(),
        id: Date.now()
    };
    transactions.unshift(transaction);
    updateTransactionHistory();
    updateDashboard();
    updateAnalytics();
}

// Function to update transaction history display
function updateTransactionHistory() {
    const historyDiv = document.getElementById('transactionHistory');
    historyDiv.innerHTML = transactions.slice(0, 6).map(t => `
        <div class="transaction-item" data-id="${t.id}">
            <strong>${t.type}</strong> - ${formatCurrency(t.amount)}<br>
            <small>${t.timestamp}</small><br>
            <span class="status-badge" style="background-color: ${t.status === 'Success' ? 'var(--success-color)' : 'var(--danger-color)'}">
                ${t.status}
            </span>
        </div>
    `).join('');
}

// Function to update banking output
function updateBankingOutput(message, isError = false) {
    const outputDiv = document.getElementById('bankingOutput');
    outputDiv.innerHTML = `
        <p class="status-badge" style="background-color: ${isError ? 'var(--danger-color)' : 'var(--success-color)'}">
            ${message}
        </p>
    `;
}

// Deposit function
function deposit() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        updateBankingOutput("Please enter a valid positive amount.", true);
        addTransaction("Deposit", amount || 0, "Failed - Invalid Amount");
        return;
    }
    balance += amount;
    updateBankingOutput(`Successfully deposited ${formatCurrency(amount)}. New balance: ${formatCurrency(balance)}`);
    addTransaction("Deposit", amount, "Success");
    document.getElementById('amount').value = '';
}

// Withdrawal function
function withdraw() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        updateBankingOutput("Please enter a valid positive amount.", true);
        addTransaction("Withdrawal", amount || 0, "Failed - Invalid Amount");
        return;
    }
    if (amount > balance) {
        updateBankingOutput("Insufficient funds!", true);
        addTransaction("Withdrawal", amount, "Failed - Insufficient Funds");
        return;
    }
    balance -= amount;
    updateBankingOutput(`Successfully withdrew ${formatCurrency(amount)}. New balance: ${formatCurrency(balance)}`);
    addTransaction("Withdrawal", amount, "Success");
    document.getElementById('amount').value = '';
}

// Balance check function
function checkBalance() {
    updateBankingOutput(`Current balance: ${formatCurrency(balance)}`);
}

// Initialize the display when the page loads
window.onload = function() {
    updateLoginStatus();
    updateProductCatalog();
    updateCartDisplay();
    checkBalance();
    updateDashboard();
};

// Function to calculate financial metrics
function calculateFinancialMetrics() {
    const successfulTransactions = transactions.filter(t => t.status === 'Success');
    
    // Monthly metrics
    const monthlyData = {};
    successfulTransactions.forEach(t => {
        const month = new Date(t.timestamp).toLocaleString('default', { month: 'long' });
        if (!monthlyData[month]) {
            monthlyData[month] = {
                deposits: 0,
                withdrawals: 0,
                purchases: 0,
                count: 0
            };
        }
        monthlyData[month][t.type.toLowerCase() + 's'] += t.amount;
        monthlyData[month].count++;
    });

    // Calculate spending patterns
    const spendingByHour = Array(24).fill(0);
    successfulTransactions.forEach(t => {
        if (t.type === 'Withdrawal' || t.type === 'Purchase') {
            const hour = new Date(t.timestamp).getHours();
            spendingByHour[hour] += t.amount;
        }
    });

    // Calculate recurring transactions
    const recurringTransactions = findRecurringTransactions(successfulTransactions);

    // Calculate financial ratios
    const totalIncome = successfulTransactions
        .filter(t => t.type === 'Deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = successfulTransactions
        .filter(t => t.type === 'Withdrawal' || t.type === 'Purchase')
        .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
        monthlyData,
        spendingByHour,
        recurringTransactions,
        savingsRate,
        expenseRatio,
        totalIncome,
        totalExpenses
    };
}

// Function to find recurring transactions
function findRecurringTransactions(transactions) {
    const transactionMap = {};
    transactions.forEach(t => {
        const key = `${t.type}-${t.amount}`;
        if (!transactionMap[key]) {
            transactionMap[key] = [];
        }
        transactionMap[key].push(new Date(t.timestamp));
    });

    const recurring = [];
    Object.entries(transactionMap).forEach(([key, dates]) => {
        if (dates.length >= 2) {
            const [type, amount] = key.split('-');
            recurring.push({
                type,
                amount: parseFloat(amount),
                frequency: calculateFrequency(dates),
                occurrences: dates.length
            });
        }
    });

    return recurring;
}

// Function to calculate transaction frequency
function calculateFrequency(dates) {
    if (dates.length < 2) return 'One-time';
    
    dates.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
        intervals.push(dates[i] - dates[i-1]);
    }
    
    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const daysDiff = avgInterval / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) return 'Weekly';
    if (daysDiff <= 14) return 'Bi-weekly';
    if (daysDiff <= 31) return 'Monthly';
    if (daysDiff <= 92) return 'Quarterly';
    return 'Irregular';
}

// Function to generate financial insights
function generateFinancialInsights() {
    const metrics = calculateFinancialMetrics();
    
    let insights = [];
    
    // Savings insights
    if (metrics.savingsRate < 20) {
        insights.push({
            type: 'warning',
            title: 'Low Savings Rate',
            message: `Your savings rate is ${metrics.savingsRate.toFixed(1)}%. Consider reducing non-essential expenses.`,
            icon: '⚠️'
        });
    } else if (metrics.savingsRate > 50) {
        insights.push({
            type: 'success',
            title: 'Excellent Savings',
            message: `Great job! You're saving ${metrics.savingsRate.toFixed(1)}% of your income.`,
            icon: '🌟'
        });
    }

    // Spending pattern insights
    const highSpendingHours = metrics.spendingByHour
        .map((amount, hour) => ({ hour, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    if (highSpendingHours[0].amount > 0) {
        insights.push({
            type: 'info',
            title: 'Peak Spending Times',
            message: `Your highest spending occurs at ${highSpendingHours.map(h => 
                `${h.hour}:00${h.hour < 12 ? 'AM' : 'PM'}`).join(', ')}.`,
            icon: '⏰'
        });
    }

    // Recurring transaction insights
    const significantRecurring = metrics.recurringTransactions
        .filter(t => t.amount > 100)
        .sort((a, b) => b.amount - a.amount);

    if (significantRecurring.length > 0) {
        insights.push({
            type: 'info',
            title: 'Recurring Expenses',
            message: `You have ${significantRecurring.length} significant recurring transactions.`,
            icon: '🔄'
        });
    }

    return insights;
}

// Enhanced deposit function with validation and categorization
function deposit() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        updateBankingOutput('Please enter a valid amount.', true);
        return;
    }

    const category = document.getElementById('transactionCategory').value;
    const note = document.getElementById('transactionNote').value;

    balance += amount;
    const transaction = {
        type: 'Deposit',
        amount: amount,
        status: 'Success',
        timestamp: new Date().toLocaleString(),
        category: category,
        note: note,
        id: Date.now()
    };
    
    transactions.unshift(transaction);
    updateTransactionHistory();
    updateDashboard();
    updateAnalytics();
    document.getElementById('amount').value = '';
    document.getElementById('transactionNote').value = '';
    
    updateBankingOutput(`Successfully deposited ${formatCurrency(amount)}`);
}

// Enhanced withdraw function with validation and overdraft protection
function withdraw() {
    const amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) {
        updateBankingOutput('Please enter a valid amount.', true);
        return;
    }

    const category = document.getElementById('transactionCategory').value;
    const note = document.getElementById('transactionNote').value;

    if (amount > balance) {
        const transaction = {
            type: 'Withdrawal',
            amount: amount,
            status: 'Failed - Insufficient Funds',
            timestamp: new Date().toLocaleString(),
            category: category,
            note: note,
            id: Date.now()
        };
        transactions.unshift(transaction);
        updateTransactionHistory();
        updateBankingOutput('Insufficient funds!', true);
        return;
    }

    balance -= amount;
    const transaction = {
        type: 'Withdrawal',
        amount: amount,
        status: 'Success',
        timestamp: new Date().toLocaleString(),
        category: category,
        note: note,
        id: Date.now()
    };
    
    transactions.unshift(transaction);
    updateTransactionHistory();
    updateDashboard();
    updateAnalytics();
    document.getElementById('amount').value = '';
    document.getElementById('transactionNote').value = '';
    
    updateBankingOutput(`Successfully withdrew ${formatCurrency(amount)}`);
}

// Function to update analytics with enhanced visualizations
function updateAnalytics() {
    const metrics = calculateFinancialMetrics();
    const insights = generateFinancialInsights();
    
    // Update insights panel
    const insightsHtml = insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
            </div>
        </div>
    `).join('');
    
    document.getElementById('financialInsights').innerHTML = insightsHtml;

    // Update spending patterns chart
    if (window.spendingPatternChart) {
        window.spendingPatternChart.destroy();
    }
    
    window.spendingPatternChart = new Chart(
        document.getElementById('spendingPatternChart'),
        {
            type: 'radar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Hourly Spending',
                    data: metrics.spendingByHour,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        }
    );

    // Update monthly trends chart
    const monthlyLabels = Object.keys(metrics.monthlyData);
    const monthlyDeposits = monthlyLabels.map(month => metrics.monthlyData[month].deposits);
    const monthlyWithdrawals = monthlyLabels.map(month => metrics.monthlyData[month].withdrawals);
    const monthlyPurchases = monthlyLabels.map(month => metrics.monthlyData[month].purchases);

    if (window.monthlyTrendsChart) {
        window.monthlyTrendsChart.destroy();
    }

    window.monthlyTrendsChart = new Chart(
        document.getElementById('monthlyTrendsChart'),
        {
            type: 'line',
            data: {
                labels: monthlyLabels,
                datasets: [
                    {
                        label: 'Deposits',
                        data: monthlyDeposits,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.4
                    },
                    {
                        label: 'Withdrawals',
                        data: monthlyWithdrawals,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.4
                    },
                    {
                        label: 'Purchases',
                        data: monthlyPurchases,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Transaction Trends'
                    }
                }
            }
        }
    );

    // Update financial ratios gauge charts
    updateGaugeChart('savingsRateGauge', metrics.savingsRate, 'Savings Rate');
    updateGaugeChart('expenseRatioGauge', metrics.expenseRatio, 'Expense Ratio');
}

// Function to update gauge charts
function updateGaugeChart(canvasId, value, label) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (window[canvasId]) {
        window[canvasId].destroy();
    }

    window[canvasId] = new Chart(canvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [
                    value > 50 ? '#4CAF50' : value > 30 ? '#FFC107' : '#f44336',
                    '#f0f0f0'
                ],
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${label}: ${value.toFixed(1)}%`
                }
            },
            cutout: '75%'
        }
    });
}
