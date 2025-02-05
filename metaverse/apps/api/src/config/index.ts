import dotenv from "dotenv";
dotenv.config();


const { PORT, NODE_ENV } = process.env;


const port = PORT || 8080;

export { port as PORT, NODE_ENV };


export const JWT_PASSWORD = "123kasdk123"