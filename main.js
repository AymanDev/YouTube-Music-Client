'use strict';
const DiscordRPC = require('discord-rpc');
const {app, BrowserWindow, Menu, remote} = require('electron');

const clientId = '503099918488043520';

let win;
const menuTemplate = [
  {
    label: "Interface",
    submenu: [
      {role: "Reload"}
    ]
  }
];

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 700});
  win.setMinimumSize(300, 300);
  win.setSize(800, 700);
  win.setResizable(true);
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
let prevArgs = [];

function setActivity() {
  if (!rpc || !win) {
    return;
  }
  const args = win.getTitle().split(' - ');
  let smallImage = 'play';
  let details = args[0];
  let state = args[1];
  let smallImageText = 'Listening';

  if (prevInfo !== win.getTitle()) {
    prevInfo = win.getTitle();

    if (args.length > 1) {
      prevArgs = args;
    }
  }

  if (args.length < 2) {
    smallImage = 'pause';
    smallImageText = 'Paused';
    details = prevArgs[0];
    state = prevArgs[1];
  }

  rpc.setActivity({
    details: details,
    state: state,
    startTimestamp,
    largeImageKey: 'youtubemusic_logo',
    largeImageText: 'YouTube Music',
    smallImageKey: smallImage,
    smallImageText: smallImageText,
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