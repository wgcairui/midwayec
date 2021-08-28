import { store } from "./vuex";

interface wsMessege<T = any> {
    event: string,
    data: T
}

const ws = new WebSocket(`ws://${location.hostname}:7001/ws`)
ws.onopen = function () {

    const actionsEvent = Object.keys((store as any)._actions).filter(el => /^socket_/i.exec(el)).map(el => el.replace(/socket_/i, ''))
    const mutationsEvent = Object.keys((store as any)._mutations).filter(el => /^socket_/i.exec(el)).map(el => el.replace(/socket_/i, ''))

    ws.onmessage = function (evt) {
        const received_msg = evt.data;
        if (/(^\{.*\}$|^\[.*\]$)/.test(received_msg)) {
            const { event, data } = JSON.parse(received_msg) as wsMessege
            // console.log({event,...data});
            
            // 注册action
            actionsEvent.forEach(el => {
                if (el === event) {
                    store.dispatch('socket_' + event, data)
                }
            })

            // 注册mutation
            mutationsEvent.forEach(el => {
                if (el === event) {
                    store.commit('SOCKET_' + event, data)
                }
            })
        }


    };


};

export const wsSend = (event: string, data: any) => {
    const message: wsMessege = {
        event,
        data
    }
    ws.send(JSON.stringify(message))
}


ws.onclose = function () {
    // 关闭 websocket
    console.log("连接已关闭...");
    window.location.reload()
};