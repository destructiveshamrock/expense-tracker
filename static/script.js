console.log("script ready")
let input_field = document.querySelector('#input')
let char_count =   document.querySelector('#char-count')
input_field.addEventListener("input", function() {
    char_count.style.display = 'block'
    char_count.textContent = `Count: ${input_field.value.length}`
    if (input_field.value.length > 19) {
        char_count.style.color = 'red'
    } else {
        char_count.style.color = 'black'
    }
})


let edit_budget_btn = document.querySelector('#edit-budget-btn')
let budget_display = document.querySelector('#budget-display')
let budget_input = document.querySelector('#budget-input')
let save_budget_button = document.querySelector('#save-budget-button')

function displayNetEarnings() {
    let net_earnings = document.querySelector('#net-money')
    let budget = parseFloat(budget_display.textContent.replace('Budget: $', ''))
    let total_spent = parseFloat(document.querySelector('#total-spent').textContent.replace('Total spent: $', ''))
    // parseFloat converts the string to a number for arithmetic
    // .replace strips the label text, leaving just the number
    let difference = budget - total_spent
    net_earnings.textContent = `Net Money: $${difference.toFixed(2)}`
    // .toFixed(2) formats to always show 2 decimal places
    if (difference <= (budget * 0.05)) {
        net_earnings.style.color = 'red'
    } else {
        net_earnings.style.color = 'black'
    }
}

// hides display, shows input fields for editing
edit_budget_btn.addEventListener('click', function(event) {
    edit_budget_btn.style.display = "none"
    budget_display.style.display = "none"
    budget_input.style.display = 'inline'
    save_budget_button.style.display = 'inline'
})

// sends new budget to Flask, updates display without reload
save_budget_button.addEventListener('click', function(event) {

    event.preventDefault()

    let formData = new FormData()
    formData.append('amount', budget_input.value)

    fetch('/edit-budget', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            edit_budget_btn.style.display = "inline"
            budget_input.style.display = 'none'
            save_budget_button.style.display = 'none'
            budget_display.style.display = "inline"
            budget_display.textContent = `Budget: $${data.budget}`
            displayNetEarnings()
        }
    })
})

let delete_buttons = document.querySelectorAll('.delete-form button')

// reads budget and total from DOM, calculates and displays net money
function attachDeleteListener(button) {
    button.addEventListener('click', function(event) {
        event.preventDefault()
        if (!confirm('Confirm delete expense?')) return
        let id = button.dataset.id
        fetch(`/delete-expense/${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                button.closest('tr').remove()
                document.querySelector('#total-spent').textContent = `Total spent: $${data.total_spent}`
                displayNetEarnings()
                console.log('Deleted successfully!')
            }
        })
    })
}
delete_buttons.forEach(function(button) {
    attachDeleteListener(button)
})

let add_button = document.querySelector('.add-form button')
add_button.addEventListener('click', function(event) {

    event.preventDefault()

    let formData = new FormData()
    formData.append('name', document.querySelector('#input').value)
    formData.append('amount', document.querySelector('input[name="amount"]').value)
    formData.append('category', document.querySelector('select[name="category"]').value)
    formData.append('date', document.querySelector('input[name="date"]').value)

    fetch('/add-expense', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let e = data.expense
            let table = document.querySelector('table') 
            let new_row = document.createElement('tr') // creates a brand new HTML element in memory
            new_row.innerHTML = `                   
                <td>${e.name}</td>
                <td>$${e.amount}</td>
                <td>${e.category}</td>
                <td>${e.date}</td>
                <td>
                    <form class="delete-form">
                        <button type="button" data-id="${e.id}">Delete</button>
                    </form>
                </td>
            ` // sets the full HTML content inside it
            table.appendChild(new_row) // inserts it at the bottom of the table
            let new_delete_button = new_row.querySelector('button')
            attachDeleteListener(new_delete_button)
            document.querySelector('.box').textContent = `Total spent: $${data.total_spent}`
            displayNetEarnings()
            console.log('added successfully')
        }
    })
})

displayNetEarnings()
// delete_buttons.forEach(function(button) {
//     button.addEventListener('click', function(event) { 
//         event.preventDefault() // stops the form submitting normally
//         let id = button.dataset.id
//         let total_box = document.querySelector('.box')
//         fetch(`/delete-expense/${id}`, {
//             method: 'POST'
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.status === 'success') {
//                 button.closest('tr').remove() 
//                 // travels up the HTML tree from the button 
//                 //      until it finds the nearest <tr> parent.
//                 //      So it grabs the whole row.
//                 // .remove() — removes that element from the page entirely.
//                 total_box.textContent = `Total spent: $${data.total_spent}`
//                 console.log('deleted successfully')
//             }
//         })
//     } )
// } )
// the function now has event as a parameter — that's the click event object itself, 
// data- attributes are custom attributes you can attach to any HTML element 
//    to store extra information.
// The dataset of the html button behaves exactly like a dictionary where 
//    data-id becomes the key id and the value is whatever you set it to. 
//    You can add as many data- attributes as you want