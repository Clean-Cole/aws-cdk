import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import {
  BrokerAuthenticationStrategy,
  BrokerDeploymentMode,
  BrokerEncryptionOptions,
  BrokerEngineType,
  BrokerEngineVersion,
  BrokerInstanceType,
  BrokerLogList,
  BrokerMaintenanceWindow,
  BrokerTags,
  BrokerUserProps,
  IBroker,
  LdapServerMetadata,
} from '../lib';
import { CfnBroker } from './amazonmq.generated';


/**
 * The base properties associated with an AmazonMQ Broker Construct
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-amazonmq-broker.html#aws-resource-amazonmq-broker-properties
 */
export interface BrokerBaseProps {

  /**
   * The engine to use for the Broker
   */
  readonly engineType: BrokerEngineType;

  /**
   * The engine version for the broker
   */
  readonly engineVersion: BrokerEngineVersion;

  /**
   * The instance type and size for the broker
   */
  readonly hostInstanceType: BrokerInstanceType;

  /**
   * Optional. The authentication strategy used to secure the broker. The default is SIMPLE.
   * @default SIMPLE
   */
  readonly authenticationStrategy?: BrokerAuthenticationStrategy;

  /**
   * Enables automatic upgrades to new minor versions for brokers, as new engine versions are released.
   * The automatic upgrades occur during the maintenance window of the broker or after a manual broker reboot.
   *
   * @default true - AWS will automatically upgrade minor versions of this broker
   */
  readonly autoMinorVersionUpgrade?: boolean;

  /**
   * The name of the broker. This value must be unique in your AWS account, 1-50 characters long,
   * must contain only letters, numbers, dashes, and underscores, and must not contain white spaces,
   * brackets, wildcard characters, or special characters.
   *
   * @default a generated broker name
   */
  readonly brokerName?: string;

  /**
   * The deployment mode to use for the broker.
   * @default SINGLE_INSTANCE
   */
  readonly deploymentMode: BrokerDeploymentMode;

  /**
   * Encryption options for the broker. Does not apply to RabbitMQ brokers.
   * @default no encryption will be used
   */
  readonly encryptionOptions?: BrokerEncryptionOptions

  /**
   * Optional. The metadata of the LDAP server used to authenticate and authorize connections to
   * the broker. Does not apply to RabbitMQ brokers.
   *
   * @default - undefined - Only applies if using the LDAP {@link BrokerBaseProps.authenticationStrategy}
   */
  readonly ldapServerMetadata?: LdapServerMetadata;

  /**
   * Enables Amazon CloudWatch logging for brokers.
   *
   * @default false for both the general and audit logs.
   */
  readonly logs?: BrokerLogList;

  /**
   * The scheduled time period relative to UTC during which Amazon MQ begins to apply pending
   * updates or patches to the broker.
   *
   * @default The maintenance window for this broker can be anytime
   */
  readonly maintenanceWindow?: BrokerMaintenanceWindow;


  /**
   * The list of ActiveMQ users (persons or applications) who can access queues and topics.
   * For RabbitMQ brokers, one and only one administrative user is accepted and created
   * when a broker is first provisioned. All subsequent RabbitMQ users are created by via the
   * RabbitMQ web console or by using the RabbitMQ management API. This value can contain only
   * alphanumeric characters, dashes, periods, underscores, and tildes (- . _ ~).
   * This value must be 2-100 characters long.
   *
   * @default FIXME -> UNKNOWN
   */
  readonly users?: BrokerUserProps[];

  /**
   * Enables connections from applications outside of the VPC that hosts the broker's subnets.
   * @default false - The broker endpoints and web console will not be available over public internet
   * TODO: Can we add a "preferred" way of being able to proxy to the web console?
   */
  readonly publiclyAccessible?: boolean;

  /**
   * The subnets to allow deployment of Broker instance to. By default will query the private subnets of the provided VPC.
   * All subnets must belong to the same VPC if provided.
   *
   * @default the private subnets selected from the give vpc {@link BrokerBaseProps.vpc}
   */
  readonly vpcSubnets?: ec2.ISubnet[];

  /**
   * An array of key-value pairs
   * @default default tags from the stack if applicable
   */
  readonly tags?: BrokerTags[];

  /**
   * The EC2 security groups to link to the broker. that authorize connections to brokers.
   * Only works for new resources, not imported ones.
   *
   * @default a security group will automatically be created if none are provided
   */
  readonly securityGroups?: ec2.ISecurityGroup[];

  /**
   * The VPC associated with the broker.
   */
  readonly vpc: ec2.IVpc;

}

/**
 * A base construct for other brokers to extends
 */
export abstract class BrokerBase extends cdk.Resource implements IBroker {

  /**
   * The ID for the broker, typically in a `b-xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` format
   */
  public abstract readonly brokerId: string;

  /**
   * The name of the broker as seen in the AWS Console
   */
  public abstract readonly brokerName: string;

  /**
   * Broker Arn
   */
  public abstract readonly brokerArn: string;

  /**
   * Deployment Mode
   */
  public abstract readonly deploymentMode: BrokerDeploymentMode;

  /**
   * Enable cloudwatch logs for this Broker
   */
  public abstract readonly logs?: BrokerLogList;

  /**
   * Broker Engine Type
   * @attribute
   */
  public abstract readonly engineType: BrokerEngineType;

  /**
   * Broker Engine Version
   * @attribute
   */
  public abstract readonly engineVersion: BrokerEngineVersion;

  /**
   * BrokerConfigurationId
   * @attribute
   */
  public abstract readonly brokerConfigurationId?: string;

  /**
   * BrokerConfigurationRevision
   * @attribute
   */
  public abstract readonly brokerConfigurationRevision?: string;

  /**
   * BrokerIpAddresses
   * @attribute
   */
  public abstract readonly brokerIpAddresses?: string[];

  /**
   * BrokerAmqpEndpoints
   * @attribute
   */
  public abstract readonly brokerAmqpEndpoints?: string[];

  /**
   * BrokerMqttEndpoints
   * @attribute
   */
  public abstract readonly brokerMqttEndpoints?: string[];

  /**
   * BrokerStompEndpoints
   * @attribute
   */
  public abstract readonly brokerStompEndpoints?: string[];

  /**
   * BrokerWssEndpoints
   * @attribute
   */
  public abstract readonly brokerWssEndpoints?: string[];

  /**
   * BrokerOpenWireEndpoints
   * @attribute
   */
  public abstract readonly brokerOpenWireEndpoints?: string[];

  /** @internal */
  public abstract readonly _cfnBroker: CfnBroker;
  /** @internal */
  protected _connections: ec2.Connections | undefined;
  /** @internal */
  protected _securityGroups: ec2.ISecurityGroup[] | undefined;
  /** @internal */
  protected _activePorts: number[] | undefined;
  /** @internal */
  protected _defaultPort: number | undefined;
  /** @internal */
  protected _vpc: ec2.IVpc[] | undefined;
  /** @internal */
  protected _subnets: ec2.ISubnet[] | undefined;

  /** use our _connections field to implement the {@link IConnectable} interface. */
  public get connections(): ec2.Connections {
    if (!this._connections) {
      throw new Error('An imported Broker cannot manage its security groups');
    }
    return this._connections;
  }
}


