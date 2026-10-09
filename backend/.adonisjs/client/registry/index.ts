/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'images.enhance': {
    methods: ["POST"],
    pattern: '/api/images/enhance',
    tokens: [{"old":"/api/images/enhance","type":0,"val":"api","end":""},{"old":"/api/images/enhance","type":0,"val":"images","end":""},{"old":"/api/images/enhance","type":0,"val":"enhance","end":""}],
    types: placeholder as Registry['images.enhance']['types'],
  },
  'images.download': {
    methods: ["GET","HEAD"],
    pattern: '/api/images/download/:fileName',
    tokens: [{"old":"/api/images/download/:fileName","type":0,"val":"api","end":""},{"old":"/api/images/download/:fileName","type":0,"val":"images","end":""},{"old":"/api/images/download/:fileName","type":0,"val":"download","end":""},{"old":"/api/images/download/:fileName","type":1,"val":"fileName","end":""}],
    types: placeholder as Registry['images.download']['types'],
  },
  'images.delete_output': {
    methods: ["DELETE"],
    pattern: '/api/images/:fileName',
    tokens: [{"old":"/api/images/:fileName","type":0,"val":"api","end":""},{"old":"/api/images/:fileName","type":0,"val":"images","end":""},{"old":"/api/images/:fileName","type":1,"val":"fileName","end":""}],
    types: placeholder as Registry['images.delete_output']['types'],
  },
  'agent.chat': {
    methods: ["POST"],
    pattern: '/api/agent/chat',
    tokens: [{"old":"/api/agent/chat","type":0,"val":"api","end":""},{"old":"/api/agent/chat","type":0,"val":"agent","end":""},{"old":"/api/agent/chat","type":0,"val":"chat","end":""}],
    types: placeholder as Registry['agent.chat']['types'],
  },
  'agent.chat_stream': {
    methods: ["POST"],
    pattern: '/api/agent/chat/stream',
    tokens: [{"old":"/api/agent/chat/stream","type":0,"val":"api","end":""},{"old":"/api/agent/chat/stream","type":0,"val":"agent","end":""},{"old":"/api/agent/chat/stream","type":0,"val":"chat","end":""},{"old":"/api/agent/chat/stream","type":0,"val":"stream","end":""}],
    types: placeholder as Registry['agent.chat_stream']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
