import { HttpAgent } from "@icp-sdk/core/agent";
import { useEffect, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

/**
 * Returns a StorageClient instance wired to the platform's blob storage.
 * The client is recreated whenever the user's identity changes.
 */
export function useStorageClient(): { storageClient: StorageClient | null } {
  const { identity } = useInternetIdentity();
  const [storageClient, setStorageClient] = useState<StorageClient | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const config = await loadConfig();

        const agent = new HttpAgent({
          identity: identity ?? undefined,
          host: config.backend_host,
        });

        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {
            // Ignore errors in non-local environments
          });
        }

        const client = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        if (!cancelled) {
          setStorageClient(client);
        }
      } catch (err) {
        console.error(
          "[useStorageClient] Failed to initialise StorageClient:",
          err,
        );
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [identity]);

  return { storageClient };
}
