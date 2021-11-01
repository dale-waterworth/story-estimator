import {
  ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';

@WebSocketGateway(8001)
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  private count = 0;
  @WebSocketServer()
  server: Server;
  clients=[];

  handleConnection(client: any) {
    console.log('handleConnection');
    this.clients.push(client);
    client.send( 'connected');

    //  return from([1]).pipe(map(item => ({ event: 'connected', data: item, count: this.count })));
  }

  handleDisconnect(client) {
    console.log('handleDisconnect');
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i] === client) {
        this.clients.splice(i, 1);
        break;
      }
    }
    client.send( 'disconnected');
  }

  @SubscribeMessage('events')
  onEvent(@ConnectedSocket() client: any, data: any) {
    console.log('onEvent', data);
    this.count++;
    this.broadcast('my-event',{ event: 'events', count: this.count, clients: this.clients.length });
  }


  private broadcast(event, message: any) {
    const broadCastMessage = JSON.stringify(message);
    for (const client of this.clients) {
      console.log('sending,' , broadCastMessage);
      client.send( broadCastMessage);
    }
  }
}
