import * as awsert from '@aws-cdk/assert';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core/';
import { Construct } from 'constructs';
import * as mq from '../lib/index';

export function getIntegVpc(scope: Construct, id: string): ec2.IVpc {
  // Sometimes developers have a restriction on vpc creation in their IAM role.
  // This provides a sneaky fix for that so that they can still run integration tests locally
  // FIXME: Remove before MR?
  if ( process.env.AWSMQ_INTEG_TEST_VPC_ID ) {
    return ec2.Vpc.fromLookup(scope, id, { vpcId: process.env.AWSMQ_INTEG_TEST_VPC_ID });
  }
  return new ec2.Vpc(scope, id, { maxAzs: 2 });
}

export function getTestStack(): cdk.Stack {
  let stack = new cdk.Stack(undefined, undefined, { env: { account: '12345', region: 'us-test-1' } });
  stack.node.setContext('availability-zones:12345:us-test-1', ['us-test-1a', 'us-test-1b', 'us-test-1c']);
  return stack;
}

export function getTestVpc(stack: cdk.Stack, maxAzs: number = 3): ec2.Vpc {
  return new ec2.Vpc(stack, 'VPC', { maxAzs: maxAzs });
}

export function getStandardBrokerOptions(vpc: ec2.IVpc): mq.BrokerProps {
  return {
    deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
    engineType: mq.BrokerEngineType.ACTIVE_MQ,
    engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_14),
    hostInstanceType: mq.BrokerInstanceType.forActiveMQ(mq.ActiveMQBrokerInstanceSize.MQ_T2_MICRO),
    vpc: vpc,
  };
}

// NOTE: This is how we debug props in CF Templates // FIXME: remove comment before MR
export function debugStack(stack: cdk.Stack): any {
  let r = awsert.SynthUtils.toCloudFormation(stack);
  if (!r) throw new Error('Unknown Debug Error');
  return r;
}