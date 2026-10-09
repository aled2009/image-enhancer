import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'images.enhance': { paramsTuple?: []; params?: {} }
    'images.download': { paramsTuple: [ParamValue]; params: {'fileName': ParamValue} }
    'images.delete_output': { paramsTuple: [ParamValue]; params: {'fileName': ParamValue} }
    'agent.chat': { paramsTuple?: []; params?: {} }
    'agent.chat_stream': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'images.enhance': { paramsTuple?: []; params?: {} }
    'agent.chat': { paramsTuple?: []; params?: {} }
    'agent.chat_stream': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'images.download': { paramsTuple: [ParamValue]; params: {'fileName': ParamValue} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'images.download': { paramsTuple: [ParamValue]; params: {'fileName': ParamValue} }
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'images.delete_output': { paramsTuple: [ParamValue]; params: {'fileName': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}