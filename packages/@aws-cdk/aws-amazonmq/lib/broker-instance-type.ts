/**
 * Instance type for EC2 instances
 *
 * This class takes a literal string, good if you already
 * know the identifier of the type you want.
 */

/**
 * The possible ActiveMQ Broker instance types and sizes
 */
export enum ActiveMQBrokerInstanceSize {

  /** mq.t2.micro **/
  MQ_T2_MICRO = 'mq.t2.micro',

  /** mq.m4.large **/
  MQ_M4_LARGE = 'mq.m4.large',

  /** mq.m5.large **/
  M5_LARGE = 'mq.m5.large',

  /** mq.m5.xlarge **/
  M5_XLARGE = 'mq.m5.xlarge',

  /** mq.m5.2xlarge **/
  M5_2XLARGE = 'mq.m5.2xlarge',

  /** mq.m5.4xlarge **/
  M5_4XLARGE = 'mq.m5.4xlarge',
}

/**
 * The possible RabbitMQ Broker instance types and sizes.
 */
export enum RabbitMQBrokerInstanceSize {

  /** mq.t3.micro **/
  T3_MICRO = 'mq.t3.micro',

  /** mq.m5.large **/
  M5_LARGE = 'mq.m5.large',

  /** mq.m5.xlarge **/
  M5_XLARGE = 'mq.m5.xlarge',

  /** mq.m5.2xlarge **/
  M5_2XLARGE = 'mq.m5.2xlarge',

  /** mq.m5.4xlarge **/
  M5_4XLARGE = 'mq.m5.4xlarge',
}

/**
 * A class for easily obtaining a valid instance size and type for all Broker engine types
 */
export class BrokerInstanceType {

  /**
   * Return a valid RabbitMQ Broker instance size
   * @param size
   */
  public static forRabbitMQ(size: RabbitMQBrokerInstanceSize) {
    return new BrokerInstanceType(`${size}`);
  }

  /**
   * * Return a valid ActiveMQ Broker instance size
   * @param size
   */
  public static forActiveMQ(size: ActiveMQBrokerInstanceSize) {
    return new BrokerInstanceType(`${size}`);
  }

  constructor(private readonly instanceTypeIdentifier: string) {
  }

  /**
   * Return the instance type as a dotted string
   */
  public toString(): string {
    return this.instanceTypeIdentifier;
  }
}