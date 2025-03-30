<template>
    <el-dialog v-model="visible" :title="`公告 (${processTime(data.time * 1000)})`">
        <div>
            <v-md-preview :text="data.content"></v-md-preview>
        </div>
        <template #footer>
            <el-button type="primary" @click="visible = false">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { getAnnouncement } from '@/util/getAnnouncement';
import { processTime } from '@/util/processTime';

const visible = ref(false)
const data = ref({
    time: 0,
    content: '',
})

onMounted(() => {
    getAnnouncement().then((res) => {
        if (typeof res === 'string') {
            ElMessage.error(`获取公告失败：${res}`)
        } else {
            visible.value = true
            data.value = res
        }
    })
})
</script>