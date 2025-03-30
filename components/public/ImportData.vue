<template>
    <el-button @click="visible = true" size="large">导入</el-button>
    <el-dialog append-to="#container" v-model="visible" title="导入模板数据">
        <div class="flex flex-col">
            <el-input type="textarea" :rows="10" v-model="data" placeholder="将他人提供的JSON格式的模板复制到这里，然后点击导入"></el-input>
            <el-button type="primary" @click="importData">导入</el-button>
        </div>
        <template #footer>
            <el-button type="primary" @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

const emit = defineEmits(['import'])
const visible = ref(false)
const data = ref('')
const importData = () => {
    try {
        const parsedData = JSON.parse(data.value)
        emit('import', parsedData)
        ElMessage.success('数据导入成功！')
        visible.value = false
    } catch (error) {
        ElMessage.error('数据导入失败，请确保输入的格式正确！')
    }
}
</script>