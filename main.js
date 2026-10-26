const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

const isWeb = (url) => /^https?:\/\//i.test(url || '');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    backgroundColor: '#07090d',
    title: 'VALIRYAN FREEHOLD',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });

  // Only allow the webview to start with http/https pages, and strip
  // anything that could give web content access to Node or preload scripts.
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    if (!isWeb(params.src)) event.preventDefault();
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

// Downloads go to the user's Downloads folder (same as the Android app).
session.defaultSession.on('will-download', (event, item) => {
  item.setSavePath(path.join(app.getPath('downloads'), item.getFilename()));
});

// Block non-web navigations and popups from every page.
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!isWeb(url) && !url.startsWith('file://')) event.preventDefault();
  });
  contents.setWindowOpenHandler(({ url }) => {
    if (isWeb(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
