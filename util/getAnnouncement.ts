import axios from 'axios'
/**
 * 获取公告
 * @returns {Promise<any>}
 */
export const getAnnouncement = async(): Promise<any> => {
    try{
        const result = await axios('https://csc.heycrab.xyz/v1/cc/getDownload?key=80001')
        if (result.data.code != 0)  return Promise.reject(result.data.msg)
        return Promise.resolve(result.data.data)
    }
    catch (e: any) {
        return Promise.reject(e.message || e.stack || e)
    }
}
