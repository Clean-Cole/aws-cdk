import * as cdk from '@aws-cdk/core/';

/**
 * A copy of {@link CfnBroker.UserProperty} for configuring user access to the Broker
 * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-amazonmq-broker-user.html
 */
export interface BrokerUserProps {

  /**
   * Enables access to the ActiveMQ Web Console for the ActiveMQ user. Does not apply to RabbitMQ brokers.
   * @default false no console access will be given to the user
   */
  readonly consoleAccess?: boolean | cdk.IResolvable;

  /**
   * The list of groups (20 maximum) to which the ActiveMQ user belongs. This value can contain only alphanumeric
   * characters, dashes, periods, underscores, and tildes (- . _ ~). This value must be 2-100 characters long.
   * Does not apply to RabbitMQ brokers.
   * @default undefined - no groups will be attached to the user
   */
  readonly groups?: string[] | undefined;

  /**
   * The password of the user. This value must be at least 12 characters long, must contain at least 4 unique
   * characters, and must not contain commas. Must be in the form of a CDK SecretValue
   */
  readonly password: cdk.SecretValue;

  /**
   * `CfnBroker.UserProperty.Username`
   * @see http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-amazonmq-broker-user.html#cfn-amazonmq-broker-user-username
   */
  readonly username: string;
}

// /**
//  * The IBrokerUser interface. Importing existing users is not a feature of these classes/interfaces
//  */
// export interface IBrokerUser {
//   /**
//    * Username
//    */
//   readonly username: string;
//
//   /**
//    * Allows console access to the broker for this user?
//    */
//   readonly consoleAccess?: boolean | cdk.IResolvable;
//
//   /**
//    * The groups that the user belongs to.
//    */
//   readonly groups?: string[];
// }
//
// /**
//  * Base Broker User class to extend
//  */
// export abstract class BrokerUserBase extends Construct implements IBrokerUser {
//
//   /**
//    * A password for the user in the form of a {@link cdk.SecretValue}
//    */
//   abstract readonly password: cdk.SecretValue;
//
//   abstract readonly consoleAccess?: boolean | cdk.IResolvable;
//   abstract readonly username: string;
//   abstract readonly groups?: string[];
//
//   /** @internal **/
//   readonly _groups?: string[];
//
// }
//
//
// /**
//  * Represents a single user of a Broker
//  */
// export class BrokerUser extends BrokerUserBase {
//
//   readonly consoleAccess?: boolean | cdk.IResolvable;
//   readonly password: cdk.SecretValue;
//   readonly username: string;
//
//   constructor(scope: Construct, id: string, props: BrokerUserProps) {
//     super(scope, id);
//     this.username = props.username;
//
//     this.consoleAccess = props.consoleAccess ?? false;
//
//
//   }
//
//   public get groups(): string[] | undefined {
//     return this._groups;
//   }
//
// }