#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/26f1a08577ef34964d72e77b2056b17ff7f72446e4bb81325c5458e2741024d6/contract';
import startContract from '../../snapshots/26f1a08577ef34964d72e77b2056b17ff7f72446e4bb81325c5458e2741024d6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/acfdf83749840ecd435ade306921d8f9ca8cce8838c7726bae1ce919dbb5709f/contract';
import endContract from '../../snapshots/acfdf83749840ecd435ade306921d8f9ca8cce8838c7726bae1ce919dbb5709f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addUnique({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_aiReference_key',
        columns: ['aiReference'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'campaignPayment',
        constraint: 'campaignPayment_transactionHash_key',
        columns: ['transactionHash'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
