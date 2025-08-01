import {
  CredentialsMethod,
  OpenFgaClient,
  TelemetryAttribute,
  type TelemetryConfig,
  TelemetryMetric,
} from '@openfga/sdk';
import type { AuthCredentialsConfig } from '@openfga/sdk/dist/credentials/types';

import { appEnvVariables } from '../utils/env.ts';

const {
  FGA_API_AUDIENCE,
  FGA_API_TOKEN_ISSUER,
  FGA_API_URL,
  FGA_CLIENT_ID,
  FGA_CLIENT_SECRET,
  FGA_STORE_ID,
} = appEnvVariables;

let credentials: AuthCredentialsConfig | undefined;
if (
  FGA_CLIENT_ID &&
  FGA_CLIENT_SECRET &&
  FGA_API_AUDIENCE &&
  FGA_API_TOKEN_ISSUER
) {
  credentials = {
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: FGA_CLIENT_ID,
      clientSecret: FGA_CLIENT_SECRET,
      apiAudience: FGA_API_AUDIENCE,
      apiTokenIssuer: FGA_API_TOKEN_ISSUER,
    },
  };
}

const TELEMETRY_CONFIG: TelemetryConfig = {
  metrics: {
    [TelemetryMetric.CounterCredentialsRequest]: {
      attributes: new Set([
        TelemetryAttribute.UrlScheme,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.HttpRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
    [TelemetryMetric.HistogramRequestDuration]: {
      attributes: new Set([
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
    [TelemetryMetric.HistogramQueryDuration]: {
      attributes: new Set([
        TelemetryAttribute.FgaClientRequestBatchCheckSize,
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ]),
    },
  },
};

/**
 * OpenFGA client instance configured with the necessary credentials and telemetry.
 *
 * This client is used to interact with the OpenFGA API for authorization checks.
 */
const fgaClient =
  FGA_STORE_ID === '< MISSING STORE ID >'
    ? null // TODO: require store ID; `fgaClient` should be non-nullable
    : new OpenFgaClient({
        apiUrl: FGA_API_URL,
        storeId: FGA_STORE_ID,
        credentials,
        telemetry: TELEMETRY_CONFIG,
      });

export default fgaClient;
