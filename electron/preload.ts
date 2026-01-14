import { contextBridge, ipcRenderer } from "electron";

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld("electronAPI", {
  // 执行命令
  executeCommand: (command: string, onOutput: (data: string) => void) => {
    return new Promise((resolve, reject) => {
      // 生成唯一标识符
      const commandId = Math.random().toString(36).substr(2, 9);

      ipcRenderer.send("execute-command", { command, commandId });

      // 监听命令实时输出
      const handleOutput = (_event: any, data: { commandId: string; output: string }) => {
        // 只处理对应命令的输出
        if (data.commandId === commandId) {
          onOutput(data.output);
        }
      };

      // 监听命令执行结果
      const handleResult = (
        _event: any,
        data: { commandId: string; result: { success: boolean; message: string } }
      ) => {
        // 只处理对应命令的结果
        if (data.commandId === commandId) {
          if (data.result.success) {
            resolve(data.result.message);
          } else {
            reject(new Error(data.result.message));
          }

          // 移除监听器
          ipcRenderer.removeListener("command-output", handleOutput);
          ipcRenderer.removeListener("command-result", handleResult);
        }
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
        ipcRenderer.removeListener(
          "privatekey-file-selected",
          handlePrivateKeyFileSelected
        );
      };

      ipcRenderer.on("privatekey-file-selected", handlePrivateKeyFileSelected);
    });
  }
});

// 监听窗口聚焦事件，转发给渲染进程
ipcRenderer.on("window-focused", () => {
  // 创建自定义事件并分发
  const event = new Event("window-focused");
  window.dispatchEvent(event);
});

// 类型定义，方便渲染进程使用
declare global {
  interface Window {
    electronAPI: {
      executeCommand: (
        command: string,
        onOutput: (data: string) => void
      ) => Promise<string>;
      selectDirectory: () => Promise<string>;
      selectPrivateKeyFile: () => Promise<string>;
    };
  }
}
