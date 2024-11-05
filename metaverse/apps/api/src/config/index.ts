import dotenv from "dotenv";
dotenv.config();


const { PORT, NODE_ENV, JWT_SECRET } = process.env;
if(JWT_SECRET === undefined) {
  throw new Error("JWT_SECRET is not defined");
}

const port = PORT || 8080;

export { port as PORT, NODE_ENV, JWT_SECRET };


