import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { Construct } from 'constructs';
import { CfnBroker, CfnBrokerProps } from './amazonmq.generated';
import { BrokerBase, BrokerBaseProps } from './broker-base';
import { BrokerConfigurationAttributes } from './broker-configuration';
import { BrokerEngineType, BrokerEngineVersion } from './broker-engine-version';
import { BrokerAttributes, BrokerAuthenticationStrategy, BrokerDeploymentMode, IBroker } from './broker-ref';
import { ConfigurationAssociation } from './configuration-association';
import { BrokerLogList } from './logs';
import { constructBrokerArn } from './private/utils';

/**
 * The properties for configuring a Broker of any engine type.
 */
export interface BrokerProps extends BrokerBaseProps {

  /**
   * A list of information about the configuration. Does not apply to RabbitMQ brokers.
   * @default does not apply to RabbitMQ but is a XxxxxxxX XxxX if ActiveMQ FIXME -> figure out default activemq behavior
   */
  readonly configuration?: BrokerConfigurationAttributes;
}

/**
 * A Broker Construct
 */
export class Broker extends BrokerBase {

  /**
     * Construct an imported Broker from its attributes
     * @param scope
     * @param id
     * @param attrs
     */
  public static fromBrokerAttributes(scope: Construct, id: string, attrs: BrokerAttributes): IBroker {

    const stack = cdk.Stack.of(scope);

    class Import extends cdk.Resource implements IBroker {
      public brokerName = attrs.brokerName;
      public brokerArn = constructBrokerArn(stack, attrs.brokerName, attrs.brokerRef);
      public connections = new ec2.Connections({})
      public deploymentMode = attrs.deploymentMode
      public engineType = attrs.engineType;
      public engineVersion = attrs.engineVersion;
      public brokerId = attrs.brokerRef;
    }

    return new Import(scope, id);
  }

  /** @internal */
  private static _validate(props: BrokerProps): string[] {
    let errors: string[] = [];

    /**
     * User Validation
     */
    if (props.users) {
      let userCounter: number = 0;
      for (let item of props.users ?? []) {
        userCounter++;
        if (item.username.length > 100) {
          errors.push(`Username ${item.username} is over the character limit of 100 please shorten the name`);
        }
        if (item.username.length < 2) {
          errors.push(`Username ${item.username} is under the character limit of 2 please lengthen the name`);
        }
      }
      if (userCounter > 20) {
        errors.push('You cannot have anymore than 20 users connected to a Broker');
      }
    }

    /**
     * Configuration Validation
     */
    if (props.configuration && props.engineType != BrokerEngineType.ACTIVE_MQ) {
      errors.push('You must use the ActiveMQ engine to provide a configuration');
    }

    return errors;
  }

  readonly brokerId: string;
  readonly brokerName: string;
  readonly deploymentMode: BrokerDeploymentMode;
  readonly engineType: BrokerEngineType;
  readonly engineVersion: BrokerEngineVersion;
  readonly brokerArn: string;
  readonly logs?: BrokerLogList;

  readonly brokerConfigurationId?: string;
  readonly brokerConfigurationRevision?: string;
  readonly brokerIpAddresses?: string[];
  readonly brokerAmqpEndpoints?: string[];
  readonly brokerMqttEndpoints?: string[];
  readonly brokerStompEndpoints?: string[];
  readonly brokerWssEndpoints?: string[];
  readonly brokerOpenWireEndpoints?: string[];

  /** @internal **/
  readonly _cfnBroker: CfnBroker;

  /** @internal **/
  protected readonly _newCfnProps: CfnBrokerProps;

  /** @internal */
  protected readonly _props: BrokerProps;

  constructor(scope: Construct, id: string, props: BrokerProps) {
    super(scope, id, {});

    // Use the internal validate function that is also called in validate()
    let errors = Broker._validate(props);
    if (errors.length > 0) {throw new Error(errors[0]);}

    // Security Groups
    this._securityGroups = props.securityGroups ?? [new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc, allowAllOutbound: true,
    })];
    const securityGroupIds: string[] = this._securityGroups.map(value => value.securityGroupId);

    // VPC Subnets
    this._subnets = props.vpcSubnets ?? props.vpc.privateSubnets;
    const subnetIds: string[] = this._subnets.map(value => value.subnetId);

    // KMS Encryption
    let kmsKeyId: string | undefined;
    kmsKeyId = props.encryptionOptions?.kmsKey?.keyId ?? undefined;

    // Broker Configuration
    let configProps: CfnBroker.ConfigurationIdProperty | cdk.IResolvable | undefined = undefined;
    if (props.configuration) {
      configProps = {
        id: props.configuration.configurationId,
        revision: props.configuration.revision,
      };
    }


    /**
     * Construct the L1 props {@link CfnBrokerProps}
     */
    this._newCfnProps = {
      autoMinorVersionUpgrade: props.autoMinorVersionUpgrade ?? true,
      brokerName: this.getResourceNameAttribute('broker'),
      deploymentMode: props.deploymentMode,
      engineType: props.engineType.toString(),
      engineVersion: props.engineVersion.toString(),
      hostInstanceType: props.hostInstanceType.toString(),
      publiclyAccessible: props.publiclyAccessible ?? false,
      users: props.users?.map(user => {
        let foo: CfnBroker.UserProperty;
        foo = {
          username: user.username,
          password: cdk.Token.asString(user.password),
          consoleAccess: user.consoleAccess,
          groups: user.groups,
        };
        return foo;
      }) ?? [],
      authenticationStrategy: props.authenticationStrategy ?? BrokerAuthenticationStrategy.SIMPLE,
      configuration: configProps,
      encryptionOptions: {
        useAwsOwnedKey: props.encryptionOptions?.useAwsOwnedKey ?? true,
        kmsKeyId: kmsKeyId,
      },
      ldapServerMetadata: undefined,
      logs: {
        audit: props.logs?.audit ?? false,
        general: props.logs?.general ?? false,
      },
      maintenanceWindowStartTime: props.maintenanceWindow,
      securityGroups: securityGroupIds,
      storageType: '', // FIXME ??
      subnetIds: subnetIds,
      tags: props.tags, // FIXME ?? wonder how I am supposed to handle this the "correct" way or if i have to do it at all
    };

    /**
     * Create the Broker {@link CfnBroker}
     */
    this._cfnBroker = new CfnBroker(this, 'CfnBroker', this._newCfnProps);

    if (props.configuration) {
      new ConfigurationAssociation(this, 'Assoc', {
        brokerName: this._cfnBroker.brokerName,
        configuration: { configurationId: props.configuration.configurationId, revision: props.configuration.revision },
      });
    }

    /**
     * Set the appropriate properties on the class instance
     */
    this.brokerId = this._cfnBroker.ref;
    this.engineType = props.engineType;
    this.engineVersion = props.engineVersion;
    this.brokerName = this._cfnBroker.brokerName;
    this.brokerArn = cdk.Token.asString(this._cfnBroker.ref);
    this.deploymentMode = props.deploymentMode;
    this.brokerAmqpEndpoints = cdk.Token.asList(this._cfnBroker.attrAmqpEndpoints);
    this.brokerMqttEndpoints = cdk.Token.asList(this._cfnBroker.attrMqttEndpoints);
    this.brokerOpenWireEndpoints = cdk.Token.asList(this._cfnBroker.attrOpenWireEndpoints);
    this.brokerStompEndpoints = cdk.Token.asList(this._cfnBroker.attrStompEndpoints);
    this.brokerWssEndpoints = cdk.Token.asList(this._cfnBroker.attrWssEndpoints);
    this._props = props;
    this._connections = new ec2.Connections({
      securityGroups: this._securityGroups,
      defaultPort: ec2.Port.tcp(11111), // FIXME: find a better way of managing the necessary ports for the different protocols available.
    });
  }

  /**
   * Run property validations during synthesis
   * @protected
   */
  protected validate(): string[] {
    return Broker._validate(this._props).concat(super.validate());
  }
}