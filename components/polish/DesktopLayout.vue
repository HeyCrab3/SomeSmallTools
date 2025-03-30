<template>
    <div class="m-auto" style="height: calc(100vh - 57px)">
        <div class="w-7/12 float-left p-6">
            <div class="fanfic__gen_area">
                <p class="text-xl font-medium">AI 生成结果</p>
                <div class="fanfic__gen_area__content">
                    <el-tabs v-if="result.reasoning">
                        <el-tab-pane label="生成结果" key="1">
                            <el-scrollbar height="50vh">
                                <p class="text-sm">{{ loading ? `正在生成中，已用时 ${usedTime}s` : `本次生成用时 ${usedTime} s` }}</p>
                                <v-md-preview style="background: transparent" :text="result.answer" />
                                <el-button class="mt-2" type="primary" @click="copy(result.answer)">复制</el-button>
                            </el-scrollbar>
                        </el-tab-pane>
                        <el-tab-pane label="推理过程" v-if="result.reasoning" key="2">
                            <el-scrollbar height="50vh">
                                <v-md-preview style="background: transparent" :text="result.reasoning" />
                                <el-button class="mt-2" type="primary" @click="copy(result.reasoning)">复制</el-button>
                            </el-scrollbar>
                        </el-tab-pane>
                    </el-tabs>
                    <el-empty v-else description="请先生成"/>
                </div>
            </div>
        </div>
        <div class="w-5/12 float-right p-6 fanfic__edit_area">
            <el-scrollbar height="90vh">
                <el-alert type="error" title="严禁生成色情、暴力、政治等内容，发现立即封禁IP并移交网警处理" :closable="false" class="block mb-4" />
                <p class="text-xl font-medium mt-2">参数设置</p>
                <el-form :disabled="loading" ref="ruleFormRef" size="large" :model="ruleForm" label-width="120px"
                    class="mt-4" :rules="rules" status-icon>
                    <el-form-item label="模型选择" prop="model">
                        <el-select v-model="ruleForm.model" placeholder="请选择" style="width: 320px">
                            <el-option size="large" v-for="item in modelList" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="原文" prop="content">
                        <el-input type="textarea" v-model="ruleForm.content" placeholder="请输入原文" />
                    </el-form-item>
                    <el-form-item label="想要润色的方向" prop="description">
                        <el-input v-model="ruleForm.description" type="textarea" placeholder="想要润色的方向" />
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
                <PolishUsageGuide />
            </el-scrollbar>
        </div>
    </div>
    <!-- 公共公告组件 -->
    <PublicAnnounceModal />
</template>

<style>
.fanfic__edit_area {
    background: #FFFFFFE7;
    height: 100%;
    border-radius: 15px 0px 0px 15px;
    backdrop-filter: blur(15px);
}

.fanfic__gen_area {
    background-image: linear-gradient(135deg, #d9bbff, #b2d6ff);
    padding: 16px;
    border-radius: 15px;
}

.fanfic__gen_area__content {
    background: #FFFFFFE6;
    padding: 14px;
    margin-top: 10px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
</style>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import OpenAI from 'openai'
import { copy } from '@/util/copy'

const loading = ref(false)
const result = ref({ reasoning: '', answer: '', prompt: '' })
const runtimeConfig = useRuntimeConfig()
const usedTime = ref(0)

// 表单
interface RuleForm {
    model: string
    content: string
    description: string
}

const ruleFormRef = ref<FormInstance>()
const ruleForm: RuleForm = reactive({
    model: 'qwq-plus',
    content: '',
    description: '润色全篇',
})
const rules = ref<FormRules>({
    model: [{ required: true, message: '请选择模型', trigger: 'blur' }],
    content: [{ required: true, message: '请输入原内容', trigger: 'blur' }],
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
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
    usedTime.value = 0

    ElMessage.info('正在生成中，随着字数的增加生成时间会逐级增长，请不要离开本页面')
    loading.value = true
    // 初始化结果对象
    result.value = {
        reasoning: '',
        answer: '',
        prompt: `这是我的文章：${ruleForm.content}，请帮我进行一下润色，想要润色的方向是${ruleForm.description}，要保留原文，只需要文章具体内容，其他的包括文章梗概和故事发展方向之类的可以省略。`
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
</script>