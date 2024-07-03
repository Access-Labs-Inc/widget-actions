import { Connection } from '@solana/web3.js';
import { ClusterTarget } from '../constants';
import env from "../../../libs/env";

export class PublicConnection {
  private static instance: PublicConnection;
  private _connection: Connection;

  private constructor(private _targetCluster: ClusterTarget) {
    this._connection = new Connection(
      env.SOLANA_RPC_URL,
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
