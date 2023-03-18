function sort(order) {
    
}

function search() {
    var input, filter, table, tr, td, i, j, txtValue, rowMatches;
    input = document.getElementById("search_input");
    filter = input.value.toUpperCase();
    table = document.getElementById("list");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
      rowMatches = false;
      for (j = 0; j < tr[i].getElementsByTagName("td").length; j++) {
        td = tr[i].getElementsByTagName("td")[j];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            rowMatches = true;
          }
        }
      }
      if (rowMatches) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
}


function update_entrys() {
    fetch('/api/get_entries').then(response => {
        return response.json()
    }).then(data => {
        let html_content = "";
        
        html_content += '<tr class="list-headers">'
        for (let key in data[0]) {
            html_content += '<th class="list-head" @onclick="sort("asc")">' + key + '</th>'
        }
        html_content += '</tr>'
        
        for (let entry in data) {
            html_content += '<tr class="list-section">'
            for (let key in data[entry]) {
                if (key === "Download") {
                    html_content += '<td class="list-item">'+ '<a href="' + '/api/download/' + data[entry][key] + '">' + 'Download' + '</a></td>'
                } else {
                    html_content += '<td class="list-item">' + data[entry][key] + '</td>'
                }
            }
            html_content += '</tr>'

        }
        document.getElementById("list-contents").innerHTML = html_content
    })
}

update_entrys()