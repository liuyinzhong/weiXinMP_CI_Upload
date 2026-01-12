import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { exec } from "child_process";
import iconv from "iconv-lite";

// 防止垃圾回收
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "微信小程序 CI 上传工具",
  });

  // 加载渲染进程
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
  }

  // 打开开发者工具（可选）
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// 处理表单提交，执行命令
ipcMain.on("execute-command", (event, command) => {
  console.log("执行命令:", command);

  const child = exec(command, { encoding: "buffer" });

  // 实时输出标准输出
  if (child.stdout) {
    child.stdout.on("data", (data) => {
      try {
        // 先尝试 UTF-8 解码（现代命令行工具通常使用 UTF-8）
        const utf8Output = data.toString("utf8");
        // 检查是否有明显的乱码特征
        if (!/[\u4e00-\u9fa5]/.test(utf8Output) || /�/.test(utf8Output)) {
          // 如果没有中文字符或者有乱码标记，尝试 GBK 解码
          const gbkOutput = iconv.decode(data, "gbk");
          event.sender.send("command-output", gbkOutput);
        } else {
          // UTF-8 解码成功，直接使用
          event.sender.send("command-output", utf8Output);
        }
      } catch (error) {
        // 如果所有解码尝试都失败，使用 binary 格式
        event.sender.send("command-output", data.toString("binary"));
      }
    });
  }

  // 实时输出错误输出
  if (child.stderr) {
    child.stderr.on("data", (data) => {
      try {
        // 先尝试 UTF-8 解码（现代命令行工具通常使用 UTF-8）
        const utf8Output = data.toString("utf8");
        // 检查是否有明显的乱码特征
        if (!/[\u4e00-\u9fa5]/.test(utf8Output) || /�/.test(utf8Output)) {
          // 如果没有中文字符或者有乱码标记，尝试 GBK 解码
          const gbkOutput = iconv.decode(data, "gbk");
          event.sender.send("command-output", gbkOutput);
        } else {
          // UTF-8 解码成功，直接使用
          event.sender.send("command-output", utf8Output);
        }
      } catch (error) {
        // 如果所有解码尝试都失败，使用 binary 格式
        event.sender.send("command-output", data.toString("binary"));
      }
    });
  }

  // 命令执行完成
  child.on("close", (code) => {
    if (code === 0) {
      event.sender.send("command-result", { success: true, message: "命令执行完成" });
    } else {
      event.sender.send("command-result", { success: false, message: `命令执行失败，退出码: ${code}` });
    }
  });

  // 命令执行出错
  child.on("error", (error) => {
    event.sender.send("command-result", { success: false, message: error.message });
  });
});

// 处理选择目录
ipcMain.on("select-directory", (event) => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
      title: "选择工程目录",
    })
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        event.sender.send("directory-selected", result.filePaths[0]);
      }
    })
    .catch((error) => {
      console.error("选择目录失败:", error);
      event.sender.send("directory-selected", "");
    });
});

// 处理选择私钥文件
ipcMain.on("select-privatekey-file", (event) => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      title: "选择私钥文件",
      filters: [
        { name: "Key Files", extensions: ["key"] },
        { name: "All Files", extensions: ["*"] },
      ],
    })
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        event.sender.send("privatekey-file-selected", result.filePaths[0]);
      }
    })
    .catch((error) => {
      console.error("选择私钥文件失败:", error);
      event.sender.send("privatekey-file-selected", "");
    });
});

// 应用就绪后创建窗口
app.on("ready", createWindow);

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// macOS 上点击dock图标时重新创建窗口
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
