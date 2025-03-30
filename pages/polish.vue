<template>
    <div class="align-middle justify-center h-full" id="container"
        style="background: url(https://api.maao.cc/paimon?l=1) no-repeat; background-size: contain">
        <el-page-header class="bg-white/90 border-b-1 border-gray-200 border-solid w-full z-1000 blue backdrop-blur-md"
            title="返回" @back="$router.back()" style="padding: 12px">
            <template #content>
                <span class="text-large font-600 mr-3"> AI 润色 </span>
            </template>
            <template #extra>
                <div class="flex items-center">
                    <el-button type="primary" class="ml-2" :icon="Share" @click="sharePage('AI 续写')" circle />
                </div>
            </template>
        </el-page-header>
        <el-skeleton :rows="10" animated v-if="!mounted" class="m-5 w-2/3"/>
        <ClientOnly>
            <public-flexable-component-wrapper>
                <template #desktop><polish-desktop-layout /></template>
                <template #mobile><polish-mobile-layout/></template>
            </public-flexable-component-wrapper>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { Share } from '@element-plus/icons-vue'
import { sharePage } from '@/util/sharePage'

useHead({ title: 'AI 续写' })

const mounted = ref(false)

onMounted(() => mounted.value = true)
</script>