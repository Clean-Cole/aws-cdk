/// !cdk-integ pragma:ignore-assets
import * as cdk from '@aws-cdk/core';
import * as mq from '../lib';
import { getIntegVpc } from './utils';


const app = new cdk.App();


class RabbitMQBrokerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = getIntegVpc(this, 'VPC');

    /// !show

    new mq.Broker(this, 'RABBIT', {
      engineType: mq.BrokerEngineType.RABBIT_MQ,
      deploymentMode: mq.BrokerDeploymentMode.SINGLE_INSTANCE,
      engineVersion: mq.BrokerEngineVersion.forRabbitMQ(mq.RabbitMQEngineVersion.V_3_8_6),
      hostInstanceType: mq.BrokerInstanceType.forRabbitMQ(mq.RabbitMQBrokerInstanceSize.T3_MICRO),
      vpc: vpc,
    });

    /// !hide
  }
}

new RabbitMQBrokerStack(app, 'aws-cdk-amazonmq-rabbitmq');
app.synth();