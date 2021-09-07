import { createStore, Store } from "vuex"
import { InjectionKey } from "vue"
import { Ec } from "./apis/interface"


export interface State {
    originalData: { time: Date, str: string }[],
    th: Ec.DeviceData[],
    ups: Ec.DeviceData[],
    em: Ec.DeviceData[],
    air: Ec.DeviceData[],
    PiDevInfo: Partial<Ec.PiDevInfo>,
    unitCache: Map<string, Map<string, string>>
}

export const key: InjectionKey<Store<State>> = Symbol()

const idMap: Map<string, number> = new Map()

export const store = createStore<State>({
    state: {
        originalData: [],
        th: [],
        ups: [],
        em: [],
        air: [],
        PiDevInfo: {},
        unitCache: new Map()
    },
    getters: {

    },
    mutations: {
        /**
         * 变更设备数据
         * @param state 
         * @param param1 
         */
        SOCKET_DeviceData: (state, { type, alias, model, pid, protocol, _id, data, uart }: Required<Ec.DeviceData>) => {
            //const {type,alias,model,pid,protocol,_id} = dev
            const idIn = idMap.get(_id)
            switch (type) {
                case "温湿度":
                    {
                        if (!idIn && idIn !== 0) {
                            idMap.set(_id, state.th.push({ type, alias, model, pid, protocol, _id, data, uart }) - 1)
                        } else {
                            state.th[idIn].data = data
                        }
                    }
                    break

                case "UPS":
                    {
                        if (!idIn && idIn !== 0) {
                            idMap.set(_id, state.ups.push({ type, alias, model, pid, protocol, _id, data, uart }) - 1)
                        } else {
                            state.ups[idIn].data = data
                        }
                    }
                    break

                case "电量仪":
                    {
                        if (!idIn && idIn !== 0) {
                            idMap.set(_id, state.em.push({ type, alias, model, pid, protocol, _id, data, uart }) - 1)
                        } else {
                            state.em[idIn].data = data
                        }
                    }
                    break

                default:
                    {
                        console.log({ type, alias, model, pid, protocol, _id, data, uart });

                    }
                    break
            }
        },
        /**
         * 变更环控数据
         * @param state 
         * @param data 
         */
        'SOCKET_PiDevInfo': (state, data: Ec.PiDevInfo) => {
            state.PiDevInfo = data
        },

        /**
         * 调试数据
         * @param state 
         * @param data 
         */
        SOCKET_originalData: (state, data: string) => {
            state.originalData.push({ time: new Date, str: data })
        }


    },
    actions: {

    }
})