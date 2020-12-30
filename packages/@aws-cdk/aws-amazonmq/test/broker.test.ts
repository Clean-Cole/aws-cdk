import '@aws-cdk/assert/jest';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as kms from '@aws-cdk/aws-kms';
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getStandardBrokerOptions, getTestStack, getTestVpc } from './utils';

/* eslint-disable quote-props */
describe('Broker Resource', () => {
  let stack: cdk.Stack;
  let vpc: ec2.Vpc;
  let basicBrokerProps: mq.BrokerProps;

  beforeEach(() => {
    stack = getTestStack();
    vpc = getTestVpc(stack);
    basicBrokerProps = getStandardBrokerOptions(vpc);
  });

  describe('created with default properties', () => {
    beforeEach(() => {
      new mq.Broker(stack, 'Broker', basicBrokerProps);
    });
    test('broker defaults to simple authentication', () => {
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'AuthenticationStrategy': 'SIMPLE',
      });
    });
    test('broker upgrades minor versions by default', () => {
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'AutoMinorVersionUpgrade': true,
      });
    });
    test('not publicly accessible by default', () => {
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'PubliclyAccessible': false,
      });
    });
    test('Cloudwatch logs disabled when undefined', () => {
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'Logs': {
          'General': false,
          'Audit': false,
        },
      });
    });
    test('no encryption created by default', () => {
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'EncryptionOptions': {
          'UseAwsOwnedKey': true,
        },
      });
    });
    test('only 1 broker exists in the stack', () => {
      expect(stack).toCountResources('AWS::AmazonMQ::Broker', 1);
    });
  });
  describe('test all ActiveMQ engine versions', () => {
    interface activeMQVersions {
      typed: mq.ActiveMQEngineVersion,
      rawString: string
    }
    let testActiveMQVersions: activeMQVersions[] = [
      { typed: mq.ActiveMQEngineVersion.V_5_15_0, rawString: '5.15.0' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_6, rawString: '5.15.6' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_8, rawString: '5.15.8' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_9, rawString: '5.15.9' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_10, rawString: '5.15.10' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_12, rawString: '5.15.12' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_13, rawString: '5.15.13' },
      { typed: mq.ActiveMQEngineVersion.V_5_15_14, rawString: '5.15.14' },
    ];

    // Loop through all the version instead of checking 1:1 // TODO: is this a no no?
    testActiveMQVersions.forEach(value => {
      test(`ActiveMQ version ${value.rawString}`, () => {

        new mq.Broker(stack, 'Broker', {
          engineType: mq.BrokerEngineType.RABBIT_MQ,
          deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
          engineVersion: mq.BrokerEngineVersion.forActiveMQ(value.typed),
          hostInstanceType: mq.BrokerInstanceType.forActiveMQ(mq.ActiveMQBrokerInstanceSize.MQ_T2_MICRO),
          vpc: vpc,
        });

        expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
          'EngineVersion': value.rawString,
          'EngineType': 'RABBITMQ',
        });
      });
    });
  });
  describe('test all RabbitMQ engine versions', () => {
    interface rabbitMQVersions {
      typed: mq.RabbitMQEngineVersion,
      rawString: string
    }
    let testRabbitMQVersions: rabbitMQVersions[] = [{ typed: mq.RabbitMQEngineVersion.V_3_8_6, rawString: '3.8.6' }];
    testRabbitMQVersions.forEach(value => {
      test(`RabbitMQ version ${value.rawString}`, () => {

        new mq.Broker(stack, 'Broker', {
          engineType: mq.BrokerEngineType.RABBIT_MQ,
          deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
          engineVersion: mq.BrokerEngineVersion.forRabbitMQ(value.typed),
          hostInstanceType: mq.BrokerInstanceType.forRabbitMQ(mq.RabbitMQBrokerInstanceSize.T3_MICRO),
          vpc: vpc,
        });

        expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
          'EngineVersion': value.rawString,
          'EngineType': 'RABBITMQ',
        });
      });
    });
  });
  describe('encryption options', () => {
    test('self provided KMS key is used', () => {
      new mq.Broker(stack, 'BROKER', {
        ...basicBrokerProps, ...{ encryptionOptions: { kmsKey: kms.Key.fromKeyArn(stack, 'CUSTOM_KEY', 'arn:aws:kms:us-test-1:12345:key/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx') } },
      });
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'EncryptionOptions': {
          'KmsKeyId': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          'UseAwsOwnedKey': true,
        },
      });
    });
    test('UseAwsOwnedKey is honored', () => {
      new mq.Broker(stack, 'BROKER', {
        ...basicBrokerProps, ...{ encryptionOptions: { useAwsOwnedKey: false } },
      });
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'EncryptionOptions': {
          'UseAwsOwnedKey': false,
        },
      });
    });
  });
  describe('all broker user configurations', () => {
    test('Users can be created from a list of BrokerUserProps interfaces', () => {
      new mq.Broker(stack, 'BROKER', {
        ...basicBrokerProps,
        ...{
          users: [
            { username: 'username1', password: cdk.SecretValue.plainText('dont_do_this_in_real_life1') },
            { username: 'username2', password: cdk.SecretValue.plainText('dont_do_this_in_real_life2') },
            { username: 'username3', password: cdk.SecretValue.plainText('dont_do_this_in_real_life3') },
          ],
        },
      });
      expect(stack).toHaveResourceLike('AWS::AmazonMQ::Broker', {
        'Users': [
          {
            'Username': 'username1',
            'Password': 'dont_do_this_in_real_life1',
          },
          {
            'Username': 'username2',
            'Password': 'dont_do_this_in_real_life2',
          },
          {
            'Username': 'username3',
            'Password': 'dont_do_this_in_real_life3',
          },
        ],
      });
    });
    test('over 20 users creates an error', () => {

      let users: mq.BrokerUserProps[] = [];

      // Make a loop to create 21 users
      for (let i = 0; i < 21; i++) {
        let user: mq.BrokerUserProps = { username: `username${i}`, password: cdk.SecretValue.plainText(`dont_do_this_in_real_life${i}`) };
        users.push(user);
      }


      expect(() => {
        new mq.Broker(stack, 'BROKER', {
          ...basicBrokerProps,
          ...{
            users: users,
          },
        });
      }).toThrowError('You cannot have anymore than 20 users connected to a Broker');
    });
    test('usernames under 2 throw an error', () => {
      expect(() => {
        new mq.Broker(stack, 'BROKER', {
          ...basicBrokerProps,
          ...{
            users: [{ username: 'n', password: cdk.SecretValue.plainText('dont_do_this_in_real_life') }],
          },
        });
      }).toThrowError('Username n is under the character limit of 2 please lengthen the name');
    });
    test('usernames over 100 throw an error', () => {
      // 102 character long username
      let longUsername: string = 'Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlabore' +
          'Loremipsumdolorsit';
      expect(longUsername.length).toBeGreaterThan(100);
      expect(() => {
        new mq.Broker(stack, 'BROKER', {
          ...basicBrokerProps,
          ...{
            users: [{ username: longUsername, password: cdk.SecretValue.plainText('dont_do_this_in_real_life') }],
          },
        });
      }).toThrowError('Username Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntut' +
          'laboreLoremipsumdolorsit is over the character limit of 100 please shorten the name');
    });
  });

  describe('import an existing broker', () => {
    let broker: mq.IBroker;
    beforeEach(() => {
      broker = mq.Broker.fromBrokerAttributes(stack, 'importedBroker', {
        brokerName: 'ExistingBrokerName',
        brokerRef: 'b-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        configurationId: 'c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        configurationRevision: 4,
        deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
        engineType: mq.BrokerEngineType.ACTIVE_MQ,
        engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_13),
      });
    });

    test('import a broker with attributes', () => {
      expect(stack).toCountResources('AWS::AmazonMQ::Broker', 0);
      expect(broker).toHaveProperty('brokerName');
      expect(broker).toHaveProperty('engineVersion');
      expect(broker).toHaveProperty('engineType');
      expect(broker).toHaveProperty('brokerArn');
      expect(broker).toHaveProperty('brokerId');
      expect(broker).toHaveProperty('deploymentMode');
      expect(broker).toHaveProperty('connections');
      expect(broker).toHaveProperty('engineVersion');
    });

  });
});