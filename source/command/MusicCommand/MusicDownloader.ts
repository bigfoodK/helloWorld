import ws from 'ws';
import config from '../../config';
import { EventEmitter } from 'events';

namespace WebsocketMessages {
  export type download = {
    type: 'download',
    url: string,
  }

  export type downloaded = {
    type: 'downloaded',
    id: string,
  }
}

type WebsocketMessage = [
  WebsocketMessages.download,
  WebsocketMessages.downloaded,
][number];

interface MusicDownloader {
  on(event: 'downloadComplete', listener: (id: string) => void): this;
  on(event: 'websocketOpen', listener: Function): this;

  once(event: 'downloadComplete', listener: (id: string) => void): this;
  once(event: 'websocketOpen', listener: Function): this;

  off(event: 'downloadComplete', listener: (id: string) => void): this;
  off(event: 'websocketOpen', listener: Function): this;

  emit(event: 'downloadComplete', id: string): boolean;
  emit(event: 'websocketOpen'): boolean;
}

class MusicDownloader extends EventEmitter {
  constructor() {
    super();
    this.connect = this.connect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.websocket = this.connect();
  }

  private websocket: ws;

  private handleMessage(event: string) {
    const message = JSON.parse(event as string) as WebsocketMessage;

    switch(message.type) {
      case 'downloaded': {
        this.emit('downloadComplete', message.id);
      } break;

      default: break;
    }
  }

  private connect() {
    const websocket = new ws(config.musicDownloadServerHost);
    websocket.once('error', () => setTimeout(this.connect, 5000))
    websocket.once('open', () => {
      this.emit('websocketOpen');
      websocket.once('close', () => {
        websocket.off('message', this.handleMessage)
        setTimeout(this.connect, 5000)
      });
      websocket.on('message', this.handleMessage);
    })
    this.websocket = websocket;
    return websocket;
  }

  public download(url: string) {
    if (this.websocket.readyState !== 1) {
      this.once('websocketOpen', () => this.download(url));
      return;
    }

    this.websocket.send(JSON.stringify({
      type: 'download',
      url,
    } as WebsocketMessages.download));
  }
}

const musicDownloader = new MusicDownloader();

export default musicDownloader;
