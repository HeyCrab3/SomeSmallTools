<template>
    <div>
        <el-card shadow="hover">
            <div slot="header" class="text-lg font-bold">使用说明</div>
            <el-alert title="由于AI生成内容的局限性，我们无法保证做出来的饭一定好吃" show-icon type="warning" class="w-4/5" :closable="false"/>
            <el-alert title="有部分老师不喜欢AI生成文章，请自行平衡后使用。Use it at your own risk!" show-icon type="error" class="w-4/5" :closable="false"/>
            <strong class="mt-2 block">本功能目前免费且未来大概率没有收费想法。如果您是付费得到的链接，请立即要求退款！</strong>
            <p class="text-sm">本功能使用了阿里云的百炼服务，基于大语言模型（LLM）进行文本生成。</p>
            <p class="text-sm">请先选择将要使用的模型，然后在输入框中输入角色和需要生成的简单描述，并且选择一个适宜的文章长度，生成即可。</p>
            <p class="text-sm">如果您觉得生成的内容不错，可以点击右上角的分享按钮，将链接分享给朋友。</p>
        </el-card>
    </div>
</template>