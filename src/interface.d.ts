import { ComposeOption, EChartsOption, XAXisComponentOption, YAXisComponentOption } from "echarts"
import { TitleComponentOption, ToolboxComponentOption, LegendComponentOption, TooltipComponentOption } from "echarts/components"

interface a {
    xAxis?: XAXisComponentOption[];
    yAxis?: YAXisComponentOption;
}
export type echartsOption<T> = ComposeOption<
    TitleComponentOption | ToolboxComponentOption | LegendComponentOption | TooltipComponentOption | T
> & a

export interface barData {
    name: string,
    value: number,
    alarm?: boolean
}