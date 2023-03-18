const form = document.querySelector('form');
const typeSelect = document.querySelector('#type');

// Populate the type dropdown menu with some example values
const types = ['Type 1', 'Type 2', 'Type 3'];
for (let i = 0; i < types.length; i++) {
  let option = document.createElement('option');
  option.text = types[i];
  typeSelect.add(option);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const name = document.querySelector('#name').value;
  const description = document.querySelector('#description').value;
  const type = typeSelect.value;

  // Do something with the form data, such as sending it to a server
  console.log(`Name: ${name}\nDescription: ${description}\nType: ${type}`);
  
  // Reset the form after submission
  form.reset();
  typeSelect.selectedIndex = 0;

  let content = JSON.stringify({
    name: name,
    description: description,
    type: type
  })
  
  fetch('/api/finish_upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: content
  })

  location.href = "/"
});


function update_options() {

  let html_string
  fetch('/api/get_type_entrys').then(response => {return response.json()}).then(data => {
    html_string += `<option value="" disabled selected>Select a type</option>`
    for (entry in data) {
      html_string += `<option value="${data[entry]['name']}">${data[entry]['name']}</option>`
      
    }
    document.getElementById('type').innerHTML = html_string
  })
}

update_options()