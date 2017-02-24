import {
  command,
  option,
  param,
  Command,
  Object,
  Options
} from 'clime';

import * as Path from 'path';
import { IP } from '../util';
import { Nameserver, NameserverResolveEvent } from '../core';

export class DNSOptions extends Options {
  @option({
    flag: 'i',
    description: 'Internal (China) DNS server',
    default: '180.76.76.76'
  })
  internal: IP.IPv4;

  @option({
    flag: 'e',
    description: 'External DNS server',
    default: '8.8.8.8'
  })
  external: IP.IPv4;

  @option({
    flag: 'r',
    description: 'Internal (China) routes file',
    default: Path.join(__dirname, '../../china-routes.txt')
  })
  internalRoutes: Object.File;
}

@command({
  description: 'Lucky DNS'
})
export default class extends Command {
  async execute(
    @param({
      description: 'Address to bind',
      default: '127.0.0.1'
    })
    address: IP.IPv4,

    @param({
      description: 'Port to listen',
      default: 53
    })
    port: number,

    options: DNSOptions
  ) {
    let nameserver = new Nameserver({
      address: address.text,
      port: port,
      internal: options.internal.text,
      external: options.external.text,
      internalRoutesContent: await options.internalRoutes.text('ascii')
    });

    nameserver.on('ready', () => {
      console.log(`Nameserver (${address.text}:${port}) is ready.`);
    });

    nameserver.on('resolve', (event: NameserverResolveEvent) => {
      console.log(`Relayed a request using ${event.internal ? 'internal' : 'external'} DNS (${event.address}).`);
    });
  }
}
