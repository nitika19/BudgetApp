// BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description , value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description , value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    Expense.prototype.calcPercentages = function(totalInc){

        if(totalInc>0)
        this.percentage = Math.round( (this.value / totalInc) * 100 );
        else
        this.percentage = -1;

    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0 
        },
        budget : 0,
        percentage: -1
    };
    return {
        addItem : function(type,des,val) {
            var newItem,ID;

            //create new Id
            if(data.allItems[type].length > 0){
                ID= data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            

            // create new item based on 'inc' and 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            
            else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            

            // push it into our data structure
            data.allItems[type].push(newItem);

            // return the new elemet
            return newItem;
        },
        deleteItem: function(type,id){

            var ids = data.allItems[type].map(function(current){
                return  current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }

        },
        CalculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }

        },
        calculatePercentages: function(){
             
            data.allItems.exp.forEach(function(current){
                current.calcPercentages(data.totals.inc);
            });

        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    }
    
})();


// UI CONTROLLER
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLable: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber =  function(num,type){
        var numSplit,int,dec;
        // + or - before the number exactly 2 decial points 
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length>3){
            int = int.substr(0,int.length - 3) + ','+ int.substr(int.length-3,3);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+' ) + ' ' + int + '.' + dec;

    };
    var nodeListForEach = function(list,callback){
        for(var i = 0; i<list.length; i++){
            callback(list[i],i);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.inputType).value, // can be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem : function(obj,type){
            var html,newHtml;

            // Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        deleteListItem : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', '+ DOMStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach( function( current , index, array){
                current.value = "";
            });

            fieldArr[0].focus();
        },
        displayBudget: function(obj){

            var type = (obj.budget > 0) ? 'inc': 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            } else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMStrings.expensesPercentagesLable);
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index]>0)
                current.textContent = percentages[index] + '%';
                else
                current.textContent = '---';
            });

        },
        displayMonth: function(){
            var now,year,month,months;
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ' ' + year;

        },
        changedType: function(){

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');  
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },
        getDOMStrings: function(){
            return DOMStrings;
        }
    }


})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){
    // all event listener
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click',CtrlAddItem);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.keyCode === 13){
                CtrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.CalculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the percentages 
        UICtrl.displayPercentages(percentages);

    };

    var CtrlAddItem = function(){
        var input,newItems;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItems = budgetCtrl.addItem(input.type,input.description,input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItems,input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. To calculate and update the percentages
            updatePercentages();
        }
    }
    var ctrlDeleteItem = function(event){
        var itemID,splitID,ID,type;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. Calculate the update percentages
            updatePercentages();

        }
    };
    return {
        init : function(){
            console.log('Appliciation has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc : 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }
})(budgetController,UIController);

controller.init();