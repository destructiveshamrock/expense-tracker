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


let delete_buttons = document.querySelectorAll('.delete-form button')

function attachDeleteListener(button) {
    button.addEventListener('click', function(event) {
        event.preventDefault()
        let id = button.dataset.id
        fetch(`/delete-expense/${id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                button.closest('tr').remove()
                document.querySelector('.box').textContent = `Total spent: $${data.total_spent}`
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
                    <form class="delete-form" onsubmit="return confirm('Confirm delete expense')">
                        <button type="button" data-id="${e.id}">Delete</button>
                    </form>
                </td>
            ` // sets the full HTML content inside it
            table.appendChild(new_row) // inserts it at the bottom of the table
            let new_delete_button = new_row.querySelector('button')
            attachDeleteListener(new_delete_button)
            document.querySelector('.box').textContent = `Total spent: $${data.total_spent}`
            console.log('added successfully')
        }
    })
})

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