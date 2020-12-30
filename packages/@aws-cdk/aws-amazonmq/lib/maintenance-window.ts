import { CfnBroker } from './amazonmq.generated';

/**
 * Currently the documentation on the required string formats for the maintenance window are missing.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-amazonmq-broker-maintenancewindow.html
 */
export interface BrokerMaintenanceWindow extends CfnBroker.MaintenanceWindowProperty {}