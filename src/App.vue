<template>
  <el-tabs v-model="editableTabsValue" type="card" editable class="demo-tabs" @edit="handleTabsEdit">
    <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
      <upload />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import upload from "./components/upload.vue";

import type { TabPaneName } from "element-plus";
import { ElMessageBox } from "element-plus";

const editableTabsValue = ref("2");
const editableTabs = ref<any>([]);

onMounted(() => {
  addTab("默认");
});

const handleTabsEdit = (targetName: TabPaneName | undefined, action: "remove" | "add") => {
  if (action === "add") {
    ElMessageBox.prompt("请输入名称", "提示", {
      inputPattern: /.+/,
      inputErrorMessage: "必填项",
    })
      .then(({ value }) => {
        addTab(value);
      })
      .catch(() => {});
  } else if (action === "remove") {
    const tabs = editableTabs.value;
    let activeName = editableTabsValue.value;
    if (activeName === targetName) {
      tabs.forEach((tab: any, index: number) => {
        if (tab.name === targetName) {
          const nextTab = tabs[index + 1] || tabs[index - 1];
          if (nextTab) {
            activeName = nextTab.name;
          }
        }
      });
    }

    editableTabsValue.value = activeName;
    editableTabs.value = tabs.filter((tab: any) => tab.name !== targetName);
  }
};

const addTab = (value: string) => {
  editableTabs.value.push({
    title: value,
    name: value,
  });
  editableTabsValue.value = value;
};
</script>

<style></style>
