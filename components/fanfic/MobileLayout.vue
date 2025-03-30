<template>
    <div class="fanfic__edit_area_mobile p-2" style="height: calc(100vh-57px)">
        <el-alert type="error" title="严禁生成色情、暴力、政治等内容，发现立即封禁IP并移交网警处理" :closable="false" class="block mt-2" />
        <van-empty v-if="!result.reasoning" description="还没有生成，上拉下方操作面板打开参数区域" />
        <el-card v-else>
            <van-tabs>
                <van-tab title="生成结果">
                    <el-scrollbar height="70vh">
                        <p class="text-sm">{{ loading ? `正在生成中，已用时 ${usedTime}s` : `本次生成用时 ${usedTime} s` }}</p>
                        <v-md-preview style="background: transparent" :text="result.answer" />
                        <van-button class="mt-2" type="primary" @click="copy(result.answer)">复制</van-button>
                    </el-scrollbar>
                </van-tab>
                <van-tab title="推理过程" v-if="result.reasoning">
                    <el-scrollbar height="70vh">
                        <v-md-preview style="background: transparent" :text="result.reasoning" />
                        <van-button class="mt-2" type="primary" @click="copy(result.reasoning)">复制</van-button>
                    </el-scrollbar>
                </van-tab>
            </van-tabs>
        </el-card>
        <!-- 下方的功能区域 -->
        <van-floating-panel :anchors="anchors">
            <van-tabs>
                <van-tab title="参数配置">
                    <el-form :disabled="loading" ref="ruleFormRef" size="large" :model="ruleForm" label-width="100px"
                        class="mt-4" :rules="rules" status-icon>
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
                            <PublicImportData @import="importData" />
                            <el-button @click="exportData(ruleFormRef)" class="ml-2">导出</el-button>
                        </el-form-item>
                    </el-form>
                </van-tab>
                <van-tab title="使用说明">
                    <PublicUsageGuide />
                </van-tab>
                <van-tab title="导入导出">
                    <el-scrollbar height="530px"><FanficImportExportUsage /></el-scrollbar>
                </van-tab>
                <van-tab title="好饭分享">
                    <FanficExample />
                </van-tab>
            </van-tabs>
        </van-floating-panel>
    </div>
    <PublicAnnounceModal />
</template>

<style>
.fanfic__edit_area_mobile {
    background: #FFFFFFE7;
    height: 100%;
    backdrop-filter: blur(15px);
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

const anchors = [
    100,
    Math.round(0.4 * window.innerHeight),
    Math.round(0.8 * window.innerHeight),
]

// 表单
interface RuleForm {
    model: string
    characters: string
    description: string
    length: number
}

const ruleFormRef = ref<FormInstance>()
const ruleForm: RuleForm = reactive({
    model: 'qwq-plus',
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
            showFailToast('表单输入不合法！')
        }
    })
}

const exportData = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            navigator.clipboard.writeText(JSON.stringify(ruleForm)).then(() => {
                ElMessage.success('复制成功！')
            }).catch(() => {
                ElMessage.error('复制失败！')
            })
        } else {
            ElMessage.error('请先填写完整表单后再导出')
        }
    })
}

const importData = (data: RuleForm) => {
    ruleForm.model = data.model
    ruleForm.characters = data.characters
    ruleForm.description = data.description
    ruleForm.length = data.length
}

const start = async () => {
    usedTime.value = 0

    showToast('正在生成中，随着字数的增加生成时间会逐级增长，请不要离开本页面')
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
        showSuccessToast('生成完成！')
    } catch (err: any) {
        console.error(err)
        showFailToast(`生成失败: ${err.message}`)
    } finally {
        clearInterval(interval)
        loading.value = false
    }
}
</script>