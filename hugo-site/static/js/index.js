const YEAR = "2024";
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
const DONORS_CSV_PATH = "/upload_csvs/DASHboard - DonorsExport.csv";
const EXPENSES_CSV_PATH = "upload_csvs/DASHboard - ExpensesExport.csv";

async function getDonors(donorsCsvUrl) {
    const response = await fetch(donorsCsvUrl);
    const donorsCsv = await response.text();
    const donorsCsvRows = donorsCsv.split('\n').slice(1); // Ignore first row
    let monthsWithDonations = {};

    donorsCsvRows.forEach(row => {
        if (row.trim() != "") {
            const [donationDate, donorName, donationAmount] = row.split(",");
            if (donorName != "0" && donationAmount != "0"){
                const donationMonthNumber = parseInt(donationDate.split('/')[0])-1;
                const donationMonthName = MONTHS[donationMonthNumber];
                const donationAmountAsAFloat = parseFloat(donationAmount);
                if (monthsWithDonations.hasOwnProperty(donationMonthName)){
                    monthsWithDonations[donationMonthName].push([donorName, donationAmountAsAFloat]);
                }
                else {
                    monthsWithDonations[donationMonthName] = [[donorName, donationAmountAsAFloat]];
                }
            }
        }
    });

    // Sort such that largest donations go first
    for (let monthName in monthsWithDonations){
        if (monthsWithDonations.hasOwnProperty(monthName)){
            monthsWithDonations[monthName].sort((a, b) => {
                return b[1] - a[1];
            })
        }
    }

    return monthsWithDonations;
}

async function updateDomWithDonations(){
    let monthsWithDonations = await getDonors(DONORS_CSV_PATH);

    let donationsSectionElem = document.getElementById("donations-section");

    let yearTotal = 0;

    MONTHS.forEach(monthName => {
        let monthTotal = 0;
        let tableElem = document.createElement("table");
        tableElem.id = monthName;
        tableElem.classList.add("monthly")
        donationsSectionElem.appendChild(tableElem);

        let captionElem = document.createElement("caption");
        tableElem.appendChild(captionElem);

        let theadElem = document.createElement("thead");
        tableElem.appendChild(theadElem);
        let trElem = document.createElement("tr");
        theadElem.appendChild(trElem);
        let thElemDonorName = document.createElement("th");
        thElemDonorName.textContent = "Donor Name";
        trElem.appendChild(thElemDonorName);
        let thElemAmountContributed = document.createElement("th");
        thElemAmountContributed.textContent = "Amount Contributed";
        trElem.appendChild(thElemAmountContributed)
        
        let tbodyElem = document.createElement("tbody");
        tableElem.appendChild(tbodyElem);
        
        if (monthsWithDonations.hasOwnProperty(monthName)){
            monthsWithDonations[monthName].forEach(([donorName, donationAmount]) => {
                let trElemDonation = document.createElement("tr");
                tbodyElem.appendChild(trElemDonation);
                let tdElemDonorName = document.createElement("td");
                tdElemDonorName.textContent = donorName;
                trElemDonation.appendChild(tdElemDonorName);
                let tdElemDonationAmount = document.createElement("td");
                tdElemDonationAmount.textContent = "$"+donationAmount.toFixed(2);
                trElemDonation.appendChild(tdElemDonationAmount);
                monthTotal += donationAmount;
            })
        }

        captionElem.textContent = `${monthName} ${YEAR} Donations (\$${monthTotal.toFixed(2)})`;

        yearTotal += monthTotal;
    })

    updateVisibleTable();

    document.getElementById("donation-summary").textContent = `${YEAR} Donations YTD: \$${yearTotal.toFixed(2)}`;
}

async function getExpenses(expensesCsvUrl) {
    const response = await fetch(expensesCsvUrl);
    const expensesCsv = await response.text();
    const expensesCsvRows = expensesCsv.split('\n').slice(1); // Ignore first row
    let expenses = {};

    expensesCsvRows.forEach(row => {
        if (row.trim() != "") {
            const [expenseDescription, expenseAmount] = row.split(",");
            if (expenseDescription != "0" && expenseDescription.trim() != "" && expenseAmount != "0"){
                const expenseAmountAsAFloat = parseFloat(expenseAmount);
                if (expenses.hasOwnProperty(expenseDescription)){
                    expenses[expenseDescription] += expenseAmountAsAFloat;
                }
                else {
                    expenses[expenseDescription] = expenseAmountAsAFloat;
                }
            }
        }
    });

    let listOfExpenses = Object.entries(expenses);

    listOfExpenses.sort((a, b) => {
        return b[1] - a[1];
    });

    return listOfExpenses;
}

async function updateDomWithExpenses(){
    let yearTotal = 0;

    let listOfExpenses = await getExpenses(EXPENSES_CSV_PATH);
    let tableElem = document.getElementById("expenses-table");
    
    let captionElem = document.createElement("caption");
    captionElem.textContent = `${YEAR} DASH Itemized Expenses YTD`;
    tableElem.appendChild(captionElem);

    let theadElem = document.createElement("thead");
    tableElem.appendChild(theadElem);
    let trElem = document.createElement("tr");
    theadElem.appendChild(trElem);
    let thElemExpense = document.createElement("th");
    thElemExpense.textContent = "Expense";
    trElem.appendChild(thElemExpense);
    let thElemCost = document.createElement("th");
    thElemCost.textContent = "Cost";
    trElem.appendChild(thElemCost);

    let tbodyElem = document.createElement("tbody");
    tableElem.appendChild(tbodyElem);

    listOfExpenses.forEach(([expenseDescription, expenseAmount]) => {
        let trElemExpense = document.createElement("tr");
        tbodyElem.appendChild(trElemExpense);
        let tdElemExpenseDescription = document.createElement("td");
        tdElemExpenseDescription.textContent = expenseDescription;
        trElemExpense.appendChild(tdElemExpenseDescription);
        let tdElemExpenseAmount = document.createElement("td");
        tdElemExpenseAmount.textContent = "$"+expenseAmount.toFixed(2);
        trElemExpense.appendChild(tdElemExpenseAmount);
        yearTotal += expenseAmount;
    })

    document.getElementById("expenses-summary").textContent = `${YEAR} Expenses YTD: \$${yearTotal.toFixed(2)}`;
}

let now = new Date().getMonth();
let currentMonthIndex = now;

function switchMonth(direction) {
    currentMonthIndex += direction;
    if (currentMonthIndex > now) {
        currentMonthIndex = 0;
    } else if (currentMonthIndex < 0) {
        currentMonthIndex = now;
    }
    updateVisibleTable();
}

function updateVisibleTable() {
    const tables = document.querySelectorAll('.monthly');
    tables.forEach(table => table.classList.remove('visible'));
    document.getElementById(MONTHS[currentMonthIndex]).classList.add('visible');
}

function updateDom(){
    updateDomWithDonations();
    updateDomWithExpenses();
}

window.onload = updateDom; // Initial setup to show the first month