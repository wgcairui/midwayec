import { createStore, Store } from "vuex"
import { InjectionKey } from "vue"
import { Ec } from "./apis/interface"


export interface State {
    originalData: { time: Date, str: string }[],
    th: Partial<Ec.DeviceData>[],
    PiDevInfo: Partial<Ec.PiDevInfo>,
    unitCache: Map<string, Map<string, string>>
}

export const key: InjectionKey<Store<State>> = Symbol()

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

    },
    actions: {

    }
})