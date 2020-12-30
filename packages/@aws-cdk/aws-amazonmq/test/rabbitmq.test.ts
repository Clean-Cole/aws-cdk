import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getTestStack, getTestVpc } from './utils';

/* eslint-disable quote-props */

describe('RabbitMQ Specific Tests', () => {

  let stack: cdk.Stack;
  let vpc: ec2.IVpc;
  let rabbitProps: mq.BrokerProps;

  beforeEach(() => {
    stack = getTestStack();
    vpc = getTestVpc(stack);
    rabbitProps = {
      deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
      engineType: mq.BrokerEngineType.RABBIT_MQ,
      engineVersion: mq.BrokerEngineVersion.forRabbitMQ(mq.RabbitMQEngineVersion.V_3_8_6),
      hostInstanceType: mq.BrokerInstanceType.forRabbitMQ(mq.RabbitMQBrokerInstanceSize.T3_MICRO),
      vpc: vpc,
    };
  });
  test('basic RabbitMQ creates', () => {
    new mq.Broker(stack, 'DefaultRabbitMQ', rabbitProps);
    expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
      'EngineType': 'RABBITMQ',
    });
  });

  test('configurations only available for activeMQ', () => {
    // 102 character long username
    expect(() => {
      new mq.Broker(stack, 'BROKER', {
        ...rabbitProps,
        ...{
          configuration: { configurationId: 'c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', revision: 4 },
        },
      });
    }).toThrowError('You must use the ActiveMQ engine to provide a configuration');
  });
});