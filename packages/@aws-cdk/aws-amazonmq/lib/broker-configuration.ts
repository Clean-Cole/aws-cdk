import * as cdk from '@aws-cdk/core';
import { makeUniqueId } from '@aws-cdk/core/lib/private/uniqueid';
import { Construct } from 'constructs';
import { CfnConfiguration } from './amazonmq.generated';
import { BrokerEngineType, BrokerEngineVersion } from './broker-engine-version';
import { constructConfigurationArn } from './private/utils';


/**
 * Broker Configuration Properties
 */
export interface BrokerConfigurationProps extends cdk.ResourceProps {

  /**
   * Set the broker engine type of the configuration.
   */
  readonly engineType: BrokerEngineType;

  /**
   * Set the version of the engine chosen for the configuration.
   */
  readonly engineVersion: BrokerEngineVersion;

  /**
   * The name of the broker configuration as seen in the AWS Console.
   * @default a configuration name will be generated
   */
  readonly configurationName?: string;

  /**
   * Broker Configuration Data
   */
  readonly configurationData: string;

  /**
   * Override the generated description for the configuration
   * @default a generated value in the format of
   */
  readonly description?: string;

}

/**
 * Attributes needed to import an existing Broker
 */
export interface BrokerConfigurationAttributes {

  /**
   * The configuration ID.  typically in the `c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` format.
   */
  readonly configurationId: string;

  /**
   * The revision number being used by configuration ID given.
   */
  readonly revision: number;
}

/**
 * Base class for all Broker Configurations
 */
export abstract class BrokerConfigurationBase extends cdk.Resource implements IBrokerConfiguration {
  public abstract readonly configurationArn: string;
  public abstract readonly configurationId: string;
  public abstract readonly configurationRevision: number;

}

/**
 * Broker Configuration - Currently only valid for use in ActiveMQ
 * @resource AWS::AmazonMQ::Configuration
 */
export class BrokerConfiguration extends BrokerConfigurationBase {

  /**
   * Import a configuration from its attributes
   * @param scope
   * @param id
   * @param attrs {@link BrokerConfigurationAttributes}
   */
  public static fromBrokerConfigurationAttributes(scope: Construct, id: string, attrs: BrokerConfigurationAttributes): IBrokerConfiguration {
    class Import extends cdk.Resource implements IBrokerConfiguration {
      public readonly configurationArn = constructConfigurationArn(this.stack, attrs.configurationId)
      public readonly configurationId = attrs.configurationId;
      public readonly configurationRevision = attrs.revision;
    }
    return new Import(scope, id);
  }

  /**
   * The name of the broker configuration as seen in the AWS Console.
   * @attribute
   */
  readonly configurationName: string;

  /**
   * The Configuration's Arn value
   * @attribute
   */
  readonly configurationArn: string;

  /**
   * The ID of the Configuration. something like. `c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   * @attribute
   */
  readonly configurationId: string;

  /**
   * The revision number for this Broker Configuration
   * @attribute
   */
  readonly configurationRevision: number;

  /** @internal **/
  protected _data: string;

  /**
   * Get the raw string (XML) data from the Configuration if this is a fresh resource that isn't imported.
   * @attribute data
   */
  get configurationData(): string {
    if (!this._data) {
      throw new Error('You cannot access data from an imported configuration.');
    }
    return this._data;
  }


  constructor(scope: Construct, id: string, props: BrokerConfigurationProps) {
    super(scope, id, props);

    const brokerConfig: CfnConfiguration = new CfnConfiguration(this, id, {
      data: props.configurationData,
      engineType: props.engineType,
      engineVersion: props.engineVersion.toString(),
      description: props.description ?? `${props.engineType} - ${props.engineVersion} configuration for \`${id}\``,
      name: makeUniqueId([id, this.node.addr]),
      // tags: undefined, // FIXME: Add tags in some "official" way
    });

    this._data = brokerConfig.data;
    this.configurationArn = constructConfigurationArn(this.stack, brokerConfig.ref);
    this.configurationId = brokerConfig.attrId;
    this.configurationRevision = brokerConfig.attrRevision;
    this.configurationName = brokerConfig.name;
  }
}

/**
 * The public interface for a Broker Configuration either imported or freshly created.
 */
export interface IBrokerConfiguration extends cdk.IResource {
  /**
   * The Configuration's Arn value
   * @attribute
   */
  readonly configurationArn: string;

  /**
   * The ID of the Configuration. something like. `c-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   * @attribute
   */
  readonly configurationId: string;

  /**
   * The revision number for this Broker Configuration
   * @attribute
   */
  readonly configurationRevision: number;
}
