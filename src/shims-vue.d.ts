declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}







declare module 'node-wifi' {

  type WifiCallback<T = any> = (err: Error | null | undefined, value: T) => void

  export interface networks {
    ssid: string
    bssid: string
    mac: string // equals to bssid (for retrocompatibility)
    channel: number
    frequency: number // in MHz
    signal_level: number // in dB
    quality: number // same as signal level but in %
    security: string // format depending on locale for open networks in Windows
    security_flags: string // encryption protocols (format currently depending of the OS)
    mode: string // network mode like Infra (format currently depending of the OS)
  }



  /**
   * Initialize wifi module
   * Absolutely necessary even to set interface to null
   * @param opt network interface, choose a random wifi interface if set to null
   */
  function init(opt: { iface: null | string }): void

  /**
   * Scan networks
   * @param callback 
   */
  function scan(callback: WifiCallback<networks[]>): void

  /**
   * Connect to a network
   */
  function connect(opt: { ssid: string, password: string }, callback: WifiCallback): void

  /**
   * Disconnect from a network
   * not available on all os for now
   * @param WifiCallback 
   */
  function disconnect(callback: WifiCallback): void

  /**
   * Delete a saved network
   * not available on all os for now
   * @param opt 
   * @param WifiCallback 
   */
  function deleteConnection(opt: { ssid: string }, callback: WifiCallback): void


  /**
   * List the current wifi connections
   * @param callback 
   */
  function getCurrentConnections(callback: WifiCallback<networks[]>): void

}