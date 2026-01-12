import { contextBridge, ipcRenderer } from "electron";

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld("electronAPI", {
  // 执行命令
  executeCommand: (command: string, onOutput: (data: string) => void) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send("execute-command", command);

      // 监听命令实时输出
      const handleOutput = (_event: any, data: string) => {
        onOutput(data);
      };

      // 监听命令执行结果
      const handleResult = (_event: any, result: { success: boolean; message: string }) => {
        if (result.success) {
          resolve(result.message);
        } else {
          reject(new Error(result.message));
        }

        // 移除监听器
        ipcRenderer.removeListener("command-output", handleOutput);
        ipcRenderer.removeListener("command-result", handleResult);
      };

      ipcRenderer.on("command-output", handleOutput);
      ipcRenderer.on("command-result", handleResult);
    });
  },
  // 选择目录
  selectDirectory: () => {
    return new Promise((resolve) => {
      ipcRenderer.send("select-directory");

      // 监听目录选择结果
      const handleDirectorySelected = (_event: any, directory: string) => {
        resolve(directory);

        // 移除监听器
        ipcRenderer.removeListener("directory-selected", handleDirectorySelected);
      };

      ipcRenderer.on("directory-selected", handleDirectorySelected);
    });
  },
  // 选择私钥文件
  selectPrivateKeyFile: () => {
    return new Promise((resolve) => {
      ipcRenderer.send("select-privatekey-file");

      // 监听私钥文件选择结果
      const handlePrivateKeyFileSelected = (_event: any, file: string) => {
        resolve(file);

        // 移除监听器
        ipcRenderer.removeListener("privatekey-file-selected", handlePrivateKeyFileSelected);
      };

      ipcRenderer.on("privatekey-file-selected", handlePrivateKeyFileSelected);
    });
  },
});

// 类型定义，方便渲染进程使用
declare global {
  interface Window {
    electronAPI: {
      executeCommand: (command: string, onOutput: (data: string) => void) => Promise<string>;
      selectDirectory: () => Promise<string>;
      selectPrivateKeyFile: () => Promise<string>;
    };
  }
}
