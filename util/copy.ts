export const copy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
        ElMessage.success('复制成功！')
    }).catch(() => {
        ElMessage.error('浏览器不支持复制，请手动复制')
    })
}