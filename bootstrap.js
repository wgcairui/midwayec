const { Framework } = require('@midwayjs/koa');
const { Bootstrap } = require('@midwayjs/bootstrap');

const web = new Framework().configure({
  port: process.env.NODE_PORT ? Number(process.env.NODE_PORT) : 7001,
});

Bootstrap.load(web)
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
