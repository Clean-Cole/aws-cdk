import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getStandardBrokerOptions, getTestStack, getTestVpc } from './utils';

/* eslint-disable quote-props */

describe('Test VPC, Subnet and Security Groups', () => {
  let stack: cdk.Stack;
  let vpc: ec2.Vpc;
  let basicBrokerProps: mq.BrokerProps;

  beforeEach(() => {
    stack = getTestStack();
    vpc = getTestVpc(stack);
    basicBrokerProps = getStandardBrokerOptions(vpc);
  });

  describe('uses correct VPC settings when vpc prop is provided.', () => {

    test('has 3 private subnets attached', () => {
      // Create a broker with a single vpc and 3 azs.
      new mq.Broker(stack, 'vpcBrokerTest', basicBrokerProps);

      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'SubnetIds': [
          { 'Ref': 'VPCPrivateSubnet1Subnet8BCA10E0' },
          { 'Ref': 'VPCPrivateSubnet2SubnetCFCDAA7A' },
          { 'Ref': 'VPCPrivateSubnet3Subnet3EDCD457' },
        ],
      });
      expect(stack).toHaveResourceLike('AWS::EC2::Subnet', {
        'CidrBlock': '10.0.96.0/19',
        'VpcId': {
          'Ref': 'VPCB9E5F0B4',
        },
        'AvailabilityZone': 'dummy1a',
        'MapPublicIpOnLaunch': false,
        'Tags': [
          {
            'Key': 'aws-cdk:subnet-name',
            'Value': 'Private',
          },
          {
            'Key': 'aws-cdk:subnet-type',
            'Value': 'Private',
          },
          {
            'Key': 'Name',
            'Value': 'Default/VPC/PrivateSubnet1',
          },
        ],
      });
      expect(stack).toHaveResourceLike('AWS::EC2::Subnet', {
        'CidrBlock': '10.0.128.0/19',
        'VpcId': {
          'Ref': 'VPCB9E5F0B4',
        },
        'AvailabilityZone': 'dummy1b',
        'MapPublicIpOnLaunch': false,
        'Tags': [
          {
            'Key': 'aws-cdk:subnet-name',
            'Value': 'Private',
          },
          {
            'Key': 'aws-cdk:subnet-type',
            'Value': 'Private',
          },
          {
            'Key': 'Name',
            'Value': 'Default/VPC/PrivateSubnet2',
          },
        ],
      });
      expect(stack).toHaveResourceLike('AWS::EC2::Subnet', {
        'CidrBlock': '10.0.160.0/19',
        'VpcId': {
          'Ref': 'VPCB9E5F0B4',
        },
        'AvailabilityZone': 'dummy1c',
        'MapPublicIpOnLaunch': false,
        'Tags': [
          {
            'Key': 'aws-cdk:subnet-name',
            'Value': 'Private',
          },
          {
            'Key': 'aws-cdk:subnet-type',
            'Value': 'Private',
          },
          {
            'Key': 'Name',
            'Value': 'Default/VPC/PrivateSubnet3',
          },
        ],
      });
    });

    test('custom subnets can be used', () => {
      // Add a fourth & fifth subnet to our existing vpc in this test suite
      const subnet = new ec2.Subnet(stack, 'SUBNET4', {
        availabilityZone: 'us-test-1a',
        mapPublicIpOnLaunch: false,
        vpcId: vpc.vpcId,
        cidrBlock: '10.0.191.0/19',
      });
      const subnet2 = new ec2.Subnet(stack, 'SUBNET5', {
        availabilityZone: 'us-test-1b',
        mapPublicIpOnLaunch: false,
        vpcId: vpc.vpcId,
        cidrBlock: '10.1.96.0/19',
      });

      // Now add a new broker supplying the new subnet only
      new mq.Broker(stack, 'vpcBrokerTest', { ...basicBrokerProps, ...{ vpcSubnets: [subnet, subnet2] } });

      // Test that the subnet is the only one used in the Broker
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'SubnetIds': [{ 'Ref': 'SUBNET4Subnet6871AB82' }, { 'Ref': 'SUBNET5SubnetE15DB08B' }],
      });
    });
  });
});