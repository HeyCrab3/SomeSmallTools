<template>
    <div class="w-full h-full align-middle justify-center text-center">
        <div class="relative top-24">
            <h2 class="text-2xl text-medium mb-6">做饭小工具</h2>
            <el-card shadow="hover" :style="{ width: '360px', marginBottom: '20px' }" v-for="item in listItem" class="m-auto">
                <div :style="{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }">
                    <span :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }">
                        <el-typography-text>{{ item.title }}</el-typography-text>
                    </span>
                    <el-link type="primary" @click="go(item.goto)">进入<el-icon><ArrowRight /></el-icon></el-link>
                </div>
            </el-card>
            <p class="text-neutral-500">Powered By Nuxt | ©2025 Crab Studio. All Rights Reserved.</p>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: '做饭小工具' })
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const listItem = [
    {
        title: '同人文生成器',
        goto: '/fanfic'
    },
    {
        title: '加入我们的QQ群',
        goto: 'https://qm.qq.com/q/lUashgU3qa'
    },
    {
        title: '给我们在 Github 上一个 Star',
        goto: 'https://github.com/HeyCrab3/BankCardPlayingTools'
    },
]

const go = (url: string) => {
    if(url.includes('http')) {
        ElMessage.info('正在前往外部页面。')
        window.open(url, '_blank')
    }
    else router.push(url)
}
</script>