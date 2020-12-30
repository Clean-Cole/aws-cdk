/// !cdk-integ pragma:ignore-assets
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getIntegVpc } from './utils';


const app = new cdk.App();


class ActiveMQBrokerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = getIntegVpc(this, 'VPC');

    /// !show

    new mq.Broker(this, 'ACTIVEMQ', {
      engineType: mq.BrokerEngineType.ACTIVE_MQ,
      deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
      engineVersion: mq.BrokerEngineVersion.forActiveMQ(mq.ActiveMQEngineVersion.V_5_15_14),
      hostInstanceType: mq.BrokerInstanceType.forActiveMQ(mq.ActiveMQBrokerInstanceSize.MQ_T2_MICRO),
      vpc: vpc,

      // FIXME: Need to use a method on Brokers to "addConfiguration()" instead of doing it at construction like here
      // configuration: new BrokerConfiguration(this, 'CONFIG'),
    });

    /// !hide
  }
}

new ActiveMQBrokerStack(app, 'aws-cdk-amazonmq-activemq');
app.synth();