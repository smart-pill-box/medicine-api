const fastify = require("fastify");
const sequelize = require("./db_connection");
const { createTransaction, rollbackTransaction } = require("./midlewares/transaction_middleware");
const accountRoutes = require("./routes/account_routes");
const server = fastify();

// server.setErrorHandler((err, req, resp)=>{
//   console.error("Error ocurred:", err);
//   resp.code(500).send("Internal Server Error");
// });

server.addHook("onRequest", createTransaction);
server.addHook("onError", rollbackTransaction);

server.register(accountRoutes);

sequelize.authenticate().then(()=>{
  server.listen({ port: 8080, host: "0.0.0.0" })
    .then((address) => console.log(`server listening on ${address}`))
    .catch(err => {
      console.log('Error starting server:', err)
      process.exit(1)
    });
}).catch( err =>{
  console.error("Unable to connect to database", err);
});