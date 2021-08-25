import { useInject } from '@midwayjs/hooks';
import { Sqlite } from "../service/sqlite"
import { Tool } from "../service/tool"

/**
 * 
 * @param _id 获取设备历史运行数据
 * @param name 
 * @param startTime 
 * @param endTime 
 * @returns 
 */
export const clientresultcolltions = async (_id: string, name: string, startTime?: number, endTime?: number) => {
  const sqlite = await useInject(Sqlite)
  const tool = await useInject(Tool)
  const clientResult = sqlite.all(_id, startTime || tool.getTime0000(), endTime || tool.getTime2359())
  if (clientResult.length > 0) {
    let first = clientResult[0].result
    const result = [clientResult[0]]
    clientResult.forEach(el => {
      if (first !== el.result) {
        result.push(el)
        first = el.result
      }
    })
    return result
      .map(el => {
        return { data: (<Uart.queryResultArgument[]>JSON.parse(el.result)).find(el1 => el1.name === name), timeStamp: el.timeStamp }
      }).filter(el => el.data)
  } else {
    return []
  }
}