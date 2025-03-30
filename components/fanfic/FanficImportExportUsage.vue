<template>
    <div>
        <el-card shadow="never">
            <div slot="header" class="text-lg font-bold">怎样使用导入导出功能？</div>
            <v-md-preview :text="content"/>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
const content = `
### 导入
在参数配置页拉到最底下，选择“导入”，在弹出的对话框中粘贴得到的模板参数，然后点击“导入”    
::: warning 注意
如果部分参数不合法或者为空那么一样会导入，此时需要手动补全
:::
::: danger 警告
请确保拿到的参数中只含有正常的文字并且不存在让大模型出现反复思考的问题，否则将会导致无法正常生成或直接无法使用！
:::
在导入成功后，参数配置页应该正常显示刚刚导入的参数。此时可以直接点击生成按钮生成文章，或按照自己的喜好修改参数。
### 导出
你需要将页面中的所有参数填写完毕，填写完毕后，直接点击“导出”按钮，此时剪切板上一般会多出一串JSON格式的文字，将其复制到你想复制的任何地方即可
`
</script>