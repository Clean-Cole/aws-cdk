import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { debugStack, getStandardBrokerOptions, getTestStack, getTestVpc } from './utils';

describe('Broker Configuration Tests', () => {

  let stack: cdk.Stack;
  let vpc: ec2.IVpc;
  let basicBrokerProps: mq.BrokerProps;
  let config: mq.IBrokerConfiguration | undefined;
  // let broker: mq.IBroker;

  beforeEach(() => {
    stack = getTestStack();
  });

  describe('properties and defaults', () => {

    beforeEach(() => {
      vpc = getTestVpc(stack);
      basicBrokerProps = getStandardBrokerOptions(vpc);
      config = undefined;
    });

    test('configuration was created using all available properties', () => {
      config = new mq.BrokerConfiguration(stack, 'AllPropsConfig', {
        engineType: mq.BrokerEngineType.ACTIVE_MQ,
        engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_12),
        configurationData: '<xml></xml>',
        description: 'My special description for this configuration',
      });
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Configuration', {
        Data: '<xml></xml>',
        EngineType: 'ACTIVEMQ',
        EngineVersion: '5.15.12',
        Name: 'AllPropsConfigc816b9c1abb4c5b08e3873449e57a0ed47a6b3191c393F8524',
        Description: 'My special description for this configuration',
      });
    });

    test('configuration created with defaults', () => {
      config = new mq.BrokerConfiguration(stack, 'AllPropsConfig', {
        engineType: mq.BrokerEngineType.ACTIVE_MQ,
        engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_8),
        configurationData: '<xml></xml>',
      });
      debugStack(stack);
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Configuration', {
        Data: '<xml></xml>',
        EngineType: 'ACTIVEMQ',
        EngineVersion: '5.15.8',
        Name: 'AllPropsConfigc816b9c1abb4c5b08e3873449e57a0ed47a6b3191c393F8524',
        Description: 'ACTIVEMQ - 5.15.8 configuration for `AllPropsConfig`',
      });
    });

    test('configuration can be supplied to a new Broker', () => {
      config = new mq.BrokerConfiguration(stack, 'CONFIG', {
        engineType: mq.BrokerEngineType.ACTIVE_MQ,
        engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_8),
        configurationData: '<xml></xml>',

      });
      new mq.Broker(stack, 'defaultMq', {
        ...basicBrokerProps,
        ...{
          configuration: {
            configurationId: config.configurationId,
            revision: config.configurationRevision,
          },
        },
      });

      expect(stack).toHaveResourceLike('AWS::AmazonMQ::ConfigurationAssociation', {
        Broker: 'broker',
        Configuration: {
          Id: {
            'Fn::GetAtt': [
              'CONFIGDAA619BD',
              'Id',
            ],
          },
          Revision: {
            'Fn::GetAtt': [
              'CONFIGDAA619BD',
              'Revision',
            ],
          },
        },
      });
    });

  });

  describe('configuration associations', () => {
    test('existing association imports', () => {
      const importedAssoc = mq.ConfigurationAssociation.fromConfigurationAssociationAttributes(
        stack, 'importedAssoc', {
          configuration: { configurationId: 'c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', revision: 5 },
          brokerName: 'myExistingBrokerName',
          configurationAssociationName: 'c-xxxxxxxx-xxxx-xxxx-xxxx-associations',
        });
      expect(stack).toCountResources('AWS::AmazonMQ::ConfigurationAssociation', 0);
      expect(importedAssoc).toHaveProperty('brokerName');
      expect(importedAssoc).toHaveProperty('configuration');
      expect(importedAssoc).toHaveProperty('configurationAssociationName');
    });
  });
});

