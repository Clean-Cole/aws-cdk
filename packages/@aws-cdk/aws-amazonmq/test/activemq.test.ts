import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getStandardBrokerOptions, getTestStack, getTestVpc } from './utils';

describe('ActiveMQ Specific Tests', () => {

  let stack: cdk.Stack;
  let vpc: ec2.IVpc;
  let basicBrokerProps: mq.BrokerProps;

  beforeEach(() => {
    stack = getTestStack();
    vpc = getTestVpc(stack);
    basicBrokerProps = getStandardBrokerOptions(vpc);
  });

  describe('ActiveMQ uses correct defaults', () => {

    test('basic ActiveMQ creates', () => {
      new mq.Broker(stack, 'DefaultActiveMQ', basicBrokerProps);
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        EngineType: 'ACTIVEMQ',
      });
    });

  });
});