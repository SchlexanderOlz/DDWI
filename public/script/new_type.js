const submitBtn = document.getElementById('type_submit');

submitBtn.addEventListener('click', () => {
  const nameInput = document.getElementById('type_name');
  const name = nameInput.value;
  
  if (!name) {
    alert('Please enter a name');
    return;
  }

  let content = JSON.stringify({ name: name })
  
  fetch('/api/new_type', {
    method: 'PUT',
    headers: {
        'Content-Type' : 'application/json'
    },
    body: content
  })
  
  nameInput.value = '';
});