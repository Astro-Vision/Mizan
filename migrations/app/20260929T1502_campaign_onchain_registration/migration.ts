#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/acfdf83749840ecd435ade306921d8f9ca8cce8838c7726bae1ce919dbb5709f/contract';
import endContract from '../../snapshots/acfdf83749840ecd435ade306921d8f9ca8cce8838c7726bae1ce919dbb5709f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e33a70edfd9f755b7ba63800f32d1f0a2357ecb409682f163aea1fb49c208219/contract';
import startContract from '../../snapshots/e33a70edfd9f755b7ba63800f32d1f0a2357ecb409682f163aea1fb49c208219/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'disbursementRequest',
        columns: [
          col('communityId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('documentFileName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('documentMimeType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('documentStoragePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('items', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
          col('langflowConfidence', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('langflowDecision', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('langflowOutput', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('milestoneId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('region', 'text', {
            notNull: true,
            default: lit('Indonesia'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('requestedAmountWei', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requestedByUserId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('signatureStoragePath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('SUBMITTED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'disbursementRequest_status_check_4c477efe',
            "\"status\" IN ('SUBMITTED', 'AI_VERIFIED', 'PROOF_SUBMITTED', 'REJECTED', 'DISBURSEMENT_REQUESTED', 'DISBURSED')",
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('onchainRegisteredAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('onchainRegistrationError', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'campaign',
        column: col('onchainStatus', 'text', {
          notNull: true,
          default: lit('NOT_REGISTERED'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('contactEmail', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('contactPhone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('logoUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'community',
        column: col('websiteUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'campaign',
        constraint: 'campaign_onchainStatus_check_e8263ac8',
        expression:
          "\"onchainStatus\" IN ('NOT_REGISTERED', 'REGISTERING', 'REGISTERED', 'FAILED')",
      }),
      this.addUnique({
        schema: 'public',
        table: 'campaignPayment',
        constraint: 'campaignPayment_transactionHash_key',
        columns: ['transactionHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disbursementRequest',
        index: 'disbursementRequest_communityId_idx_e2c72225',
        columns: ['communityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disbursementRequest',
        index: 'disbursementRequest_milestoneId_idx_f1dac854',
        columns: ['milestoneId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disbursementRequest',
        index: 'disbursementRequest_requestedByUserId_idx_85281b2d',
        columns: ['requestedByUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disbursementRequest',
        index: 'disbursementRequest_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disbursementRequest',
        foreignKey: {
          name: 'disbursementRequest_milestoneId_fkey',
          columns: ['milestoneId'],
          references: { schema: 'public', table: 'milestone', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disbursementRequest',
        foreignKey: {
          name: 'disbursementRequest_communityId_fkey',
          columns: ['communityId'],
          references: { schema: 'public', table: 'community', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disbursementRequest',
        foreignKey: {
          name: 'disbursementRequest_requestedByUserId_fkey',
          columns: ['requestedByUserId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
