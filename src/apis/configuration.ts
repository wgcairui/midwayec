import { hooks, createConfiguration } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';
import * as axios from "@midwayjs/axios"
import { join } from 'path'
import staticCache from 'koa-static-cache'

export default createConfiguration({
  imports: [
    axios,
    hooks({
      middleware: [bodyParser(), staticCache({
        prefix: '/public/',
        dir: join(process.cwd(), 'public'),
      })],
    }),
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]


});
