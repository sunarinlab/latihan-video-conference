const socketIO = io("http://localhost:3000");
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
};

let peerConnection;
const video_broadcast = document.getElementById("my-camera");

socketIO.on("connect", () => {
  socketIO.emit("watcher");
});

socketIO.on("offer", (broadcaster_id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socketIO.emit("answer", broadcaster_id, peerConnection.localDescription);
    });

  peerConnection.ontrack = (event) => {
    video_broadcast.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socketIO.emit("candidate", broadcaster_id, event.candidate);
    }
  };
});

socketIO.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch((e) => console.error(e));
});

// KETIKA ADA BROADCASTER BARU
socketIO.on("broadcaster", () => {
  socketIO.emit("watcher");
});

// CLOSE CONNECTION
window.onunload = window.onbeforeunload = () => {
  peerConnection.close();
  socketIO.close();
};
