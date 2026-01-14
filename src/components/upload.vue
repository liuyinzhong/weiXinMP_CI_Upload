<template>
  <div class="app-container">
    <div class="main-content">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-width="120px"
            class="upload-form"
          >
            <el-form-item label="git仓库根目录" prop="path">
              <el-input v-model="form.path" placeholder="请选择工程目录" readonly>
                <template #prepend>{{ CurrentBranch }}</template>
                <template #append>
                  <el-button type="primary" @click="selectDirectory">选择目录</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="生产分支名称" prop="prodBranchName">
                  <el-select v-model="form.prodBranchName" placeholder="请选择">
                    <el-option label="master" value="master" />
                    <el-option label="main" value="main" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="测试分支名称" prop="testBranchName">
                  <el-input
                    v-model.trim="form.testBranchName"
                    placeholder="请输入"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="平台" prop="platform">
              <el-input v-model="form.platform" readonly />
            </el-form-item>

            <el-form-item label="项目名称" prop="project">
              <el-input
                v-model="form.project"
                placeholder="请选择目录后自动获取"
                readonly
              />
            </el-form-item>

            <el-form-item label="上传密钥" prop="privatekey">
              <el-input
                v-model="form.privatekey"
                placeholder="请选择上传密钥文件"
                readonly
              >
                <template #append>
                  <el-button type="primary" @click="selectPrivateKeyFile">
                    选择文件
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="AppID" prop="appid">
              <el-input
                v-model="form.appid"
                placeholder="选择密钥文件后自动获取"
                readonly
              />
            </el-form-item>

            <el-form-item label="发版描述" prop="description">
              <el-input v-model="form.description" placeholder="请输入发版描述" />
            </el-form-item>

            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="请输入版本号" />
            </el-form-item>

            <el-form-item label="机器人编号" prop="robot">
              <el-input-number
                v-model="form.robot"
                :min="1"
                :max="30"
                :precision="0"
                :step="1"
                style="width: 100%"
              >
                <template #suffix>
                  <el-tooltip
                    content="机器人编号就是使用哪个默认微信号上传小程序，取值1~30"
                  >
                    ?
                  </el-tooltip>
                </template>
              </el-input-number>
            </el-form-item>

            <el-form-item>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-button
                    style="width: 100%"
                    type="warning"
                    @click="buildTest"
                    :loading="loading"
                  >
                    发版体验
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button
                    style="width: 100%"
                    block
                    @click="mergeToTest(false)"
                    :loading="loading"
                  >
                    仅合并
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button
                    style="width: 100%"
                    type="success"
                    @click="buildProd"
                    :loading="loading"
                  >
                    {{ CurrentBranch }}发版生产
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button style="width: 100%" @click="showDialog">教程</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
          <div>
            <el-text type="danger">
              ·有冲突了，需要先解决冲突!!!，然后手动回到原分支
            </el-text>
          </div>
          <div>
            <el-text>·运行期间不要操作git仓库!!!</el-text>
          </div>
        </el-col>
        <el-col :span="12">
          <el-button style="width: 100%" @click="clearResult">清空结果</el-button>
          <el-scrollbar ref="scrollbarRef" height="450px">
            <pre
              style="
                background-color: #f5f7fa;
                padding: 0 10px;
                min-height: 450px;
                white-space: pre-wrap;
                word-wrap: break-word;
              "
              >{{ executionResult }}</pre
            >
          </el-scrollbar>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="教程" v-model="dialogVisible" width="50%">
      <div>
        <el-text>1、HBuilder X必需设置环境变量</el-text>
        <br />
        <el-text>
          ·
          <el-link type="primary" target="_blank" href="https://hx.dcloud.net.cn/cli/env">
            环境变量的配置
          </el-link>
        </el-text>
      </div>

      <div>
        <el-text>
          2、HBuilder X 必需和本工具同时运行,才能使用它的cli.exe程序，让该工具正常使用
        </el-text>
        <br />
      </div>

      <div>
        <el-text>3、HBuilder X 必须已安装 weapp-miniprogram-ci 插件</el-text>
        <br />
        <el-text>
          ·
          <el-link
            type="primary"
            target="_blank"
            href="https://ext.dcloud.net.cn/plugin?name=weapp-miniprogram-ci"
          >
            插件地址
          </el-link>
        </el-text>
      </div>

      <div>
        <el-text>4、必须是 DCloud appid 的项目成员</el-text>
        <br />
        <el-text>
          ·
          <el-link type="primary" target="_blank" href="https://dev.dcloud.net.cn">
            加入项目成员
          </el-link>
        </el-text>
      </div>

      <div>
        <el-text>5、必须有安装git,并且配置好环境变量</el-text>
        <br />
        <el-text>
          ·
          <el-link
            type="primary"
            target="_blank"
            href="https://git-scm.com/book/zh/v2/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git"
          >
            git的安装和配置
          </el-link>
        </el-text>
      </div>

      <div>
        <el-text>
          6、获取小程序上传密钥。(如果你的公网出口ip是固定的，可开启并配置。否则关闭白名单)
        </el-text>
      </div>
      <div>
        <el-text>
          ·
          <el-link
            type="primary"
            target="_blank"
            href="https://hx.dcloud.net.cn/cli/publish-mp-weixin?id=uploadprivatekey"
          >
            上传密钥获取教程
          </el-link>
        </el-text>
      </div>
      <div>完成以上配置即可开始使用</div>
      <br />
      <div>
        <el-text>· 目前仅支持使用HBuilder所开发的uni-app项目上传微信小程序</el-text>
      </div>
      <br />
      <div>
        <el-text>
          【发版体验】：把当前分支的代码合并到test,并且在test分支进行编译上传到微信公众平台,上传后再切换回原分支
        </el-text>
      </div>
      <div>
        <el-text>
          【仅合并】：把当前分支的代码合并到test,合并后再切换回原分支，不执行发版操作
        </el-text>
      </div>
      <div>
        <el-text>
          【发版生产】：把当前分支的代码编译上传到微信公众平台，不执行合并操作
        </el-text>
      </div>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";

onMounted(() => {
  // 监听窗口聚焦事件，重新获取分支名称
  window.addEventListener("window-focused", handleWindowFocus);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener("window-focused", handleWindowFocus);
});

// 处理窗口聚焦事件
const handleWindowFocus = () => {
  // 只有在已经选择了目录的情况下才重新获取分支名称
  if (form.path) {
    getCurrentBranch();
    getBranchList();
  }
};

// 表单数据
const form = reactive({
  path: "",
  prodBranchName: "master",
  testBranchName: "test",
  platform: "mp-weixin",
  project: "",
  appid: "",
  description: "",
  version: "",
  privatekey: "",
  robot: 1
});

// 表单验证规则
const rules = reactive<FormRules>({
  path: [{ required: true, message: "请选择工程目录", trigger: "blur" }],
  prodBranchName: [{ required: true, message: "请输入生产分支名称", trigger: "blur" }],
  testBranchName: [{ required: true, message: "请输入测试分支名称", trigger: "blur" }],
  project: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  appid: [{ required: true, message: "请输入小程序 AppID", trigger: "blur" }],
  description: [{ required: true, message: "请输入发版描述", trigger: "blur" }],
  version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
  privatekey: [{ required: true, message: "请输入私钥文件路径", trigger: "blur" }],
  robot: [{ required: true, message: "请输入机器人编号", trigger: "blur" }]
});

// 表单引用
const formRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 执行结果
const executionResult = ref("");

// 当前分支名称
const CurrentBranch = ref("");
// 当前仓库本地分支列表
const BranchList = ref<string[]>([]);

/**
 * 上传到微信小程序CI
 * @param isClearResult 是否清空右边已有的命令行结果
 */
const ci_upload = async (isClearResult: boolean) => {
  return new Promise(async (resolve, reject) => {
    if (isClearResult) {
      clearResult();
    }

    // 生成命令
    const command = `cli publish --platform ${form.platform} --project ${
      form.project
    } --upload true --appid ${removeSpaces(form.appid)} --description ${removeSpaces(
      form.description
    )} --version ${removeSpaces(form.version)} --privatekey ${removeSpaces(
      form.privatekey
    )} --robot ${form.robot}`;

    // 执行命令
    loading.value = true;
    executionResult.value += "\n正在执行发版命令...";
    executionResult.value += "\n" + command;

    try {
      const result = await window.electronAPI.executeCommand(command, (data) => {
        // 实时追加输出
        executionResult.value += data;
      });
      executionResult.value += "\n" + result;
      resolve(result);
    } catch (error: any) {
      reject(new Error(error.message));
      return;
    } finally {
      loading.value = false;
    }
  });
};

/**
 * 构建测试版本
 */
const buildTest = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      executionResult.value = "\n表单验证失败";
      return;
    }

    mergeToTest(true);
  });
};

/**
 * 构建生产版本
 */
const buildProd = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid) => {
    if (!valid) {
      executionResult.value = "\n表单验证失败";
      return;
    }

    if (CurrentBranch.value !== form.prodBranchName) {
      executionResult.value += "\n当前分支不是生产分支，不能构建生产版本";
      return;
    }
    ci_upload(true);
  });
};

/**
 * 合并当前分支到测试分支
 * @param isCiUpload 是否在test分支上执行微信小程序CI上传
 */
const mergeToTest = async (isCiUpload: boolean) => {
  if (!form.path) {
    executionResult.value = "\n请选择工程目录";
    return;
  }

  if (!form.testBranchName) {
    executionResult.value = "\n请输入测试分支名称";
    return;
  }

  /* 克隆当前名称，避免切换窗口时当前分支名称被改变，以至于合并后无法回到原始分支 */
  const originalBranch = CurrentBranch.value;

  loading.value = true;
  executionResult.value = "正在执行命令...\n";

  try {
    let status = "";

    status = await executeCommand(form.path, `git status --porcelain`);
    if (status !== "") {
      executionResult.value += "\n当前分支有未提交的文件，请先提交";
      return;
    }

    executionResult.value += `\n***准备将${CurrentBranch.value}合并到test分支...`;

    executionResult.value += "\n***拉取当前分支代码...\n";
    executionResult.value += await executeCommand(
      form.path,
      `git pull origin ${CurrentBranch.value}`
    );
    executionResult.value += "***已拉取\n";

    executionResult.value += "\n***推送本地到当前远程分支...\n";
    executionResult.value += await executeCommand(
      form.path,
      `git pull origin ${CurrentBranch.value}`
    );
    executionResult.value += "***已推送\n";

    executionResult.value += "\n***切换到test分支...\n";
    executionResult.value += await executeCommand(form.path, `git checkout test`);
    executionResult.value += "***已切换\n";

    executionResult.value += "\n***在test分支拉取最新代码...\n";
    executionResult.value += await executeCommand(form.path, `git pull origin test`);
    executionResult.value += "***已拉取\n";

    executionResult.value += `\n***正在合并${CurrentBranch.value}到test...\n`;
    executionResult.value += await executeCommand(
      form.path,
      `git merge ${CurrentBranch.value}`
    );
    executionResult.value += "***已合并\n";

    executionResult.value += "\n***推送本地更改到远程test分支...\n";
    executionResult.value += await executeCommand(form.path, `git push origin test`);
    executionResult.value += "***已推送\n";

    if (isCiUpload) {
      executionResult.value += "\n***在test分支上提交体验版\n";
      await ci_upload(false);
      executionResult.value += "\n***已提交\n";
    }

    executionResult.value += `\n***合并成功！切换回原 ${originalBranch} 分支\n`;
    executionResult.value += await executeCommand(
      form.path,
      `git checkout ${originalBranch}`
    );
    executionResult.value += "***已切换\n";
  } catch (error: any) {
    executionResult.value += `\n执行失败: 请检查是否发生文件冲突！！！\n`;
  } finally {
    loading.value = false;
  }
};

/**
 * 清空执行结果
 */
const clearResult = () => {
  executionResult.value = "";
};

// 选择目录
const selectDirectory = async () => {
  try {
    const directory = await window.electronAPI.selectDirectory();
    if (directory) {
      form.path = directory;
      // 提取目录最后一级作为 project 名称
      const pathParts = directory.split(/[\\/]/);
      const projectName = pathParts[pathParts.length - 1];
      if (projectName) {
        form.project = projectName;
      }

      getCurrentBranch();
      getBranchList();
    }
  } catch (error) {
    console.error("选择目录失败:", error);
  }
};

// 选择私钥文件
const selectPrivateKeyFile = async () => {
  try {
    const file = await window.electronAPI.selectPrivateKeyFile();
    if (file) {
      form.privatekey = file;
      const match = file.match(/private\.([a-zA-Z0-9]+)\.key/);
      const appid = match ? match[1] : "";
      form.appid = appid;
    }
  } catch (error) {
    console.error("选择私钥文件失败:", error);
  }
};

/* 获取当前分支名称 */
const getCurrentBranch = async () => {
  await window.electronAPI.executeCommand(
    `cd ${form.path} && git rev-parse --abbrev-ref HEAD`,
    (data) => {
      data = data.replace("\n", "");
      CurrentBranch.value = data;
      console.log("当前分支:", data);
    }
  );
};

/** 获取当前仓库的分支列表 */
const getBranchList = async () => {
  await window.electronAPI.executeCommand(`cd ${form.path} && git branch`, (data) => {
    // '  dayuan\n  liu-master\n  master\n  test\n  uat-master\n  v2.3.1\n  v2.4.0\n  v2.5.0\n* v2.6.0数据脱敏\n'
    //未实现
  });
};

const scrollbarRef = ref<any>();
const inputSlider = (value: any) => {
  scrollbarRef.value!.setScrollTop(value as number);
};

watch(
  () => executionResult.value,
  (newValue) => {
    inputSlider(99999999);
  }
);

/**
 * 执行命令行命令
 * @param execPath 命令执行路径
 * @param command 命令行语句
 * @returns 命令行执行的结果
 */
const executeCommand = async (execPath: string, command: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let output = "";

      // 构建完整命令，切换到指定目录后执行命令
      const fullCommand = `cd ${execPath} && ${command}`;

      // 执行命令并收集输出
      await window.electronAPI.executeCommand(fullCommand, (data) => {
        output += data;
      });

      resolve(output);
    } catch (error: any) {
      reject(error.message);
    }
  });
};

const dialogVisible = ref(false);
const showDialog = () => {
  dialogVisible.value = true;
};
const closeDialog = () => {
  dialogVisible.value = false;
};

/* 移除字符串中的空格 */
const removeSpaces = (str: string) => {
  return str.replace(/\s+/g, "");
};
</script>

<style scoped></style>
