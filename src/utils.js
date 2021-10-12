import { appState } from "./app";
import { drag_start } from "./app";
import { task_edit } from "./app";
import { task_delete } from "./app";
export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};
export const editInStorage = function (obj, key) {
  const storageData = getFromStorage(key);
    let id;
    for (let i = 0; i < storageData.length; i++) {
      if(storageData[i].id == obj.id)
      {
        id = i;
        break;
      }
    }
    storageData[id] = obj;
  localStorage.setItem(key, JSON.stringify(storageData));
};
export const RemoveFromStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  let id;
  for (let i = 0; i < storageData.length; i++) {
    if(storageData[i].id == obj.id)
    {
      id = i;
      break;
    }
  }
  storageData.splice(id, 1);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const WriteTasks = function (obj, key) {
  document.querySelector('#done').innerHTML=""; 
  document.querySelector('#to_do').innerHTML="";
  document.querySelector('#doing').innerHTML="";
  for (let i = 0; i < obj.tasks.length; i++) {
    let DOM;
    switch(obj.tasks[i].type) {
      case 0:
        DOM = document.querySelector('#to_do');
        break;
      case 1:
        DOM = document.querySelector('#doing');
        break;
      case 2:
        DOM = document.querySelector('#done');
        break;
    }
    var task = document.createElement('div'); 
    task.innerHTML =
    `
      <div id="${obj.tasks[i].id}" draggable="true" class="card" style="width: 90%; margin-top: 10px;">
        <div class="card-body">
          <h5 class="card-title">${obj.tasks[i].heading.length>9 ? obj.tasks[i].heading.substring(0, 9) + "..." : obj.tasks[i].heading}</h5>
          <p class="card-text" style="height: 20px; width: fit-content; overflow: hidden;">${obj.tasks[i].text.length>15 ? obj.tasks[i].text.substring(0, 15) + "..." : obj.tasks[i].text}</p>
          <button id="${obj.tasks[i].id}" type="button" class="btn btn-primary">Edit</button>
          <button id="${obj.tasks[i].id}" type="button" class="btn btn-danger">Delete</button>
        </div>
      </div>
    `;
    DOM.appendChild(task);
    task.addEventListener("dragstart", drag_start);
    task.querySelector(".btn-primary").addEventListener("click", task_edit);
    task.querySelector(".btn-danger").addEventListener("click", task_delete);
  }
  editInStorage(obj, key);
};

export const Register = function (User, login, password) {
  const newUser = new User(login, password);
  User.save(newUser);
};
export const isExist = function(login)
{
  const storageData = getFromStorage('users');
  let id;
  for (let i = 0; i < storageData.length; i++) {
    if(storageData[i].login == login)
    {
      return true;
    }
  }
  return false;
}
export const userList = function()
{
  const data = getFromStorage("users");
  let users_list = document.querySelector('#users_list');
  users_list.innerHTML = '';
  users_list.innerHTML += `<option value="${appState.currentUser.id}">${appState.currentUser.login}</option>`;
  for (let i = 0; i < data.length; i++) {
    if (data[i].login != appState.currentUser.login)
    {
      users_list.innerHTML += `<option value="${data[i].id}">${data[i].login}</option>`;
    }
  }
};
