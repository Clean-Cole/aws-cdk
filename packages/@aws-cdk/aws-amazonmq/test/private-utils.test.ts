import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { constructBrokerArn, constructConfigurationArn } from '../lib/private/utils';
import { getStandardBrokerOptions, getTestStack, getTestVpc } from './utils';

describe('Private Utilities', () => {
  let stack: cdk.Stack;
  let vpc: ec2.Vpc;
  let basicBrokerProps: mq.BrokerProps;

  beforeEach(() => {
    stack = getTestStack();
    vpc = getTestVpc(stack);
    basicBrokerProps = getStandardBrokerOptions(vpc);
  });

  test('broker arn is constructed properly', () => {
    const result: string = constructBrokerArn(stack, 'brokerName', 'b-fakexxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    expect(result).toStrictEqual('arn:aws:mq:us-test-1:12345:broker:brokerName:b-fakexxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  });

  test('broker arn can use ref tokens', () => {
    const broker = new mq.Broker(stack, 'UTIL_BROKER', basicBrokerProps);
    const result: string = constructBrokerArn(stack, 'brokerName', broker.brokerId);
    expect(result).toContain('arn:aws:mq:us-test-1:12345:broker:brokerName:${Token[TOKEN.');
  });

  test('configuration arn is constructed properly', () => {
    const result: string = constructConfigurationArn(stack, 'c-fakexxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    expect(result).toStrictEqual('arn:aws:mq:us-test-1:12345:configuration:c-fakexxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  });

  test('configuration arn can use ref tokens', () => {
    const config = new mq.BrokerConfiguration(stack, 'CONFIG', {
      configurationData: '<xml></xml>',
      engineType: mq.BrokerEngineType.ACTIVE_MQ,
      engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_10),
    });
    const result: string = constructConfigurationArn(stack, config.configurationId);
    expect(result).toContain('arn:aws:mq:us-test-1:12345:configuration:${Token[TOKEN.');
  });
});