// BUDGET CONTROLLER
let budgetController = (() => {

    let Expense = function (id ,description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let Income = function (id ,description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    let calculateTotal = function(type) {
        let sum = 0

        data.allItems[type].forEach((cur) => {
            sum += cur.value
        })
        data.totals[type] = sum
    }

    let data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            // Create new item based on 'income' or 'expense' type
            if (type === 'expense') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'income') {
                newItem = new Income(ID, des, val)
            }

            // Push it into our data structure
            data.allItems[type].push(newItem)

            // Return the new element
            return newItem
        },
        deleteItems: function(type, id) {
            let ids, index

            ids = data.allItems[type].map((current) => current.id)
            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },
        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('expense')
            calculateTotal('income')

            // Calculate the budget: income - expenses
            data.budget = data.totals.income - data.totals.expense

            // Calculate the percentage of income that we spent
            if (data.totals.income > 0) {
                data.percentage = Math.round(data.totals.expense / data.totals.income * 100)
            } else {
                data.percentage = -1
            }

        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data)
        }
    }

})()


// UI CONTROLLER
let UIController = ( () => {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }

    // noinspection JSAnnotator
    return {
        getInput: function () {
            return {
                type : document.querySelector(DOMStrings.inputType).value,  // Will be either income or expense
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function(obj, type) {
            let html, newHtml, element

            // Create HTML string with placeholder text
            if (type === 'income') {
                element = DOMStrings.incomeContainer

                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'expense') {
                element = DOMStrings.expensesContainer

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', obj.value)

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },
        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },
        clearFields: function() {
            let fields, fieldsArr

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach((currentValue) => {
                currentValue.value = ""
            })

            fieldsArr[0].focus()
        },
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget + 'KM'
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome + 'KM'
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExpense + 'KM'

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }
        },
        getDOMStrings: function () {
            return DOMStrings
        }
    }

})()


// GLOBAL APP CONTROLLER
let controller = ((budgetCtrl, UICtrl) => {

    let setupEventListeners = () => {
        let DOM = UICtrl.getDOMStrings()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }

    let updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        let budget = budgetCtrl.getBudget()

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    let ctrlAddItem = () => {
        let input, newItem

        // 1. Get the field input data
        input = UICtrl.getInput()

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the fields
            UICtrl.clearFields()

            // 5. Calculate and update budget
            updateBudget()
        }
    }

    let ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItems(type, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID)

            // 3. Update and show the new budget
            updateBudget()
        }
    }

    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            })
            setupEventListeners()
        }
    }

})(budgetController, UIController)

controller.init()