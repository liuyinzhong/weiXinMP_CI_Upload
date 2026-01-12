<template>
  <div class="app-container">
    <div class="main-content">
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px"
        class="upload-form"
      >
        <el-form-item label="平台" prop="platform">
          <el-input v-model="form.platform" readonly />
        </el-form-item>
        
        <el-form-item label="项目名称" prop="project">
          <el-input v-model="form.project" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-form-item label="AppID" prop="appid">
          <el-input v-model="form.appid" placeholder="请输入小程序 AppID" />
        </el-form-item>
        
        <el-form-item label="发布描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入发布描述" />
        </el-form-item>
        
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        
        <el-form-item label="私钥路径" prop="privatekey">
          <el-input v-model="form.privatekey" placeholder="请选择私钥文件" readonly />
          <el-button type="primary" @click="selectPrivateKeyFile">选择文件</el-button>
        </el-form-item>
        
        <el-form-item label="工程目录" prop="path">
          <el-input v-model="form.path" placeholder="请选择工程目录" readonly />
          <el-button type="primary" @click="selectDirectory">选择目录</el-button>
        </el-form-item>
        
        <el-form-item label="机器人编号" prop="robot">
          <el-input-number v-model="form.robot" :min="1" :max="30" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="result-container">
        <h3>执行结果</h3>
        <el-scrollbar height="400px">
          <pre>{{ executionResult }}</pre>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

// 表单数据
const form = reactive({
  platform: 'mp-weixin',
  project: '',
  appid: '',
  description: '',
  version: '',
  privatekey: '',
  path: '',
  robot: 1
});

// 表单验证规则
const rules = reactive<FormRules>({
  project: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  appid: [
    { required: true, message: '请输入小程序 AppID', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入发布描述', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  privatekey: [
    { required: true, message: '请输入私钥文件路径', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请选择工程目录', trigger: 'blur' }
  ],
  robot: [
    { required: true, message: '请输入机器人编号', trigger: 'blur' }
  ]
});

// 表单引用
const formRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 执行结果
const executionResult = ref('');

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 生成命令
    const command = `cli publish --platform ${form.platform} --project ${form.project} --upload true --appid ${form.appid} --description ${form.description} --version ${form.version} --privatekey ${form.privatekey} --robot ${form.robot}`;
    
    console.log('生成的命令:', command);
    
    // 执行命令
    loading.value = true;
    executionResult.value = '正在执行命令...\n';
    
    const result = await window.electronAPI.executeCommand(command, (data) => {
      // 实时追加输出
      executionResult.value += data;
    });
    
    executionResult.value += '\n' + result;
  } catch (error: any) {
    executionResult.value += `\n执行失败: ${error.message}`;
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
  form.platform = 'mp-weixin';
  form.robot = 1;
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
    }
  } catch (error) {
    console.error('选择目录失败:', error);
  }
};

// 选择私钥文件
const selectPrivateKeyFile = async () => {
  try {
    const file = await window.electronAPI.selectPrivateKeyFile();
    if (file) {
      form.privatekey = file;
    }
  } catch (error) {
    console.error('选择私钥文件失败:', error);
  }
};
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.upload-form {
  flex: 1;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.result-container {
  flex: 1;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.result-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

pre {
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 4px;
  margin: 0;
}
</style>