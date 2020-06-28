import dotenv from 'dotenv';


module.exports = function(){
    const result = dotenv.config();

    if(result.error) {
        throw  result.error;
    }

    console.log("Variables de entorno configuradas");
     if(process.env.NODE_ENV==='development'){
         console.log(result.parsed);
     }

}
