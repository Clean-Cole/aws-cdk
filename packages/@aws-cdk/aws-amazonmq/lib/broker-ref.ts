import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { BrokerEngineType, BrokerEngineVersion } from './broker-engine-version';

/**
 * A standard interface describing any AmazonMQ Broker
 */
export interface IBroker extends cdk.IResource, ec2.IConnectable {

  /**
   * The ID for the broker, typically in a `b-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` format
   * @attribute
   */
  readonly brokerId: string;

  /**
   * The BrokerName you would see in the AWS Console
   * @attribute
   */
  readonly brokerName: string;

  /**
   * The Broker Arn
   * @attribute
   */
  readonly brokerArn: string;

  /**
   * The Broker engine to use e.g. ActiveMQ or RabbitMQ
   */
  readonly engineType: BrokerEngineType;

  /**
   * The version of the Broker's engine type
   */
  readonly engineVersion: BrokerEngineVersion;

  /**
   * The deployment mode to use for the Broker.
   */
  readonly deploymentMode: BrokerDeploymentMode;

  /**
   * Broker IpAddresses
   * @attribute
   */
  readonly brokerIpAddresses?: string[];

  /**
   * Broker AmqpEndpoints
   * @attribute
   */
  readonly brokerAmqpEndpoints?: string[];

  /**
   * Broker MqttEndpoints
   * @attribute
   */
  readonly brokerMqttEndpoints?: string[];

  /**
   * Broker StompEndpoints
   * @attribute
   */
  readonly brokerStompEndpoints?: string[];

  /**
   * Broker WssEndpoints
   * @attribute
   */
  readonly brokerWssEndpoints?: string[];

}

/**
 * The available deployment modes for AmazonMQ. (Active Standby is not available for the RabbitMQ engine type)
 */
export enum BrokerDeploymentMode {

  /** Single Instance Deployment **/
  SINGLE_INSTANCE = 'SINGLE_INSTANCE',

  /** Active Standby Multi-AZ (ActiveMQ Only) **/
  ACTIVE_STANDBY_MULTI_AZ = 'ACTIVE_STANDBY_MULTI_AZ',

  /** Clustered Multi-AZ **/
  CLUSTER_MULTI_AZ = 'CLUSTER_MULTI_AZ'
}

/**
 * The available authentication strategies for AmazonMQ
 */
export enum BrokerAuthenticationStrategy {

  /**
   * Basic authentication for the broker
   */
  SIMPLE = 'SIMPLE',

  /**
   * LDAP Authentication for the broker
   */
  LDAP = 'LDAP'
}

/**
 * Attributes of a Broker.  Used for importing existing brokers.
 */
export interface BrokerAttributes {

  /**
   * The reference ID of the broker
   */
  readonly brokerRef: string;

  /**
   * The name of the Broker
   */
  readonly brokerName: string;

  /**
   * The deployment mode of the Broker (single, standby, multi-az)
   */
  readonly deploymentMode: BrokerDeploymentMode;

  /**
   * Engine type of the Broker (ActiveMQ or RabbitMQ)
   */
  readonly engineType: BrokerEngineType;

  /**
   * Engine version used by the broker
   */
  readonly engineVersion: BrokerEngineVersion;

  /**
   * The ID of the configuration currently associated with the Broker
   */
  readonly configurationId: string;

  /**
   * The revision number of the currently Broker configuration
   */
  readonly configurationRevision: number;

  /**
   * IP addresses of the broker
   * @default - undefined or empty array if they are not known
   */
  readonly ipAddresses?: string[];

  /**
   * AMQP endpoints
   * @default - undefined or empty array if they are not known
   */
  readonly amqpEndpoints?: string[];

  /**
   * MQTT Endpoints
   * @default - undefined or empty array if they are not known
   */
  readonly mqttEndpoints?: string[];

  /**
   * Stomp Endpoints
   * @default - undefined or empty array if they are not known
   */
  readonly stompEndpoints?: string[];

  /**
   * WSS Endpoints
   * @default - undefined or empty array if they are not known
   */
  readonly wssEndpoints?: string[];

  /**
   * Openwire Endpoints
   * @default - undefined or empty array if they are not known
   */
  readonly openWireEndpoints?: string[];
}
