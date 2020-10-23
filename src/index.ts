import server from "./app";

const start = async () => {
  try {
    const address = await server.listen(
      process.env.PORT || (3000 as any),
      "0.0.0.0"
    );
    server.log.info(`server listening on ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

process.on("uncaughtException", (err) => {
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error(err);
});
start();
