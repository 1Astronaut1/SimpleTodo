import { appState } from "../app";
import { User } from "../models/User";
import { getFromStorage } from "../utils";

export const authUser = function (login, password) {
  const user = new User(login, password);
  if (!user.hasAccess) return false;
  const storageData = getFromStorage('users');
    let id;
    for (let i = 0; i < storageData.length; i++) {
      if(storageData[i].login == user.login)
      {
        id = i;
        break;
      }
    }
  appState.currentUser = storageData[id];
  return true;
};