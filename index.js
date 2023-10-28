const fastify = require("fastify");
const server = fastify();

console.log("Hello world, i'm working");

server.get("/", ()=>{
    return "Hello World";
});

server.listen({ port: 8080, host: "0.0.0.0" })
  .then((address) => console.log(`server listening on ${address}`))
  .catch(err => {
    console.log('Error starting server:', err)
    process.exit(1)
  })