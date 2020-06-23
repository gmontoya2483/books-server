import socketIO from 'socket.io'
import express from 'express';
import http from 'http';
import {SERVER_PORT} from "../globals/environment.global";
import * as socket from '../sockets/socket'
import config from 'config';


export default class ServerClass {

    private static _instance: ServerClass;
    public app: express.Application;
    public port: number;
    public io: socketIO.Server;
    private httpServer: http.Server;

    private constructor() {
        this.app = express();
        this.port = SERVER_PORT;
        this.httpServer = new http.Server( this.app );
        this.io = socketIO( this.httpServer );
        this.listenSockets();
    }

    // Patron singleton
    public static get instance(){
        return this._instance || (this._instance = new this());
    }



    start( callback: Function ){
        this.httpServer.listen( this.port,callback());
    }

    // Socket Listener
    private listenSockets (){
        console.log('Escuchando conexiones - sockets');

        this.io.on('connection', client =>{
            console.log(`Cliente conectado`);


            // Desconectar
            socket.desconectar( client );

            // Mensajes
            socket.mensaje( client, this.io );



        });
    }



}
