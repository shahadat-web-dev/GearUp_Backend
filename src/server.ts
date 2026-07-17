import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.PORT;

async function main(){
  try {
    await prisma.$connect();
    console.log("connected to the database successfully.");
    
    app.listen(PORT, ()=>{
      console.log(`Server is runing on port ${PORT}`); 
    });
  } catch (error) {
    console.error("Error starting the server", error);
    await prisma.$disconnect();
    process.exit(1);
  }

}


main();
