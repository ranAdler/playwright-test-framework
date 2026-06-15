export const alertRemediationPolicyPayload = {
  name: 'Test Alert Remediation Policy',
  severity: 'HIGH',
  enabled: true,
  description: 'Policy for testing alert remediation with status transitions',
  definition: {
    supportedAssets: {
      assetCategory: 'CLOUD',
      cloudProviders: [
        {
          provider: 'AWS',
          dataStores: ['S3']
        }
      ]
    },
    violationType: 'PUBLIC_ACCESS',
    remediation: {
      remediationType: 'DISABLE_PUBLIC_ACCESS',
      autoRemediate: true,
      remediationPriority: 'HIGH',
      remediationDue: {
        value: 2,
        unit: 'HOURS'
      }
    }
  }
};