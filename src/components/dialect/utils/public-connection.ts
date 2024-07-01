import { clusterApiUrl, Connection } from '@solana/web3.js';
import { ClusterTarget } from '../constants';

export class PublicConnection {
  private static instance: PublicConnection;
  private _connection: Connection;

  private constructor(private _targetCluster: ClusterTarget) {
    this._connection = new Connection(
      _targetCluster === 'mainnet'
        ? process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl('mainnet-beta')
        : process.env.NEXT_PUBLIC_RPC_URL_DEVNET || clusterApiUrl('devnet'),
      'confirmed',
    );
  }

  public get connection() {
    return this._connection;
  }

  public get cluster() {
    return this._targetCluster;
  }

  static getInstance(targetVersion: ClusterTarget = 'mainnet') {
    if (
      !PublicConnection.instance ||
      PublicConnection.instance.cluster !== targetVersion
    ) {
      PublicConnection.instance = new PublicConnection(targetVersion);
    }

    return PublicConnection.instance;
  }
}
