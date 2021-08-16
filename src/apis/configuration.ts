import { hooks, createConfiguration } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';
import * as axios from "@midwayjs/axios"
import { join } from 'path'


export default createConfiguration({
  imports: [
    axios,
    hooks({
      middleware: [bodyParser()],
    }),
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]

});
