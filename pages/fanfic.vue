<template>
    <div class="align-middle justify-center text-center" id="container">
        <el-page-header
            class="fixed bg-white/50 border-b-1 border-gray-200 border-solid w-full z-1000 blue backdrop-blur-md"
            @back="$router.back()" style="padding: 12px">
            <template #content>
                <span class="text-large font-600 mr-3"> 同人文生成器 </span><span class="text-sm mr-2"
                    style="color: var(--el-text-color-regular)">
                    好不好吃看运气
                </span>
            </template>
            <template #extra>
                <div class="flex items-center">
                    <el-button type="primary" class="ml-2" :icon="Share" @click="sharePage">分享本页面</el-button>
                </div>
            </template>
        </el-page-header>
        <div class="m-auto text-center p-4 relative top-12">
            <el-alert title="由于AI生成内容的局限性，我们无法保证做出来的饭一定好吃。生成的结果可以编辑。" show-icon type="warning" class="w-4/5" />
            <el-alert title="有部分老师不喜欢AI生成文章，请自行平衡后使用。Use it at your own risk!" show-icon type="error" class="w-4/5" />
            <el-form :disabled="loading" ref="ruleFormRef" size="large" :model="ruleForm" label-width="100px"
                width="80vw" class="mt-4" :rules="rules" status-icon>
                <el-form-item label="模型选择" prop="model">
                    <el-select v-model="ruleForm.model" placeholder="请选择" style="width: 320px">
                        <el-option size="large" v-for="item in modelList" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="角色" prop="characters">
                    <el-input v-model="ruleForm.characters" placeholder="请输入角色，以逗号或顿号分隔" />
                </el-form-item>
                <el-form-item label="简单描述" prop="description">
                    <el-input v-model="ruleForm.description" type="textarea" placeholder="请输入描述" />
                </el-form-item>
                <el-form-item label="文章长度" prop="length">
                    <el-input-number v-model="ruleForm.length" :min="100" :max="10000" />
                </el-form-item>
                <el-form-item>
                    <el-button :loading="loading" type="primary" @click="generate(ruleFormRef)">生成</el-button>
                    <el-button @click="resetForm(ruleFormRef)">重置</el-button>
                </el-form-item>
            </el-form>
            <el-form-item>
                <p>使用本功能即代表您已阅读并同意 <el-link
                        href="https://terms.alicdn.com/legal-agreement/terms/common_platform_service/20230728213935489/20230728213935489.html?spm=a2c4g.11186623.0.0.5a06b0a8s1VVaR"
                        target="_blank">《阿里云百炼服务协议》</el-link> 和 <el-link
                        href="https://terms.aliyun.com/legal-agreement/terms/suit_bu1_ali_cloud/suit_bu1_ali_cloud202107091605_49213_5_4_26149.html?spm=a2c4g.11186623.0.0.27e3208f6VgE2K"
                        target="_blank">《阿里云法律声明及隐私权政策》</el-link></p>
            </el-form-item>
            <el-divider />
            <el-card v-if="result.answer" class="m-auto w-full" v-loading="loading" element-loading-text="生成中...">
                <div slot="header" class="text-lg font-bold">生成结果 (用时：{{ usedTime }}s)</div>
                <el-tabs class="mt-4" v-model="activeTab" type="border-card">
                    <el-tab-pane label="内容（可编辑）" name="content">
                        <el-input type="textarea" :rows="15" v-model="result.answer" />
                        <el-button class="mt-4" @click="copy(result.answer)" type="primary">复制内容</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="推理过程" name="reasoning" v-if="result.reasoning">
                        <el-input type="textarea" :rows="15" v-model="result.reasoning" readonly />
                        <el-button class="mt-4" @click="copy(result.reasoning)" type="primary"
                            v-if="result.reasoning">复制推理过程</el-button>
                    </el-tab-pane>
                    <el-tab-pane label="提示词" name="prompt">
                        <el-input type="textarea" :rows="10" v-model="result.prompt" readonly />
                        <el-button class="mt-4" @click="copy(result.prompt)" type="primary">复制提示词</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
            <el-alert v-else title="请先填写表单并点击生成按钮。" type="info" show-icon />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import OpenAI from 'openai'
import { Share } from '@element-plus/icons-vue'

useHead({ title: '同人文生成器' })

const loading = ref(false)
const result = ref({ reasoning: '', answer: '', prompt: '' })
const runtimeConfig = useRuntimeConfig()
const activeTab = ref('content')
const usedTime = ref(0)

// 表单
interface RuleForm {
    model: string
    characters: string
    description: string
    length: number
}

const ruleFormRef = ref<FormInstance>()
const ruleForm: RuleForm = reactive({
    model: 'deepseek-r1',
    characters: '',
    description: '',
    length: 500
})
const rules = ref<FormRules>({
    model: [{ required: true, message: '请选择模型', trigger: 'blur' }],
    characters: [{ required: true, message: '请输入角色', trigger: 'blur' }],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
    length: [{ required: true, message: '请输入长度', trigger: 'blur' }]
})

const modelList = [
    {
        label: 'DeepSeek R1',
        value: 'deepseek-r1'
    },
    {
        label: '通义千问 QwQ-Plus（新上架）',
        value: 'qwq-plus'
    },
    {
        label: '通义千问 Max',
        value: 'qwen-max-latest'
    },
    {
        label: '零一万物 Yi-Large',
        value: 'yi-large'
    }
]

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}

const generate = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            start()
        } else {
            ElMessage.error('表单输入不合法！')
        }
    })
}

const start = async () => {
    ElMessage.info('正在生成中，随着字数的增加生成时间会逐级增长，请不要离开本页面')
    loading.value = true
    // 初始化结果对象
    result.value = {
        reasoning: '',
        answer: '',
        prompt: `你现在是一个同人文生成器，我现在需要一篇${ruleForm.length}字的同人文，主要角色是${ruleForm.characters}，描述是${ruleForm.description}，只需要文章具体内容，其他的包括文章梗概和故事发展方向之类的可以省略。`
    }

    const interval = setInterval(() => usedTime.value++, 1000)

    const client = new OpenAI({
        apiKey: runtimeConfig.public.openai_key || 'INVAILD_KEY',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        dangerouslyAllowBrowser: true
    })

    try {
        const stream = await client.chat.completions.create({
            model: ruleForm.model,
            messages: [{ role: 'system', content: result.value.prompt }],
            temperature: 1.5,
            stream: true  // 启用流式模式
        })

        // 流式处理
        for await (const chunk of stream) {
            // 处理推理链
            // @ts-ignore
            if (chunk.choices[0].delta?.reasoning_content) {
                // @ts-ignore
                result.value.reasoning += chunk.choices[0].delta.reasoning_content
            }

            // 处理内容
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
                result.value.answer += content
            }
        }
        ElMessage.success('生成完成！')
    } catch (err: any) {
        console.error(err)
        ElMessage.error(`生成失败: ${err.message}`)
    } finally {
        clearInterval(interval)
        loading.value = false
    }
}

const copy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
        ElMessage.success('复制成功！')
    }).catch(() => {
        ElMessage.error('浏览器不支持复制，请手动复制')
    })
}

const sharePage = () => {
    const url = window.location.href + "?utm_source=share&utm_medium=web&utm_campaign=fanfic"
    if (navigator.share) {
        navigator.share({
            title: '同人文生成器',
            text: '我在使用同人文生成器，快来试试吧！',
            url
        }).then(() => {
            ElMessage.success('分享成功！')
        }).catch(() => {
            ElMessage.error('分享失败！')
        })
    } else {
        ElMessage.error('您的浏览器不支持分享功能！')
    }
}
</script>