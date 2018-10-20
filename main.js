'use strict';
const DiscordRPC = require('discord-rpc');
const {app, BrowserWindow, Menu, remote} = require('electron');

const clientId = '503099918488043520';

let win;
const menuTemplate = [
  {
    label: "Discord RPC",
    submenu: [
      {label: "Reload"}
    ]
  },
  {
    label: "View",
    submenu: [
      {role: "Reload"}
    ]
  }
];

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 829, height: 625});
  win.setResizable(false);
  //win.openDevTools();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  // and load the index.html of the app.
  win.loadURL('https://music.youtube.com/');
  win.on('closed', () => {
    win = null;
  });

}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

// only needed for discord allowing spectate, join, ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({transport: 'ipc'});
let startTimestamp = new Date();
let prevInfo = '';

function setActivity() {
  if (!rpc || !win) {
    return;
  }

  if(prevInfo !== win.getTitle()){
    startTimestamp = new Date();
    prevInfo = win.getTitle();
  }
  const args = win.getTitle().split(' - ');
  rpc.setActivity({
    details: args[0],
    state: args[1],
    startTimestamp,
    largeImageKey: 'youtubemusic_logo',
    largeImageText: 'Listening',
    instance: false,
  });
}

rpc.on('ready', () => {
  setActivity();
  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login({clientId}).catch(console.error);