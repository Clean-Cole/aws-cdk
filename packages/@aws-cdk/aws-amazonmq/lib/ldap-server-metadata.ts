import * as cdk from '@aws-cdk/core';

/**
 * In general a copy of base Cfn property {@link CfnBroker.LdapServerMetadataProperty}.  This interface represents the properties
 * available to create an LDAP Server connection to an AmazonMQ instance. This is only used in the ActiveMQ engine type.
 *
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-amazonmq-broker-ldapservermetadata.html
 */
export interface LdapServerMetadata {

  /**
   * Specifies the location of the LDAP server such as AWS Directory Service for Microsoft Active Directory.
   * Optional failover server.
   */
  readonly hosts: string[];

  /**
   * The distinguished name of the node in the directory information tree (DIT) to search for roles or groups.
   * For example, ou=group, ou=corp, dc=corp, dc=example, dc=com.
   */
  readonly roleBase: string;

  /**
   * Specifies the LDAP attribute that identifies the group name attribute in the object returned from the
   * group membership query.
   * @default No role name attribute is used //FIXME: be more verbose in what roleName does for LDAP Server
   */
  readonly roleName?: string;

  /**
   * The LDAP search filter used to find roles within the roleBase. The distinguished name of the user matched by
   * userSearchMatching is substituted into the {0} placeholder in the search filter. The client's username is
   * substituted into the {1} placeholder. For example, if you set this option to (member=uid={1}) for the user
   * janedoe, the search filter becomes (member=uid=janedoe) after string substitution. It matches all role entries
   * that have a member attribute equal to uid=janedoe under the subtree selected by the RoleBases.
   */
  readonly roleSearchMatching: string;

  /**
   * The directory search scope for the role. If set to true, scope is to search the entire subtree.
   * @default true the scope will be set to the entire subtree
   */
  readonly roleSearchSubtree?: boolean | cdk.IResolvable;

  /**
   * Service account username. A service account is an account in your LDAP server that has access to initiate a
   * connection. For example, cn=admin,dc=corp, dc=example, dc=com.
   */
  readonly serviceAccountUsername: string;

  /**
   * Service account password. A service account is an account in your LDAP server that has access to initiate a
   * connection. For example, cn=admin,dc=corp, dc=example, dc=com.  Requires the use of a SecretValue to prevent
   * passwords from being seen in plaintext.
   */
  readonly serviceAccountPassword: cdk.SecretValue;

  /**
   * Select a particular subtree of the directory information tree (DIT) to search for user entries.
   * The subtree is specified by a DN, which specifies the base node of the subtree. For example, by setting
   * this option to ou=Users,ou=corp, dc=corp, dc=example, dc=com, the search for user entries is restricted to the
   * subtree beneath ou=Users,ou=corp, dc=corp, dc=example, dc=com.
   */
  readonly userBase: string;

  /**
   * Specifies the name of the LDAP attribute for the user group membership.
   * @default unknown FIXME: what happens by default for userRoleName in ldap server?
   */
  readonly userRoleName?: string;

  /**
   * The LDAP search filter used to find users within the userBase. The client's username is substituted into
   * the {0} placeholder in the search filter. For example, if this option is set to (uid={0}) and the received
   * username is janedoe, the search filter becomes (uid=janedoe) after string substitution. It will result in
   * matching an entry like uid=janedoe, ou=Users, ou=corp, dc=corp, dc=example, dc=com.
   */
  readonly userSearchMatching: string;

  /**
   * The directory search scope for the user. If set to true, scope is to search the entire subtree.
   * @default true the entire subtree will be searched
   */
  readonly userSearchSubtree?: boolean | cdk.IResolvable;
}