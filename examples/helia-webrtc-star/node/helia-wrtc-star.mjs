// helia
import * as helia from "helia";
import {unixfs} from "@helia/unixfs";
import {CID} from "multiformats/cid";
import {multiaddr} from "@multiformats/multiaddr";

// modules required for helia creation on nodejs
// transports
import {tcp} from "@libp2p/tcp";
import {webSockets} from "@libp2p/websockets";
import {webRTC, webRTCDirect} from "@libp2p/webrtc";
import {circuitRelayTransport, circuitRelayServer} from "libp2p/circuit-relay";
// peerDiscovery
import {mdns} from "@libp2p/mdns";
import {bootstrap} from "@libp2p/bootstrap";
// contentRouters
import {ipniContentRouting} from "@libp2p/ipni-content-routing";

//wrtc-star
import {sigServer} from "@libp2p/webrtc-star-signalling-server";
import {webRTCStar} from "@libp2p/webrtc-star";
import wrtc from "@koush/wrtc";

// repl
import * as repl from "node:repl";


// for webrtc-star
const sig = await sigServer({
  host: "0.0.0.0",
  port: 9090,
});
const sigAddr = "/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star";

// https://github.com/ipfs/helia/blob/main/packages/helia/src/utils/bootstrappers.ts
const bootstrapConfig = {
  list: [
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  ]
};


const star = webRTCStar({wrtc});
// https://github.com/ipfs/helia/blob/main/packages/helia/src/index.ts
const node = await helia.createHelia({libp2p: {
  addresses: {
    listen: [
      "/ip4/0.0.0.0/tcp/0",
      "/ip4/0.0.0.0/tcp/0/ws",
      //"/ip4/0.0.0.0/tcp/0/wss",
      sigAddr,
    ]
  },
  transports: [
    tcp(),
    webSockets({websocket: {rejectUnauthorized: false}}),
    circuitRelayTransport({discoverRelays: 1}),
    star.transport,
  ],
  peerDiscovery: [mdns(), bootstrap(bootstrapConfig), star.discovery],
  // from https://github.com/libp2p/js-libp2p-webtransport/blob/main/examples/fetch-file-from-kubo/src/libp2p.ts
  connectionGater: {denyDialMultiaddr: async () => false},
}});

// libp2p dialProtocol examples
const proto = "/my-echo/0.1";
const handler = ({connection, stream}) => {
  stream.sink(async function* () {
    for await (const bufs of stream.source) {
      yield bufs.slice().slice();
    }
  }());
};
await node.libp2p.handle(proto, handler);
const send = async (ma, msg) => {
  if (typeof ma === "string") ma = multiaddr(ma);
  const stream = await node.libp2p.dialProtocol(ma, proto);
  stream.sink(async function* () {
    yield (new TextEncoder().encode(msg));
  }());
  for await (const bufs of stream.source) {
    return new TextDecoder().decode(bufs.slice().slice());
  }
};

// ipfs examples
console.log("[multiaddrs]");
console.log(node.libp2p.getMultiaddrs().map(ma => `${ma}`));

console.log("[serve example data] try to access the CID from other node");
const nodefs = unixfs(node);
const blob = new Blob([new TextEncoder().encode("Hello World!")], {type: "text/plain;charset=utf-8"});
const cid = await nodefs.addByteStream(blob.stream());
console.log(cid);
const cidStr = cid.toString();
const cidAlt = CID.parse(cidStr);
const ret1 = await node.pins.add(cidAlt); //NOTE: pins not accept CID string
console.log(ret1);

// control with repl
console.log("To stop with Ctrl+D");
const stop = () => Promise.all([node.stop(), sig.stop()]);
const rs = repl.start({
  prompt: "> ",
});
rs.once("exit", () => {
  stop().then(() => {
    console.log("node and sig stopped...");
    rs.close();
  }).catch(console.error);
});
Object.assign(rs.context, {
  node, nodefs, CID, multiaddr, send,
});
//await Promise.all([node.stop(), sig.stop()]);
