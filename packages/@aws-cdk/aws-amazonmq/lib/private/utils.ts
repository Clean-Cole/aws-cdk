import * as cdk from '@aws-cdk/core';

/**
 * Constructs a Broker arn from its component parts.
 * @param stack {@link cdk.Stack} the stack associated with the broker. The value is used to get a region and account #
 * @param brokerName
 * @param ref
 */
export function constructBrokerArn(stack: cdk.Stack, brokerName: string, ref: string): string {
  return `arn:aws:mq:${stack.region}:${stack.account}:broker:${brokerName}:${ref}`;
}

/**
 * Constructs the arn value for a Broker Configuration from its component parts.
 * @param stack
 * @param ref
 */
export function constructConfigurationArn(stack: cdk.Stack, ref: string): string {
  return `arn:aws:mq:${stack.region}:${stack.account}:configuration:${ref}`;
}