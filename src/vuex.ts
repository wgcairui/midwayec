import { createStore, Store } from "vuex"
import { InjectionKey } from "vue"
import { Ec } from "./apis/interface"


export interface State {
    originalData: { time: Date, str: string }[],
    th: Ec.DeviceData[],
    PiDevInfo: Partial<Ec.PiDevInfo>,
    unitCache: Map<string, Map<string, string>>
}

export const key: InjectionKey<Store<State>> = Symbol()

const idMap: Map<string, number> = new Map()

export const store = createStore<State>({
    state: {
        originalData: [],
        th: [],
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
        SOCKET_DeviceData: (state, { type, alias, model, pid, protocol, _id, data }: Required<Ec.DeviceData>) => {
            //const {type,alias,model,pid,protocol,_id} = dev
            const idIn = idMap.get(_id)
            switch (type) {
                case "温湿度":
                    {
                        if (!idIn && idIn !== 0) {
                            idMap.set(_id, state.th.push({ type, alias, model, pid, protocol, _id, data }) - 1)
                        } else {
                            state.th[idIn].data = data
                        }
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