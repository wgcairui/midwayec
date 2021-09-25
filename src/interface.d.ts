import { ComposeOption, EChartsOption, XAXisComponentOption, YAXisComponentOption } from "echarts"
import { TitleComponentOption, ToolboxComponentOption, LegendComponentOption, TooltipComponentOption } from "echarts/components"

interface a {
    xAxis?: XAXisComponentOption | XAXisComponentOption[];
    yAxis?: YAXisComponentOption;
}

/**
 * echarts options选项
 */
export type echartsOption<T> = ComposeOption<
    TitleComponentOption | ToolboxComponentOption | LegendComponentOption | TooltipComponentOption | T
> & a

/**
 * bar图标所需数据格式
 */
export interface barData {
    name: string,
    value: number,
    alarm?: boolean
}

/**
 * echarts事件对象
 */
export interface echartsEvent<T = number> {
    /**
     * 点击x对象
     */
    name: string
    /**
     * y值
     */
    seriesName: string
    /**
     * 图标类型
     */
    seriesType: string
    /**
     * 事件类型
     */
    type: string
    /**
     * 值
     */
    value: T

    [x in string]: any
}

export type ioIn = "i1" | "i2" | "i3" | "i4" | "i5" | "i6"
export type ioOut = "o1" | "o2" | "o3" | "o4" | "o5" | "o6"