<!-- 
组件可以复用 ，将util/is-mobile.ts复制到其他项目即可
在SSR环境下不能使用这个组件！
使用时候使用template name=xxx并在外围包裹本组件即可实现手机端的自动识别
-->

<template>
    <template v-if="!mobile">
        <slot name="desktop"/>
    </template>
    <template v-else>
        <slot name="mobile"/>
    </template>
</template>

<script lang="ts" setup>
import isMobile from '@/util/is-mobile'

const mobile: Ref<boolean | null> = ref(null)
onMounted(() => {
    if (typeof window === 'undefined') console.error('本组件只能在CSR环境下加载！')
    else {
        mobile.value = isMobile()
        console.log(`当前设备为 ${mobile.value ? '手机' : 'PC'}`)
    }
})
</script>