export const sharePage = (product: string) => {
    const url = window.location.href + "?utm_source=share&utm_medium=web&utm_campaign=fanfic"
    if (navigator.share) {
        navigator.share({
            title: product,
            text: `我正在使用 ${product}，你也来试试吧！`,
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