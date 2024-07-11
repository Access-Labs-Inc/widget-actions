interface InfraConfigurations {
  element?: HTMLElement;
  debug?: boolean;
}

/**
 * A model representing all possible configurations
 * that can be done from embedded script. Those settings
 * are passed around in application via Context.
 */
export interface AppConfigurations {
  poolId: string | null;
  poolSlug: string | null;
  poolName: string | null;
  websiteUrl: string | null;
  showImage: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showWebsite: boolean;
}

export type Configurations = InfraConfigurations & AppConfigurations;
