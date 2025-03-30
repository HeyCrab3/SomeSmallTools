export const processTime = (time: number): string => {
    return new Date(time).toLocaleString("zh-CN")
}