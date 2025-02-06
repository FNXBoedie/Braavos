document.addEventListener('DOMContentLoaded', () => {
    const totalIncomeDisplay = document.getElementById('total-income');
    const totalExpensesDisplay = document.getElementById('total-expenses');
    const balanceDisplay = document.getElementById('balance');
    const transactionList = document.getElementById('transaction-list');
    const incomeForm = document.getElementById('add-income-form');
    const expenseForm = document.getElementById('add-expense-form');
    const filterType = document.getElementById('filter-type');
    const filterCategory = document.getElementById('filter-category');
    const sortBy = document.getElementById('sort-by');
    const chartCanvas = document.getElementById('spendingChart');
    let spendingChart;

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let goals = JSON.parse(localStorage.getItem('goals')) || [];
    let assets = JSON.parse(localStorage.getItem('assets')) || { realEstate: [], vehicles: [], luxuries: [], other: [] };

    if (typeof assets !== 'object' || assets === null || !('realEstate' in assets) || !('vehicles' in assets) || !('luxuries' in assets) || !('other' in assets)) {
        console.error('Invalid assets object:', assets);
        assets = { realEstate: [], vehicles: [], luxuries: [], other: [] };
    }

    const totalFundsDisplay = document.getElementById('total-funds');
    const fundsTotalDisplay = document.getElementById('funds-total-display');
    const cashList = document.getElementById('cash-list');
    const checkingList = document.getElementById('checking-list');
    const savingsList = document.getElementById('savings-list');
    const investmentList = document.getElementById('investment-list');
    const addCashForm = document.getElementById('add-cash-form');
    const addCheckingForm = document.getElementById('add-checking-form');
    const addSavingsForm = document.getElementById('add-savings-form');
    const addInvestmentsForm = document.getElementById('add-investments-form');
    const fundsTable = document.getElementById('funds-table');

    const addGoalForm = document.getElementById('add-goal-form');
    const goalsList = document.getElementById('goals-list');

    // Assets elements
    const assetsContent = document.getElementById('assets');
    const realEstateList = document.getElementById('real-estate-list');
    const vehicleList = document.getElementById('vehicle-list');
    const luxuryList = document.getElementById('luxury-list');
    const otherList = document.getElementById('other-list');
    const addRealEstateForm = document.getElementById('add-real-estate-form');
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const addLuxuryForm = document.getElementById('add-luxury-form');
    const addOtherForm = document.getElementById('add-other-form');
    const budgetLink = document.querySelector('a[href="#budget"]');
    const budgetContent = document.getElementById('budget');

    let funds = JSON.parse(localStorage.getItem('funds')) || { cash: [], checking: [], savings: [], investments: [] };

    if (typeof funds !== 'object' || funds === null || !('cash' in funds) || !('checking' in funds) || !('savings' in funds) || !('investments' in funds)) {
        console.error('Invalid funds object:', funds);
        funds = { cash: [], checking: [], savings: [], investments: [] };
    }

    function calculateSummary() {
         let income = 0;
        let expenses = 0;

        transactions.forEach((transaction) => {
            if (transaction.type === 'income') {
                income += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                expenses += parseFloat(transaction.amount);
            }
        });
        const balance = income - expenses;
        totalIncomeDisplay.textContent = `€${income.toFixed(2)}`;
        totalExpensesDisplay.textContent = `€${expenses.toFixed(2)}`;
        balanceDisplay.textContent = `€${balance.toFixed(2)}`;
    }

    function renderTransactions() {
        transactionList.innerHTML = '';
        let filteredTransactions = [...transactions];

        // Apply Type Filter
        if (filterType.value !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                (transaction) => transaction.type === filterType.value
            );
        }

        // Apply Category Filter
        if (filterCategory.value !== 'all') {
            filteredTransactions = filteredTransactions.filter(
                (transaction) => transaction.category === filterCategory.value
            );
        }

        // Apply Sorting
        const sortByValue = sortBy.value;
        if (sortByValue === 'date-newest') {
            filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortByValue === 'date-oldest') {
            filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortByValue === 'amount-high') {
            filteredTransactions.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        } else if (sortByValue === 'amount-low') {
            filteredTransactions.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        }

        filteredTransactions.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${transaction.date}</td>
          <td>${transaction.type}</td>
          <td>${transaction.category}</td>
          <td>€${transaction.amount}</td>
          <td>${transaction.description}</td>
          <td><button class="delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button></td>
        `;
            transactionList.appendChild(row);
        });
    }

    function updateChart() {
        const categoryExpenses = {};
        transactions.filter(t => t.type === 'expense').forEach(transaction => {
            categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + parseFloat(transaction.amount);
        });

        const labels = Object.keys(categoryExpenses);
        const data = Object.values(categoryExpenses);

        if (spendingChart) {
            spendingChart.destroy();
        }

        spendingChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#ff6384',
                        '#36a2eb',
                        '#ffce56',
                        '#4bc0c0',
                        '#9966ff',
                        '#ff8856',
                        '#ffc107',
                        '#263238'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        })
    }


    function addTransaction(type, date, category, amount, description, recurring) {
        transactions.push({
            type,
            date,
            category,
            amount,
            description,
            recurring,
            lastAdded: recurring !== 'none' ? new Date().toISOString() : null,
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        calculateSummary();
        updateChart()
    }
    
    addCashForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('cash-name').value;
        const amount = document.getElementById('cash-amount').value;
        addFund('cash', name, amount);
        addCashForm.reset();
    });

    addCheckingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('checking-name').value;
        const amount = document.getElementById('checking-amount').value;
        addFund('checking', name, amount);
        addCheckingForm.reset();
    });

    addSavingsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('savings-name').value;
        const amount = document.getElementById('savings-amount').value;
        addFund('savings', name, amount);
        addSavingsForm.reset();
    });

     addInvestmentsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('investment-name').value;
        const amount = document.getElementById('investment-amount').value;
        addFund('investments', name, amount);
        addInvestmentsForm.reset();
    });
    
    function calculateTotalFunds() {
        let total = 0;
        for (const category in funds) {
            funds[category].forEach(fund => {
                total += parseFloat(fund.amount);
            });
        }
        return total;
    }

    function updateFundsDisplay() {
        const fundsTableBody = fundsTable.querySelector('tbody');
        fundsTableBody.innerHTML = '';

        for (const category in funds) {
            funds[category].forEach((fund, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                    <td>${fund.name}</td>
                    <td>€${fund.amount}</td>
                    <td><button class="delete-fund" data-category="${category}" data-index="${index}"><i class="fa-solid fa-trash"></i></button></td>
                `;
                fundsTableBody.appendChild(row);
            });
        }

        const total = calculateTotalFunds();
        fundsTotalDisplay.textContent = `€${total.toFixed(2)}`;
        const totalFundsDashboard = document.getElementById('total-funds');
        totalFundsDashboard.textContent = `€${total.toFixed(2)}`;
    }

    function addFund(category, name, amount) {
        funds[category].push({ name, amount });
        localStorage.setItem('funds', JSON.stringify(funds));
        updateFundsDisplay();
    }

    function deleteFund(category, index) {
        funds[category].splice(index, 1);
        localStorage.setItem('funds', JSON.stringify(funds));
        updateFundsDisplay();
    }

    function addGoal(name, amount, dueDate) {
        goals.push({
            name,
            amount: parseFloat(amount),
            dueDate: dueDate ? new Date(dueDate) : null,
        });
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }

    function calculateGoalProgress(goal) {
        const totalFunds = calculateTotalFunds();
        const progress = (totalFunds / goal.amount) * 100;
        return Math.min(progress, 100); // Ensure progress doesn't exceed 100%
    }

    function renderGoals() {
        goalsList.innerHTML = '';
        goals.forEach((goal, index) => {
            const progress = calculateGoalProgress(goal);
            const goalItem = document.createElement('div');
            goalItem.classList.add('goal-item');

            let monthlySavings = 'N/A';
            let dueDateString = '';
            let monthsLeft = 0;
            if (goal.dueDate instanceof Date) {
                const now = new Date();
                monthsLeft = (goal.dueDate.getFullYear() - now.getFullYear()) * 12 + (goal.dueDate.getMonth() - now.getMonth());
                 if (monthsLeft > 0) {
                    monthlySavings = (goal.amount / monthsLeft).toFixed(2);
                }
                dueDateString = goal.dueDate.toLocaleDateString();
            }
            let monthsString = monthsLeft === 1 ? 'month' : 'months';


            goalItem.innerHTML = `
                <div class="goal-info">
                    <p><strong>${goal.name}</strong></p>
                    <p>Target: €${goal.amount.toFixed(2)}</p>
                    ${dueDateString ? `<p>Due Date: ${dueDateString}</p>` : ''}
                    <p class="monthly-savings">Monthly Savings: €${monthlySavings} / ${monthsLeft} ${monthsString}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <p>Progress: ${progress.toFixed(2)}%</p>
                </div>
                <button class="delete-goal" data-index="${index}">Delete</button>
            `;
            goalsList.appendChild(goalItem);
        });
    }

    function deleteGoal(index) {
        goals.splice(index, 1);
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }

    function addAsset(category, name, amount) {
        assets[category].push({ name, amount });
        localStorage.setItem('assets', JSON.stringify(assets));
        renderAssets();
    }

    function renderAssets() {
        realEstateList.innerHTML = '';
        vehicleList.innerHTML = '';
        luxuryList.innerHTML = '';
        otherList.innerHTML = '';

        assets.realEstate.forEach((asset, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${asset.name}</span><span>€${asset.amount}</span><button class="delete-asset" data-category="realEstate" data-index="${index}"><i class="fa-solid fa-trash"></i></button>`;
            realEstateList.appendChild(li);
        });

        assets.vehicles.forEach((asset, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${asset.name}</span><span>€${asset.amount}</span><button class="delete-asset" data-category="vehicles" data-index="${index}"><i class="fa-solid fa-trash"></i></button>`;
            vehicleList.appendChild(li);
        });

         assets.luxuries.forEach((asset, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${asset.name}</span><span>€${asset.amount}</span><button class="delete-asset" data-category="luxuries" data-index="${index}"><i class="fa-solid fa-trash"></i></button>`;
            luxuryList.appendChild(li);
        });

        assets.other.forEach((asset, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${asset.name}</span><span>€${asset.amount}</span><button class="delete-asset" data-category="other" data-index="${index}"><i class="fa-solid fa-trash"></i></button>`;
            otherList.appendChild(li);
        });
    }


    transactionList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn') || event.target.parentElement.classList.contains('delete-btn')) {
            const index = event.target.dataset.index || event.target.parentElement.dataset.index;
            if (index !== undefined) {
                transactions.splice(index, 1);
                localStorage.setItem('transactions', JSON.stringify(transactions));
                renderTransactions();
                calculateSummary();
                updateChart()
            }
        }
    });

    goalsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-goal')) {
            const index = event.target.dataset.index;
            if (index !== undefined) {
                deleteGoal(index);
            }
        }
    });

    assetsContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-asset') || event.target.parentElement.classList.contains('delete-asset')) {
            const category = event.target.dataset.category || event.target.parentElement.dataset.category;
            const index = event.target.dataset.index || event.target.parentElement.dataset.index;
            if (category && index !== undefined) {
                deleteAsset(category, index);
            }
        }
    });

    filterType.addEventListener('change', renderTransactions);
    filterCategory.addEventListener('change', renderTransactions);
    sortBy.addEventListener('change', renderTransactions);


    incomeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = document.getElementById('income-date').value;
        const category = document.getElementById('income-category').value;
        const amount = document.getElementById('income-amount').value;
        const description = document.getElementById('income-description').value;
        const recurring = document.getElementById('income-recurring').value;
        addTransaction('income', date, category, amount, description, recurring);
        incomeForm.reset();
    });

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const amount = document.getElementById('expense-amount').value;
        const description = document.getElementById('expense-description').value;
        const recurring = document.getElementById('expense-recurring').value;
        addTransaction('expense', date, category, amount, description, recurring);
        expenseForm.reset();
    });

    fundsTable.addEventListener('change', (event) => {
        if (event.target.classList.contains('fund-amount-input')) {
            updateFunds();
        }
    });


    addGoalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('goal-name').value;
        const amount = document.getElementById('goal-amount').value;
        const dueDate = document.getElementById('goal-due-date').value;
        addGoal(name, amount, dueDate);
        addGoalForm.reset();
    });

    addRealEstateForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('real-estate-name').value;
        const amount = document.getElementById('real-estate-amount').value;
        addAsset('realEstate', name, amount);
        addRealEstateForm.reset();
    });

    addVehicleForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('vehicle-name').value;
        const amount = document.getElementById('vehicle-amount').value;
        addAsset('vehicles', name, amount);
        addVehicleForm.reset();
    });

    addLuxuryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('luxury-name').value;
        const amount = document.getElementById('luxury-amount').value;
        addAsset('luxuries', name, amount);
        addLuxuryForm.reset();
    });

    addOtherForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('other-name').value;
        const amount = document.getElementById('other-amount').value;
        addAsset('other', name, amount);
        addOtherForm.reset();
    });

    budgetContent.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-budget-btn')) {
            const category = event.target.dataset.category;
            const budgetInput = document.getElementById(`${category}-budget`);
            const budgetAmount = parseFloat(budgetInput.value);
            if (!isNaN(budgetAmount)) {
                addBudget(category, budgetAmount);
                budgetInput.value = '';
            }
        }
    });

    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

    function addBudget(category, amount) {
        budgets[category] = amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));
        updateBudgetDisplay(category, amount);
    }

    function updateBudgetDisplay(category, amount) {
        const progressBar = document.getElementById(`${category}-progress`);
        let totalExpenses = 0;
        transactions.forEach(transaction => {
            if (transaction.category === category && transaction.type === 'expense') {
                totalExpenses += parseFloat(transaction.amount);
            }
        });
        const progress = amount > 0 ? Math.min((totalExpenses / amount) * 100, 100) : 0;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    // Submenu functionality
    const dashboardLink = document.querySelector('a[href="#dashboard"]');
    const fundsLink = document.querySelector('a[href="#funds"]');
    const goalsLink = document.querySelector('a[href="#goals"]'); // Select the goals link
    const assetsLink = document.querySelector('a[href="#assets"]');
    const dashboardContent = document.getElementById('dashboard');
    const fundsContent = document.getElementById('funds');
    const goalsContent = document.getElementById('goals'); // Get the goals content


    function showSubmenu(submenu) {
        dashboardContent.style.display = 'none';
        fundsContent.style.display = 'none';
        goalsContent.style.display = 'none';
        assetsContent.style.display = 'none';
        budgetContent.style.display = 'none';

        if (submenu === 'dashboard') {
            dashboardContent.style.display = 'block';
        } else if (submenu === 'funds') {
            fundsContent.style.display = 'block';
        } else if (submenu === 'goals') {
            goalsContent.style.display = 'block';
        } else if (submenu === 'assets') {
            assetsContent.style.display = 'block';
        } else if (submenu === 'budget') {
            budgetContent.style.display = 'block';
        }
    }

    dashboardLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSubmenu('dashboard');
    });

    fundsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSubmenu('funds');
    });

    goalsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSubmenu('goals');
    });

    assetsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSubmenu('assets');
    });

    budgetLink.addEventListener('click', (event) => {
        event.preventDefault();
        showSubmenu('budget');
    });

    function deleteAsset(category, index) {
        assets[category].splice(index, 1);
        localStorage.setItem('assets', JSON.stringify(assets));
        renderAssets();
    }

    function populateCategoryFilter() {
        const incomeCategories = Array.from(incomeForm.querySelectorAll('select[id="income-category"] option')).map(option => option.value);
        const expenseCategories = Array.from(expenseForm.querySelectorAll('select[id="expense-category"] option')).map(option => option.value);
        const allCategories = ['all', ...new Set([...incomeCategories, ...expenseCategories])];

        filterCategory.innerHTML = '';
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            filterCategory.appendChild(option);
        });
    }

    function handleRecurringTransactions() {
        transactions.forEach(transaction => {
            if (transaction.recurring !== 'none' && transaction.lastAdded) {
                const lastAddedDate = new Date(transaction.lastAdded);
                const now = new Date();
                let shouldAdd = false;

                switch (transaction.recurring) {
                    case 'daily':
                        shouldAdd = now.getDate() !== lastAddedDate.getDate();
                        break;
                    case 'weekly':
                         shouldAdd = now.getDate() - lastAddedDate.getDate() >= 7;
                        break;
                    case 'monthly':
                        shouldAdd = now.getMonth() !== lastAddedDate.getMonth();
                        break;
                    case 'yearly':
                        shouldAdd = now.getFullYear() !== lastAddedDate.getFullYear();
                        break;
                }

                if (shouldAdd) {
                     const newDate = new Date();
                    addTransaction(
                        transaction.type,
                        newDate.toISOString().split('T')[0],
                        transaction.category,
                        transaction.amount,
                        transaction.description,
                        transaction.recurring
                    );
                    transaction.lastAdded = newDate.toISOString();
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                }
            }
        });
    }

    // Initial render
    handleRecurringTransactions();
    renderTransactions();
    calculateSummary();
    updateChart();
    updateFundsDisplay();
    renderGoals();
    renderAssets();
    populateCategoryFilter();
    showSubmenu('dashboard'); // Show dashboard by default
    setInterval(handleRecurringTransactions, 60000); // Check every minute
});
