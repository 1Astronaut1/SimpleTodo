import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import sign_in_header from "./templates/sign-in-header.html";
import not_sign_in_header from "./templates/not-sign-in-header.html";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import admin from "./templates/admin.html";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { editInStorage, WriteTasks } from "./utils";
import { Register } from "./utils";
import { getFromStorage } from "./utils";
import { isExist } from "./utils";
import { RemoveFromStorage } from "./utils";
import { userList } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";

export const appState = new State();
appState.currentUser = null;
appState.admin = null;
let session = null;

const loginForm = document.querySelector("#app-login-form");
const registerForm = document.querySelector("#app-register-form");
const register_button = document.querySelector("#register-button");
const delete_button = document.querySelector("#delete_button");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (appState.currentUser == null)
  {
    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    if (authUser(login, password))
    {
      document.querySelector("#app-login-form").innerHTML = sign_in_header;
      document.querySelector("#app-login-form p").textContent = `${appState.currentUser.login}`;
      document.querySelector("#content").innerHTML = taskFieldTemplate;
      document.querySelector("#to_do").addEventListener("dragover", drag_over);
      document.querySelector("#to_do").addEventListener("drop", drag_drop);
      document.querySelector("#doing").addEventListener("dragover", drag_over);
      document.querySelector("#doing").addEventListener("drop", drag_drop);
      document.querySelector("#done").addEventListener("dragover", drag_over);
      document.querySelector("#done").addEventListener("drop", drag_drop);
      document.querySelector("#CreateTask").addEventListener("click", create_task);
      document.querySelector("#regordel").innerHTML = '<button id="app-login-btn" class="btn btn-outline-danger" type="submit" data-toggle="modal" data-target="#DeleteModal">Delete account</button>';
      session = appState.currentUser;
      if(appState.currentUser.admin)
      {
        document.querySelector("#admin_menu").innerHTML = admin;
        userList();
        showUserInfo();
        document.querySelector('#users_list').addEventListener('change', showUserInfo);
        document.querySelector('#user_password').addEventListener('change', changePassword);
        document.querySelector("#IsAdmin").addEventListener('change', changeAdministration);
        document.querySelector("#admin_delete").addEventListener('click', adminDelete);
      }
      WriteTasks(session, session.storageKey);
    }
    else
    {
      document.querySelector("#content").innerHTML = noAccessTemplate;
    }
  }
  else
  {
      document.querySelector("#app-login-form").innerHTML = not_sign_in_header;
      document.querySelector("#content").innerHTML = "";
      document.querySelector("#regordel").innerHTML = '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#RegisterModal">Register</button>';
      appState.currentUser = null;
      appState.admin = null;
  }
});
register_button.onclick = function(event) 
{ 
  const errorField = document.querySelector("#Error_message");
  const formData = new FormData(registerForm);
  const login = formData.get("login");
  const password = formData.get("password");
  errorField.style.display = "none";
  errorField.classList = "text-danger";
  if (login.length < 2)
  {
    errorField.textContent = "Login must contain at least 2 characters";
    errorField.style.display = "block";
  }
  else if (password.length < 4)
  {
    errorField.textContent = "Password must contain at least 4 characters";
    errorField.style.display = "block";
  }
  else if (isExist(login))
  {
    errorField.textContent = "This user already exists";
    errorField.style.display = "block";
  }
  else
  {
    Register(User, login, password);
    errorField.textContent = "The account has been successfully created";
    errorField.classList = "text-success";
    errorField.style.display = "block";
  }
};
delete_button.onclick = function(event)
{
  RemoveFromStorage(appState.currentUser, appState.currentUser.storageKey);
  document.querySelector("#app-login-form").innerHTML = not_sign_in_header;
  document.querySelector("#content").innerHTML = "";
  document.querySelector("#regordel").innerHTML = '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#RegisterModal">Register</button>';
  appState.currentUser = null;
  appState.admin = null;
}
function create_task()
{
  const task = new Task('New Task');
  session.tasks.push(task);
  WriteTasks(session, 'users');
}
export function drag_start(event)
{
  event.dataTransfer.setData("text/plain", event.target.id);
  event.dataTransfer.dropEffect = "move";
  document.querySelector("#to_do").style.background = "#EFE";
  document.querySelector("#doing").style.background = "#EFE";
  document.querySelector("#done").style.background = "#EFE";
}
export function task_edit(event)
{
  let id;
  for (let i = 0; i < session.tasks.length; i++) {
    if(session.tasks[i].id == event.target.id)
    {
      id = i;
      break;
    }
  }
  document.querySelector("#EditTaskTitle").value = session.tasks[id].heading;
  document.querySelector("#EditTaskText").value = session.tasks[id].text;
  const modal = new bootstrap.Modal(document.querySelector("#EditTask"));
  document.querySelector("#save_button textarea").textContent = id;
  modal.show();
}
document.querySelector("#save_button").onclick = function(event)
{
  let id = document.querySelector("#save_button textarea").textContent;
  console.log(id);
  session.tasks[id].heading = document.querySelector("#EditTaskTitle").value;
  session.tasks[id].text = document.querySelector("#EditTaskText").value;
  WriteTasks(session, 'users');
}
export function task_delete(event)
{
  let id;
  for (let i = 0; i < session.tasks.length; i++) {
    if(session.tasks[i].id == event.target.id)
    {
      id = i;
      break;
    }
  }
  session.tasks.splice(id, 1);
  WriteTasks(session, 'users');
}
function drag_over(event)
{
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}
function drag_drop(event)
{
  document.querySelector("#to_do").style.background = "#FFF";
  document.querySelector("#doing").style.background = "#FFF";
  document.querySelector("#done").style.background = "#FFF";
  event.preventDefault();
  const data = document.getElementById(event.dataTransfer.getData("text/plain"));
  if (event.target.id == "to_do" || event.target.id == "doing" || event.target.id == "done")
  {
    event.target.appendChild(data);
    data.addEventListener("dragstart", drag_start);
    data.querySelector(".btn-primary") .addEventListener("click", task_edit);
    data.querySelector(".btn-danger") .addEventListener("click", task_delete);
    let id;
    for (let i = 0; i < session.tasks.length; i++) {
      if(session.tasks[i].id == event.dataTransfer.getData("text/plain"))
      {
        id = i;
        break;
      }
    }
    if (event.target.id == "to_do")
    {
      session.tasks[id].type = 0;
    }
    if (event.target.id == "doing")
    {
      session.tasks[id].type = 1;
    }
    if (event.target.id == "done")
    {
      session.tasks[id].type = 2;
    }
    WriteTasks(session, 'users');
  }
}
function showUserInfo()
{
  const data = getFromStorage("users");
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == document.querySelector("#users_list").value)
    {
      appState.admin = data[i];
      session = appState.admin;
      document.querySelector("#user_password").value = data[i].password;
      document.querySelector("#IsAdmin").checked = data[i].admin;
      WriteTasks(appState.admin, 'users');
      break;
    }
  }
}
function changePassword()
{
  session.password = document.querySelector("#user_password").value;
  editInStorage(session, 'users')
}
function changeAdministration()
{
  session.admin = document.querySelector("#IsAdmin").checked;
  editInStorage(session, 'users')
}
function adminDelete()
{
  RemoveFromStorage(session, session.storageKey);
  userList();
  showUserInfo();
}