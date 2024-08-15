export class PC {
  private pc: RTCPeerConnection;
  constructor(pc: RTCPeerConnection) {
    this.pc = pc;
  }
  createOffer = async () => {
    try {
      const createdOffer = await this.pc?.createOffer();
      await this.pc?.setLocalDescription(createdOffer);
      return createdOffer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };
  createAnswer = async () => {
    try {
      const createdanswer = await this.pc?.createAnswer();
      await this.pc?.setLocalDescription(createdanswer);
      console.log("offer created on peerconnection");
      return createdanswer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };
}
