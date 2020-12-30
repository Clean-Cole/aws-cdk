import * as cdk from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnConfigurationAssociation } from './amazonmq.generated';
import { BrokerConfigurationAttributes } from './broker-configuration';

/**
 * Apply a configuration to a broker.  Typically only needed when applying a configuration to an existing broker
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-amazonmq-configurationassociation.html
 */
export interface ConfigurationAssociationProps {

  /**
   * The broker used in this association
   */
  readonly brokerName: string;

  /**
   * The configuration used in this association
   */
  readonly configuration: BrokerConfigurationAttributes;

  /**
   * When you pass the logical ID of this resource to the intrinsic Ref function,
   * Ref returns the Amazon MQ configurationassociation ID.
   * For example: c-1234a5b6-78cd-901e-2fgh-3i45j6k178l9
   * @default - ignored FIXME: why does the linter complain about CfnxXxName not existing on a resource that doesn't have one.
   */
  readonly configurationAssociationName?: string;

}

/**
 * The attributes for a configuration association
 */
export interface ConfigurationAssociationAttributes {

  /**
   * The broker used in this association
   */
  readonly brokerName: string;

  /**
   * The configuration used in this association
   */
  readonly configuration: BrokerConfigurationAttributes;

  /**
   * When you pass the logical ID of this resource to the intrinsic Ref function,
   * Ref returns the Amazon MQ configurationassociation ID.
   * For example: c-1234a5b6-78cd-901e-2fgh-3i45j6k178l9
   */
  readonly configurationAssociationName: string;
}

/**
 * Broker / Configuration Association interface.
 */
export interface IConfigurationAssociation extends cdk.IResource {

  /**
   * When you pass the logical ID of this resource to the intrinsic Ref function,
   * Ref returns the Amazon MQ configurationassociation ID.
   * For example: c-1234a5b6-78cd-901e-2fgh-3i45j6k178l9
   * @attribute ref
   */
  readonly configurationAssociationName: string;

  /**
   * The name of the broker to associate with a configuration.
   */
  readonly brokerName: string;

  /**
   * the configuration details to attach to an association (id and revision)
   */
  readonly configuration: BrokerConfigurationAttributes;
}

/**
 * Use the AWS CloudFormation AWS::AmazonMQ::ConfigurationAssociation resource to associate a configuration
 * with a broker, or return information about the specified ConfigurationAssociation. Only use one per broker,
 * and don't use a configuration on the broker resource if you have associated a configuration with that broker.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-amazonmq-configurationassociation.html
 */
export class ConfigurationAssociation extends cdk.Resource implements IConfigurationAssociation {

  /**
   * Import an existing configuration association.
   * @param scope
   * @param id
   * @param attrs
   */
  public static fromConfigurationAssociationAttributes(
    scope: Construct, id: string, attrs: ConfigurationAssociationAttributes): IConfigurationAssociation {

    class Import extends cdk.Resource implements IConfigurationAssociation {
      public readonly brokerName = attrs.brokerName;
      public readonly configuration = attrs.configuration;
      public readonly configurationAssociationName = attrs.configurationAssociationName;
    }
    return new Import(scope, id);
  }

  readonly configurationAssociationName: string;
  readonly brokerName: string;
  readonly configuration: BrokerConfigurationAttributes;

  constructor(scope: Construct, id: string, props: ConfigurationAssociationProps) {
    super(scope, id);

    const assoc = new CfnConfigurationAssociation(this, id, {
      broker: props.brokerName,
      configuration: {
        id: props.configuration.configurationId,
        revision: props.configuration.revision,
      },
    });
    this.configurationAssociationName = assoc.ref;
    this.brokerName = assoc.broker;
    this.configuration = props.configuration;
  }
}