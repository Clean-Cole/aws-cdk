

/**
 * The version for a particular Engine type (RabbitMQ or ActiveMQ)
 * https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/broker-engine.html
 */
export class BrokerEngineVersion {

  /**
   * Gets a valid broker engine version for ActiveMQ Brokers
   * @param brokerEngineVersion
   */
  public static forActiveMQ(brokerEngineVersion: ActiveMQEngineVersion): BrokerEngineVersion {
    return new BrokerEngineVersion(brokerEngineVersion);
  }

  /**
   * Gets a valid broker engine version for RabbitMQ Brokers
   * @param brokerEngineVersion
   */
  public static forRabbitMQ(brokerEngineVersion: RabbitMQEngineVersion): BrokerEngineVersion {
    return new BrokerEngineVersion(brokerEngineVersion);
  }

  constructor(private readonly engineVersion: ActiveMQEngineVersion | RabbitMQEngineVersion | string) {}

  /**
   * Return the instance type as a dotted string
   */
  public toString(): string {
    return this.engineVersion;
  }

}

/**
 * Available Engines for an AmazonMQ Broker
 */
export enum BrokerEngineType {

  /** ActiveMQ Broker Type **/
  ACTIVE_MQ = 'ACTIVEMQ',

  /** RabbitMQ Broker Type **/
  RABBIT_MQ = 'RABBITMQ'
}

/**
 *  Versions for the ActiveMQ broker engine type
 */
export enum ActiveMQEngineVersion {

  /** Version 5.15.14 **/
  V_5_15_14 = '5.15.14',

  /** Version 5.15.13 **/
  V_5_15_13 = '5.15.13',

  /** Version 5.15.12 **/
  V_5_15_12 = '5.15.12',

  /** Version 5.15.10 **/
  V_5_15_10 = '5.15.10',

  /** Version 5.15.9 **/
  V_5_15_9 = '5.15.9',

  /** Version 5.15.8 **/
  V_5_15_8 = '5.15.8',

  /** Version 5.15.6 **/
  V_5_15_6 = '5.15.6',

  /** Version 5.15.0 **/
  V_5_15_0 = '5.15.0',
}

/**
 *  Versions for the RabbitMQ broker engine type
 */
export enum RabbitMQEngineVersion {

  /**
   * Only Version 3.8.6 is currently available for the RabbitMQ Broker Type
   */
  V_3_8_6 = '3.8.6'
}