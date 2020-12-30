import * as kms from '@aws-cdk/aws-kms';
import * as cdk from '@aws-cdk/core';

/**
 * Encryption options for a Broker
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-amazonmq-broker-encryptionoptions.html
 */
export interface BrokerEncryptionOptions {
  /**
   * The customer master key (CMK) to use for the AWS Key Management Service (KMS).
   * This key is used to encrypt your data at rest. If not provided, Amazon MQ will use a default CMK to encrypt your data.
   * @default No KMS key will be used for encryption
   */
  readonly kmsKey?: kms.IKey;
  /**
   * Enables the use of an AWS owned CMK using AWS Key Management Service (KMS). Set to true by default,
   * if no value is provided, for example, for RabbitMQ brokers.
   * @default true
   */
  readonly useAwsOwnedKey?: boolean | cdk.IResolvable;
}