import { unixfs } from '@helia/unixfs'
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { webRTCStar } from '@libp2p/webrtc-star'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { webTransport } from '@libp2p/webtransport'
import { multiaddr } from '@multiformats/multiaddr'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'

const App = async () => {
// https://github.com/ipfs/helia/blob/main/packages/helia/src/utils/bootstrappers.ts
  const bootstrapConfig = {
    list: [
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
      '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
      '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
    ]
  }

  const star = webRTCStar()

  /*
    {
    libp2p: {
      // https://github.com/ipfs/helia/blob/main/packages/helia/src/utils/libp2p-defaults.browser.ts#L27
      addresses: {
        listen: [
          '/webrtc', '/wss', '/ws',
          '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star' // see
        ]
      },
      transports: [
        webRTC(), webRTCDirect(),
        webTransport(),
        // https://github.com/libp2p/js-libp2p-websockets#libp2p-usage-example
        webSockets({ filter: filters.all }),
        circuitRelayTransport({ discoverRelays: 1 }),
        star.transport
      ],
      peerDiscovery: [bootstrap(bootstrapConfig), star.discovery],
      // https://github.com/libp2p/js-libp2p/blob/master/doc/CONFIGURATION.md#configuring-connection-gater
      connectionGater: {
        denyDialMultiaddr: async (...args) => false
      }
    }
  }
     */
  const node1 = await createHelia({
    libp2p: {
      addresses: {
        listen: [
          '/webrtc', '/wss', '/ws',
          '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star' // see
        ]
      },
      transports: [
        webRTC(), webRTCDirect(),
        webTransport(),
        // https://github.com/libp2p/js-libp2p-websockets#libp2p-usage-example
        webSockets({ filter: filters.all }),
        circuitRelayTransport({ discoverRelays: 1 }),
        // star.transport
      ]
    }
  })// tcp network, stored on memory (not use files)

  console.log('sssssssssssssssss', star.transport())
}
// const App = async () => {
//   const DOM = {
//     output: () => document.getElementById('output'),
//     fileName: () => document.getElementById('file-name'),
//     fileContent: () => document.getElementById('file-content'),
//     addBtn: () => document.getElementById('add-submit'),
//     terminal: () => document.getElementById('terminal'),
//     peers: () => document.getElementById('peers'),
//     dialQueue: () => document.getElementById('dialQueue'),
//     multiaddrs: () => document.getElementById('multiaddrs')
//   }
//
//   const COLORS = {
//     active: '#357edd',
//     success: '#0cb892',
//     error: '#ea5037'
//   }
//
//   const scrollToBottom = () => {
//     const terminal = DOM.terminal()
//     terminal.scroll({ top: terminal.scrollHeight, behavior: 'smooth' })
//   }
//
//   const showStatus = (text, bg, id = null) => {
//     const log = DOM.output()
//
//     const line = document.createElement('p')
//     line.innerHTML = text
//     line.style.color = bg
//
//     if (id) {
//       line.id = id
//     }
//
//     log.appendChild(line)
//
//     scrollToBottom(log)
//   }
//
//   const cat = async (cid) => {
//     const decoder = new TextDecoder()
//     let content = ''
//
//     for await (const chunk of fs.cat(cid)) {
//       content += decoder.decode(chunk, {
//         stream: true
//       })
//     }
//
//     return content
//   }
//
//   const store = async (name, content) => {
//     const id = helia.libp2p.peerId
//     showStatus(`Helia node peer ID ${id}`, COLORS.active)
//
//     const fileToAdd = {
//       path: `${name}`,
//       content: new TextEncoder().encode(content)
//     }
//
//     showStatus(`Adding file ${fileToAdd.path}`, COLORS.active)
//     const cid = await fs.addFile(fileToAdd)
//
//     showStatus(`Added ${cid}`, COLORS.success, cid)
//     showStatus('Reading file', COLORS.active)
//
//     const text = await cat(cid)
//
//     showStatus(`\u2514\u2500 ${name} ${text.toString()}`)
//     showStatus(`Preview: <a href="https://ipfs.io/ipfs/${cid}">https://ipfs.io/ipfs/${cid}</a>`, COLORS.success)
//   }
//
//   // Event listeners
//   DOM.addBtn().onclick = async (e) => {
//     e.preventDefault()
//     let name = DOM.fileName().value
//     let content = DOM.fileContent().value
//
//     try {
//       if (name == null || name.trim() === '') {
//         showStatus('Set default name', COLORS.active)
//         name = 'test.txt'
//       }
//
//       if ((content == null || content.trim() === '')) {
//         showStatus('Set default content', COLORS.active)
//         content = 'Hello world!'
//       }
//
//       await store(name, content)
//     } catch (err) {
//       showStatus(err.message, COLORS.error)
//     }
//   }
//
//   showStatus('Creating Helia node', COLORS.active)
//
//   const helia = await createHelia()
//
//   showStatus('Helia node ready', COLORS.active)
//
//   const fs = unixfs(helia)
//
//   setInterval(() => {
//     let peers = ''
//
//     for (const connection of helia.libp2p.getConnections()) {
//       peers += `${connection.remotePeer.toString()}\n`
//     }
//
//     if (peers === '') {
//       peers = 'Not connected to any peers'
//     }
//
//     DOM.peers().innerText = peers
//
//     let dialQueue = ''
//
//     for (const dial of helia.libp2p.getDialQueue()) {
//       dialQueue += `${dial.peerId} - ${dial.status}\n${dial.multiaddrs.map(ma => ma.toString()).join('\n')}\n`
//     }
//
//     if (dialQueue === '') {
//       dialQueue = 'Dial queue empty'
//     }
//
//     DOM.dialQueue().innerText = dialQueue
//
//     let multiaddrs = ''
//
//     for (const ma of helia.libp2p.getMultiaddrs()) {
//       multiaddrs += `${ma.toString()}\n`
//     }
//
//     if (multiaddrs === '') {
//       multiaddrs = 'Not listening on any addresses'
//     }
//
//     DOM.multiaddrs().innerText = multiaddrs
//   }, 500)
// }
//
App().catch(err => {
  console.error(err) // eslint-disable-line no-console
})
