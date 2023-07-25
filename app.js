const showSelect = document.getElementById('show');
let currentPage = 1;
let rowsPerPage = parseInt(showSelect.value);

var start = 0;
var limit = rowsPerPage;

const url = './ajax.php';

window.onload = () => {
  getExistingData(start, limit);
  getTotalMembers();
};

const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

showSelect.addEventListener('change', function () {
  rowsPerPage = parseInt(showSelect.value);
  currentPage = 1;
  updateTable();
});

prevButton.addEventListener('click', (e) => {
  if(currentPage !== 1){
    currentPage--;
    updateTable();
  }

})

nextButton.addEventListener('click', () => {
  currentPage++;
  console.log(currentPage)
  updateTable();
})

const updateTable = () => {
  const allTr = document.querySelectorAll('tbody tr');
  const s = (currentPage - 1) * rowsPerPage;
  const e = s + rowsPerPage - 1;
  let count = 0;

  for (let i = 0; i < allTr.length; i++) {
    if (count >= s && count <= e) {
      allTr[i].style.display = '';
    } else {
      allTr[i].style.display = 'none';
    }
    count++;
  }

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = e >= allTr.length - 1;
};


const searchInput = document.querySelector('#searchData');

searchInput.addEventListener('keyup', (e) => {
  const searchTerm = e.target.value.toLowerCase();

  const tableRows = document.querySelectorAll('tbody tr');
  tableRows.forEach((row) => {
    const nameCell = row.querySelector("td:nth-child(2)");
    const name = nameCell.textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
    
  });
});

const getExistingData = async (start, limit) => {
  const data = {
    key: 'getExistingData',
    start: start,
    limit: limit
  };
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(data)
  };

  try{
    const response = await fetch(url, requestOptions);

    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }

    const jsonData = await response.json();

    if(!jsonData?.reachedMax){
      let dataAppend = '';
      const tbody = document.querySelector('tbody');
      jsonData.forEach(row => {
        dataAppend = `
        <tr id='Member_${row.id}'>
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.email}</td>
          <td>
            <button onclick="view(${row.id})" class="btn btn-success">View</button>
            <button onclick="edit(${row.id})" class="btn btn-warning">Edit</button>
            <button onclick="deleteMember(${row.id})" class="btn btn-danger">Delete</button>
          </td>
        </tr>
        `;
        tbody.innerHTML += dataAppend;
      });
      start += limit;
      getExistingData(start, limit);
    }


  }catch(error){
    showToast(false, 'Error', error);
    console.Error(error)
  }
}

const getTotalMembers = async () => {
  const data = {
    key: 'getTotalMembers'
  };
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(data)
  };

  try{

    const response = await fetch(url, requestOptions);

    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }

    const jsonData = await response.json();

    document.querySelector('#totalMembers').textContent = jsonData?.totalMembers;

  }catch(error){
    showToast(false, 'Error', error);
    console.Error(error)
  }
}



const successToast = document.querySelector('#success-Toast');
const successToastTitle = document.querySelector('#success-toast-title')
const successToastBody = document.querySelector('#success-toast-body')
const dangerToast = document.querySelector('#danger-Toast');
const dangerToastTitle = document.querySelector('#danger-toast-title')
const dangerToastBody = document.querySelector('#danger-toast-body')

const showToast = (type, title, body) => {
  if(type){
    successToast.classList.add('show');
    successToastTitle.innerHTML = title;
    successToastBody.innerHTML = body;
    setTimeout(() => {
      successToast.classList.remove('show');
    }, 5000);
  } else {
    dangerToast.classList.add('show');
    dangerToastTitle.innerHTML = title;
    dangerToastBody.innerHTML = body;
    setTimeout(() => {
      dangerToast.classList.remove('show');
    }, 5000);
  }
}

const overlayPopUp = document.querySelector('.create-form');
const popUp = document.querySelector('#pup-up-form');
const closeBtn = document.querySelector('#pup-up-form .bx-x');
const showPopUpBtn = document.querySelector('#addNew');

const showHidePU = (action, type) => {
  const title = document.querySelector('#pup-up-form h2');
  const addRowBtn = document.querySelector('#addRow');
  const editRow = document.querySelector('#editRow');
  document.querySelector('input#Name').value = '';
  document.querySelector('input#Email').value = '';
  document.querySelector('input#Name').classList.remove('danger')
  document.querySelector('input#Email').classList.remove('danger')
  if(action === 'show'){
    if(type === 'add'){
      title.textContent = 'Add New Member:';
      addRowBtn.style.display = '';
      editRow.style.display = 'none';
    } else if(type === 'edit') {
      title.textContent = 'Edit Member\'s Info:';
      editRow.style.display = '';
      addRowBtn.style.display = 'none';
    }
    overlayPopUp.classList.add('show');
    popUp.classList.add('show');
  } else {
    overlayPopUp.classList.remove('show');
    popUp.classList.remove('show');
  }

  closeBtn.addEventListener('click', () => showHidePU('hide'));
  overlayPopUp.addEventListener('click', (e) => {
    e.target === overlayPopUp && showHidePU('hide')
  })
}

const checkInput = (input) => {
  if(input.value.trim() !== ''){
    input.classList.remove('danger');
    return true;
  } else {
    input.classList.add('danger');
    return false;
  }
}

showPopUpBtn.addEventListener('click', () => {
  showHidePU('show', 'add');
  const addRow = document.querySelector('#addRow');

  addRow.addEventListener('click', (e) => {
    e.preventDefault();

    const nameInput = document.querySelector('input#Name');
    const emailInput = document.querySelector('input#Email');
    if(checkInput(nameInput) && checkInput(emailInput)){
      addMember(nameInput.value, emailInput.value);
      nameInput.value = '';
      emailInput.value = '';
    }
  })
});

const addMember = async (name, email) => {
  const data = {
    key: 'addMember',
    name: name,
    email: email
  };
  const requestOptions = {
    method: 'POST',
    headers: {"Content-Type":"application/json",},
    body: JSON.stringify(data)
  };
  try{
    const response = await fetch(url, requestOptions);

    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }

    const jsonData = await response.json();

    if(jsonData.success){
      showToast(true, 'Success!', 'The new member has been added successfully... Congratulations!')
      document.querySelector('tbody').innerHTML = '';
      getExistingData(start, limit);
      getTotalMembers()
      showHidePU('hide', 'add')
    } else {
      showToast(false, 'Oops! Changes Failed!', 'the attempt to add the new member was unsuccessful. Please try again later or report the issue.')
      showHidePU('hide', 'add')
    }


  }catch(error){
    showToast(false, 'Error!', error);
    console.Error(error)
  }
}

const getRowData = async (id) => {
  const data = {
    key: 'getRowData',
    id: id
  };
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(data)
  };

  try{
    const response = await fetch(url, requestOptions);
    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }
    const jsonData = await response.json();
    document.querySelector('input#Name').value = jsonData?.name;
    document.querySelector('input#Email').value = jsonData?.email;

  }catch(error){
    showToast(false, 'Error!', error);
  }
};

const edit = (id) => {
  const hiddenId = document.querySelector('input#hiddenId');
  hiddenId.value = id
  showHidePU('show', 'edit');
  getRowData(hiddenId.value);
}

const updateRow = async (rowId, newName, newEmail) => {
  const data = {
    key: 'updateRow',
    id: rowId,
    name: newName,
    email: newEmail
  };
  const requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json",},
    body: JSON.stringify(data)
  };
  try{
    const response = await fetch(url, requestOptions);
    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }
    const jsonData = await response.json();
    if(jsonData.success){
      showToast(true, 'Success!', 'The member information has been successfully updated!');
      const selector = 'tbody tr#Member_'+rowId;
      const specificRow = document.querySelector(selector);
      specificRow.querySelector("td:nth-child(2)").textContent = newName;
      specificRow.querySelector("td:nth-child(3)").textContent = newEmail;
    }else{
      showToast(false, 'Error!', 'Oops! Changes Failed!', 'the attempt to update member\'s info was unsuccessful. Please try again later or report the issue.');
    }
    showHidePU('hide', 'edit');
  }catch(error){
    showToast(false, 'Error!', error);
  }
}

document.querySelector('#editRow').addEventListener('click', (e) => {
  e.preventDefault();
  const nameInput = document.querySelector('input#Name');
  const emailInput = document.querySelector('input#Email');
  const hiddenId = document.querySelector('input#hiddenId');
  if(checkInput(nameInput) && checkInput(emailInput)){
    updateRow(hiddenId.value, nameInput.value, emailInput.value);
  }
})

const deleteMember = async (id) => {
  const confirmed = window.confirm("Are you sure you want to proceed?");
  if(confirmed){
    const data = {
      key: 'deleteRow',
      id: id
    };
    const requestOptions = {
      method: 'POST',
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(data)
    };
  
    try{
      const response = await fetch(url, requestOptions);
      if(!response.ok){
        throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
      }
  
      const jsonData = await response.json();
      if(jsonData.hasOwnProperty("success") && jsonData.success){
        showToast(true, 'Success!', 'You have successfully deleted the member...');
        const selector = 'tbody tr#Member_'+id;
        document.querySelector(selector).remove();
        getTotalMembers();
      }else {
        showToast(false, 'Failed!', 'The process of deleting this member was interrupted. Please retry or report the issue.');
      }
    }catch(error){
      showToast(false, 'Error!', error);
      console.error(error)
    }

  }
}

const view = (id) => {
  const overlay = document.querySelector('.overlay-view');
  const viewForm = document.querySelector('.overlay-view .view-form');
  const closeBtn = document.querySelector('.overlay-view .view-form .bx-x');
  const cancelBtn = document.querySelector('.view-form #cancel');


  overlay.classList.add('show');
  viewForm.classList.add('show');


  viewData(id);

  
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
    viewForm.classList.remove('show');
  })
  cancelBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
    viewForm.classList.remove('show');
  })
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay){
      overlay.classList.remove('show');
      viewForm.classList.remove('show');
    }
  })
}

const viewData = async (id) => {
  const viewId = document.querySelector('#viewId');
  const viewName = document.querySelector('#viewName');
  const viewEmail = document.querySelector('#viewEmail');
  const data = {
    key: 'getRowData',
    id: id
  };
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(data)
  };
  
  try{
    const response = await fetch(url, requestOptions);
    if(!response.ok){
      throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
    }
    const jsonData = await response.json();
    viewId.innerHTML = id;
    viewName.innerHTML = jsonData?.name;
    viewEmail.href = 'mailto:'+jsonData?.email
    viewEmail.innerHTML = jsonData?.email;
  
  }catch(error){
    showToast(false, 'Error!', error);
  }

}
