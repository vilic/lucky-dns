import * as Path from 'path';

import {
  command,
  param,
  Command,
  ExpectedError
} from 'clime';

import * as v from 'villa';

import {
  DEFAULT_DNS_ADDRESS,
  DEFAULT_DNS_PORT,
  DEFAULT_DNS_INTERNAL,
  DEFAULT_DNS_EXTERNAL,
  DEFAULT_DNS_INTERNAL_ROUTES,
  SERVICE_DEFINITION,
  DNSOptions,
  Nameserver,
  NameserverResolveEvent
} from '../core';

import { IPv4, createWindowsService } from '../util';

@command({
  description: 'Install Lucky DNS as Windows Service'
})
export default class extends Command {
  async execute(
    @param({
      description: 'Address to bind',
      default: DEFAULT_DNS_ADDRESS
    })
    address: IPv4,

    @param({
      description: 'Port to listen',
      default: DEFAULT_DNS_PORT
    })
    port: number,

    options: DNSOptions
  ) {
    let service = createWindowsService(Object.assign(SERVICE_DEFINITION, {
      env: [
        {
          name: 'LUCKY_DNS_ADDRESS',
          value: address.text
        },
        {
          name: 'LUCKY_DNS_PORT',
          value: port.toString()
        },
        {
          name: 'LUCKY_DNS_INTERNAL',
          value: options.internal.text
        },
        {
          name: 'LUCKY_DNS_EXTERNAL',
          value: options.external.text
        },
        {
          name: 'LUCKY_DNS_INTERNAL_ROUTES',
          value: options.internalRoutes.fullName
        }
      ]
    }));

    let installAwaitable = v.awaitable(service, ['install', 'alreadyinstalled']);

    console.log('Installing...');
    service.install();

    await installAwaitable;

    let startAwaitable = v.awaitable(service, 'start');

    console.log('Starting service...');
    service.start();

    await startAwaitable;

    console.log('Service should have been started.');
  }
}
