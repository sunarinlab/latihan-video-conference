// KONEK KE SERVER SOCKET IO
const socketIO = io("http://localhost:3000");
const message_input = document.getElementById("message-input");
const list_messages = document.getElementById("message-box");

socketIO.on("connect", () => {
  console.log("tersambung ");

  socketIO.on("new-message", (message, sender) => {
    var new_item = document.createElement("LI");
    var new_message = document.createTextNode(message + " By " + sender);
    new_item.appendChild(new_message);
    list_messages.appendChild(new_item);
  });
});

function sendMessage() {
  socketIO.emit("message", message_input.value);
}

const constraints = {
  video: true,
};

const my_camera_video_player = document.getElementById("my-camera");

async function playCameraVideo() {
  try {
    var camera_device = await navigator.mediaDevices.getUserMedia(constraints);
    my_camera_video_player.srcObject = camera_device;
  } catch (error) {
    console.error("Error opening camera. " + error);
  }
}

playCameraVideo();

function startBroadcasting() {
  socketIO.emit("broadcasting");
}

const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
};

socketIO.on("watcher", (watcher_id) => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[watcher_id] = peerConnection;

  let stream = my_camera_video_player.srcObject;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("kirim candidate");
      socketIO.emit("candidate", watcher_id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then((sdp) => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socketIO.emit("offer", watcher_id, peerConnection.localDescription);
    });
});

socketIO.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socketIO.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socketIO.on("disconnectPeer", (id) => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socketIO.close();
};
